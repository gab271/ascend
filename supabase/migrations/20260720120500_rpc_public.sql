-- ============================================================================
-- 006 — Client-facing RPCs
-- ============================================================================
-- These are the ONLY way the browser can change anything. Every one of them:
--   * derives the user from auth.uid() — never from a client argument
--   * re-checks preconditions server-side (owns it, can afford it, assigned)
--   * sets search_path = ''
--
-- The client cannot INSERT into ledger_events at all (see 007), so XP, coins,
-- streaks and inventory are only ever changed by the logic below.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Session helper
-- ----------------------------------------------------------------------------
create or replace function private.require_uid()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  if exists (select 1 from public.profiles p where p.id = v_uid and p.deleted_at is not null) then
    raise exception 'Account is deleted' using errcode = '28000';
  end if;
  return v_uid;
end;
$$;


-- ----------------------------------------------------------------------------
-- ensure_daily_missions — idempotent. Safe to call on every page load.
--
-- Selection is a deterministic weighted sample: the md5 hash of
-- (mission, user, date) gives a stable pseudo-random score, divided by a
-- rarity weight so commons surface more often than legendaries. Deterministic
-- means refreshing the page cannot reroll your missions.
-- ----------------------------------------------------------------------------
create or replace function public.ensure_daily_missions()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_count constant int := 3;
  v_uid   uuid := private.require_uid();
  v_today date;
  v_prefs public.attribute_type[];
begin
  v_today := private.local_date_for(v_uid, now());

  if exists (
    select 1 from public.mission_assignments ma
    where ma.user_id = v_uid and ma.cadence = 'daily' and ma.period_start = v_today
  ) then
    return;
  end if;

  select p.mission_categories into v_prefs from public.profiles p where p.id = v_uid;

  insert into public.mission_assignments (user_id, mission_id, cadence, period_start)
  select v_uid, m.id, 'daily', v_today
  from public.missions m
  where m.is_active
    and m.cadence = 'daily'
    and m.attribute = any (v_prefs)
  -- Weighted sample without replacement: a stable random score divided by a
  -- rarity weight. Dividing by a larger weight pulls the score toward zero, so
  -- commons sort first more often and legendaries stay rare.
  order by private.stable_random(m.code || v_uid::text || v_today::text)
    / case m.rarity
        when 'common' then 8 when 'rare' then 4 when 'epic' then 2 else 1
      end
  limit c_count
  on conflict do nothing;
end;
$$;


create or replace function public.ensure_weekly_missions()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_count constant int := 3;
  v_uid   uuid := private.require_uid();
  v_week  date;
begin
  v_week := private.week_start_for(private.local_date_for(v_uid, now()));

  if exists (
    select 1 from public.mission_assignments ma
    where ma.user_id = v_uid and ma.cadence = 'weekly' and ma.period_start = v_week
  ) then
    return;
  end if;

  insert into public.mission_assignments (user_id, mission_id, cadence, period_start)
  select v_uid, m.id, 'weekly', v_week
  from public.missions m
  where m.is_active and m.cadence = 'weekly'
  order by private.stable_random(m.code || v_uid::text || v_week::text)
    / case m.rarity
        when 'common' then 8 when 'rare' then 4 when 'epic' then 2 else 1
      end
  limit c_count
  on conflict do nothing;
end;
$$;


-- ----------------------------------------------------------------------------
-- get_missions — today's dailies + this week's weeklies, in one round trip.
-- The client never computes a date; the server derives it from the profile.
-- ----------------------------------------------------------------------------
create or replace function public.get_missions()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := private.require_uid();
  v_today date;
  v_week  date;
begin
  v_today := private.local_date_for(v_uid, now());
  v_week  := private.week_start_for(v_today);

  return jsonb_build_object(
    'local_date', v_today,
    'week_start', v_week,
    'daily',  coalesce((select jsonb_agg(x order by x->>'code')
                        from (
      select jsonb_build_object(
        'assignment_id', ma.id,
        'code',          m.code,
        'name',          m.name,
        'description',   m.description,
        'attribute',     m.attribute,
        'rarity',        m.rarity,
        'icon',          m.icon,
        'xp',            m.xp_reward,
        'coins',         m.coins_reward,
        'target_value',  m.target_value,
        'target_unit',   m.target_unit,
        'completed',     ma.completed_at is not null,
        'completed_at',  ma.completed_at
      ) as x
      from public.mission_assignments ma
      join public.missions m on m.id = ma.mission_id
      where ma.user_id = v_uid and ma.cadence = 'daily' and ma.period_start = v_today
    ) s), '[]'::jsonb),
    'weekly', coalesce((select jsonb_agg(x order by x->>'code')
                        from (
      select jsonb_build_object(
        'assignment_id', ma.id,
        'code',          m.code,
        'name',          m.name,
        'description',   m.description,
        'attribute',     m.attribute,
        'rarity',        m.rarity,
        'icon',          m.icon,
        'xp',            m.xp_reward,
        'coins',         m.coins_reward,
        'completed',     ma.completed_at is not null,
        'completed_at',  ma.completed_at
      ) as x
      from public.mission_assignments ma
      join public.missions m on m.id = ma.mission_id
      where ma.user_id = v_uid and ma.cadence = 'weekly' and ma.period_start = v_week
    ) s), '[]'::jsonb)
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- complete_mission — the core write path.
--
-- Takes an ASSIGNMENT id, not a mission id: an assignment already encodes
-- which user and which period, so there is nothing for a caller to forge.
-- ----------------------------------------------------------------------------
create or replace function public.complete_mission(p_assignment_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := private.require_uid();
  a        record;
  m        record;
  v_today  date;
  v_event  bigint;
  v_bonus  int := 0;
  v_kind   public.ledger_kind;
  v_ach    jsonb;
  s        record;
  v_before int;
begin
  select * into a
  from public.mission_assignments ma
  where ma.id = p_assignment_id and ma.user_id = v_uid
  for update;

  if not found then
    return jsonb_build_object('success', false, 'reason', 'not_found');
  end if;

  if a.completed_at is not null then
    return jsonb_build_object('success', false, 'reason', 'already_completed');
  end if;

  -- Missions can only be completed within their own period. No retroactive
  -- logging (see docs §7 — flip this if you ever want a grace day).
  v_today := private.local_date_for(v_uid, now());
  if a.cadence = 'daily' and a.period_start <> v_today then
    return jsonb_build_object('success', false, 'reason', 'period_expired');
  end if;
  if a.cadence = 'weekly' and a.period_start <> private.week_start_for(v_today) then
    return jsonb_build_object('success', false, 'reason', 'period_expired');
  end if;

  select * into m from public.missions where id = a.mission_id;

  select s2.level into v_before from public.user_stats s2 where s2.user_id = v_uid;

  -- Spend banked freezes on any missed days BEFORE the streak is recomputed,
  -- otherwise the gap would break the streak a moment before it is bridged.
  perform private.apply_freezes(v_uid);

  v_kind := case when a.cadence = 'daily' then 'mission_daily' else 'mission_weekly' end;

  v_event := private.write_ledger(
    v_uid, v_kind, m.xp_reward, m.coins_reward, m.attribute,
    'mission:' || a.id::text, a.id
  );

  if v_event is null then
    return jsonb_build_object('success', false, 'reason', 'duplicate');
  end if;

  update public.mission_assignments ma set
    completed_at  = now(),
    xp_awarded    = m.xp_reward,
    coins_awarded = m.coins_reward
  where ma.id = a.id;

  -- Streak bonus is a pure function of streak length — never random. If it
  -- were random, replaying the ledger could not reproduce history and the
  -- ledger would stop being authoritative.
  select * into s from public.user_stats where user_id = v_uid;
  v_bonus := (s.streak_current / 7) * 10;

  if v_bonus > 0 then
    perform private.write_ledger(
      v_uid, 'streak_bonus', v_bonus, 0, m.attribute,
      'streak:' || a.id::text, a.id
    );
  end if;

  perform private.maybe_grant_freeze(v_uid);
  perform private.grant_level_items(v_uid);
  v_ach := private.evaluate_achievements(v_uid);

  select * into s from public.user_stats where user_id = v_uid;

  return jsonb_build_object(
    'success',          true,
    'xp_awarded',       m.xp_reward,
    'coins_awarded',    m.coins_reward,
    'streak_bonus',     v_bonus,
    'total_xp',         s.total_xp,
    'coins',            s.coins,
    'level',            s.level,
    'xp_into_level',    s.xp_into_level,
    'xp_next',          s.xp_next,
    'leveled_up',       s.level > v_before,
    'streak',           s.streak_current,
    'new_achievements', v_ach
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- uncomplete_mission — the correction path. Never deletes.
--
-- Writes a compensating ledger row with negated deltas and reverses_id
-- pointing at the original, so the full history survives.
-- ----------------------------------------------------------------------------
create or replace function public.uncomplete_mission(p_assignment_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
  a     record;
  e     record;
begin
  select * into a
  from public.mission_assignments ma
  where ma.id = p_assignment_id and ma.user_id = v_uid
  for update;

  if not found or a.completed_at is null then
    return jsonb_build_object('success', false, 'reason', 'not_completed');
  end if;

  for e in
    select le.* from public.ledger_events le
    where le.assignment_id = a.id
      and le.user_id = v_uid
      and le.reverses_id is null
      and le.kind in ('mission_daily', 'mission_weekly', 'streak_bonus')
      and not exists (
        select 1 from public.ledger_events r where r.reverses_id = le.id
      )
  loop
    -- e.local_date is passed through so the reversal lands on the day being
    -- corrected, keeping daily_activity and the streak walk accurate.
    perform private.write_ledger(
      v_uid, 'correction', -e.xp_delta, -e.coins_delta, e.attribute,
      'reverse:' || e.id::text, e.assignment_id, null, null, e.id,
      'Reversal of ledger event ' || e.id::text, e.local_date
    );
  end loop;

  update public.mission_assignments ma set
    completed_at = null, xp_awarded = null, coins_awarded = null
  where ma.id = a.id;

  perform private.refresh_derived(v_uid);

  return jsonb_build_object('success', true);
end;
$$;


-- ----------------------------------------------------------------------------
-- Shop
-- ----------------------------------------------------------------------------
create or replace function public.ensure_shop_rotation()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_size constant int := 6;
  v_uid  uuid := private.require_uid();
  v_date date;
begin
  -- The rotation is global, but "today" is the caller's local day, so someone
  -- in Auckland does not see an empty shop.
  v_date := private.local_date_for(v_uid, now());

  if exists (select 1 from public.shop_rotations sr where sr.rotation_date = v_date) then
    return;
  end if;

  insert into public.shop_rotations (rotation_date, item_id, price_coins, slot_index)
  select
    v_date,
    i.id,
    i.price_coins,
    row_number() over (order by private.stable_random(i.code || v_date::text))
  from public.items i
  where i.is_active and i.acquisition = 'shop'
  order by private.stable_random(i.code || v_date::text)
  limit c_size
  on conflict do nothing;
end;
$$;


create or replace function public.get_shop_rotation()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := private.require_uid();
  v_date date;
begin
  v_date := private.local_date_for(v_uid, now());

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'item_id',     i.id,
      'code',        i.code,
      'item_type',   i.item_type,
      'name',        i.name,
      'description', i.description,
      'rarity',      i.rarity,
      'config',      i.config,
      'price',       sr.price_coins,
      'owned',       ui.user_id is not null
    ) order by sr.slot_index)
    from public.shop_rotations sr
    join public.items i on i.id = sr.item_id
    left join public.user_items ui on ui.item_id = i.id and ui.user_id = v_uid
    where sr.rotation_date = v_date
  ), '[]'::jsonb);
end;
$$;


create or replace function public.purchase_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := private.require_uid();
  i       record;
  v_price int;
  v_event bigint;
  s       record;
begin
  select * into i from public.items where id = p_item_id and is_active;
  if not found then
    return jsonb_build_object('success', false, 'reason', 'item_not_found');
  end if;

  if i.acquisition <> 'shop' then
    return jsonb_build_object('success', false, 'reason', 'not_purchasable');
  end if;

  -- Price comes from the ROTATION, not the catalog — never trust a client
  -- price, and always charge what was actually on display.
  select sr.price_coins into v_price
  from public.shop_rotations sr
  where sr.rotation_date = private.local_date_for(v_uid, now())
    and sr.item_id = p_item_id;

  if v_price is null then
    return jsonb_build_object('success', false, 'reason', 'not_in_rotation');
  end if;

  if exists (
    select 1 from public.user_items ui where ui.user_id = v_uid and ui.item_id = p_item_id
  ) then
    return jsonb_build_object('success', false, 'reason', 'already_owned');
  end if;

  -- Lock the row: this plus the coins >= 0 CHECK makes concurrent purchases
  -- safe. If two requests race, the second aborts on the constraint.
  select * into s from public.user_stats where user_id = v_uid for update;

  if s.coins < v_price then
    return jsonb_build_object(
      'success', false, 'reason', 'insufficient_coins',
      'coins', s.coins, 'price', v_price
    );
  end if;

  v_event := private.write_ledger(
    v_uid, 'purchase', 0, -v_price, null,
    'purchase:' || p_item_id::text, null, null, p_item_id
  );

  if v_event is null then
    return jsonb_build_object('success', false, 'reason', 'duplicate');
  end if;

  insert into public.user_items (user_id, item_id, acquired_via, ledger_event_id)
  values (v_uid, p_item_id, 'shop', v_event);

  select * into s from public.user_stats where user_id = v_uid;

  return jsonb_build_object(
    'success',         true,
    'item_code',       i.code,
    'coins_spent',     v_price,
    'coins_remaining', s.coins
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- Loadout
-- ----------------------------------------------------------------------------
create or replace function public.equip_item(p_item_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := private.require_uid();
  v_slot text;
begin
  select i.item_type into v_slot from public.items i where i.id = p_item_id and i.is_active;
  if v_slot is null then
    return jsonb_build_object('success', false, 'reason', 'item_not_found');
  end if;

  -- Ownership is also enforced by trigger; checked here for a clean message.
  if not exists (
    select 1 from public.user_items ui where ui.user_id = v_uid and ui.item_id = p_item_id
  ) then
    return jsonb_build_object('success', false, 'reason', 'not_owned');
  end if;

  insert into public.user_equipped (user_id, slot, item_id)
  values (v_uid, v_slot, p_item_id)
  on conflict (user_id, slot)
    do update set item_id = excluded.item_id, equipped_at = now();

  return jsonb_build_object('success', true, 'slot', v_slot);
end;
$$;


create or replace function public.unequip_slot(p_slot text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  delete from public.user_equipped where user_id = v_uid and slot = p_slot;
  return jsonb_build_object('success', true);
end;
$$;


-- ----------------------------------------------------------------------------
-- Profile
-- ----------------------------------------------------------------------------
create or replace function public.get_my_profile()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
  p     record;
  s     record;
  t     record;
begin
  select * into p from public.profiles where id = v_uid;
  select * into s from public.user_stats where user_id = v_uid;

  select rt.* into t
  from public.rank_tiers rt
  where rt.min_total_xp <= s.total_xp
  order by rt.min_total_xp desc
  limit 1;

  return jsonb_build_object(
    'id',                 p.id,
    'username',           p.username,
    'avatar_url',         p.avatar_url,
    'timezone',           p.timezone,
    'day_cutoff_hour',    p.day_cutoff_hour,
    'mission_categories', to_jsonb(p.mission_categories),
    'onboarded',          p.onboarded_at is not null,
    'created_at',         p.created_at,
    'total_xp',           s.total_xp,
    'coins',              s.coins,
    'level',              s.level,
    'xp',                 s.xp_into_level,
    'xp_next',            s.xp_next,
    'streak',             s.streak_current,
    'longest_streak',     s.streak_longest,
    'stat_health',        s.stat_health,
    'stat_money',         s.stat_money,
    'stat_discipline',    s.stat_discipline,
    'tier', case when t.code is null then null else jsonb_build_object(
      'code', t.code, 'name', t.name, 'icon', t.icon, 'color', t.color
    ) end,
    'freezes_banked', (
      select count(*) from public.streak_freezes f
      where f.user_id = v_uid and f.consumed_for_date is null
    ),
    'equipped', coalesce((
      select jsonb_object_agg(ue.slot, jsonb_build_object(
        'item_id', i.id, 'code', i.code, 'name', i.name,
        'rarity', i.rarity, 'config', i.config
      ))
      from public.user_equipped ue
      join public.items i on i.id = ue.item_id
      where ue.user_id = v_uid
    ), '{}'::jsonb)
  );
end;
$$;


create or replace function public.update_username(p_username text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := private.require_uid();
  v_clean text := upper(trim(p_username));
begin
  if v_clean !~ '^[A-Z0-9_]{3,20}$' then
    return jsonb_build_object('success', false, 'reason', 'invalid_format');
  end if;

  if exists (
    select 1 from public.profiles p where p.username = v_clean::citext and p.id <> v_uid
  ) then
    return jsonb_build_object('success', false, 'reason', 'taken');
  end if;

  update public.profiles set username = v_clean::citext where id = v_uid;
  return jsonb_build_object('success', true, 'username', v_clean);
end;
$$;


create or replace function public.update_avatar_url(p_avatar_url text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  -- Only accept URLs inside this project's own avatars bucket, and only under
  -- the caller's own folder. Without this an attacker could point their avatar
  -- at any URL, turning profile rendering into an SSRF/tracking vector.
  if p_avatar_url !~ ('^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/avatars/'
                      || v_uid::text || '/') then
    return jsonb_build_object('success', false, 'reason', 'invalid_url');
  end if;

  update public.profiles set avatar_url = p_avatar_url where id = v_uid;
  return jsonb_build_object('success', true);
end;
$$;


create or replace function public.update_timezone(p_timezone text, p_cutoff_hour int default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  if not private.is_valid_timezone(p_timezone) then
    return jsonb_build_object('success', false, 'reason', 'invalid_timezone');
  end if;
  if p_cutoff_hour is not null and (p_cutoff_hour < 0 or p_cutoff_hour > 23) then
    return jsonb_build_object('success', false, 'reason', 'invalid_cutoff');
  end if;

  -- Past local_date values are deliberately NOT recomputed. Shifting history
  -- would merge or split days and silently break streaks.
  update public.profiles set
    timezone        = p_timezone,
    day_cutoff_hour = coalesce(p_cutoff_hour, day_cutoff_hour)
  where id = v_uid;

  return jsonb_build_object('success', true);
end;
$$;


create or replace function public.update_mission_preferences(p_categories public.attribute_type[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  if p_categories is null or array_length(p_categories, 1) is null then
    return jsonb_build_object('success', false, 'reason', 'empty');
  end if;

  update public.profiles set mission_categories = p_categories where id = v_uid;
  return jsonb_build_object('success', true);
end;
$$;


create or replace function public.complete_onboarding(p_categories public.attribute_type[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := private.require_uid();
  v_today date;
begin
  if p_categories is null or array_length(p_categories, 1) is null then
    return jsonb_build_object('success', false, 'reason', 'empty');
  end if;

  update public.profiles set
    mission_categories = p_categories,
    onboarded_at       = coalesce(onboarded_at, now())
  where id = v_uid;

  -- Drop any missions assigned before preferences existed, then re-assign
  -- with them. Safe because none of them can have been completed yet.
  v_today := private.local_date_for(v_uid, now());
  delete from public.mission_assignments ma
  where ma.user_id = v_uid
    and ma.cadence = 'daily'
    and ma.period_start = v_today
    and ma.completed_at is null
    and not exists (
      select 1 from public.ledger_events le where le.assignment_id = ma.id
    );

  perform public.ensure_daily_missions();
  perform public.ensure_weekly_missions();

  return jsonb_build_object('success', true);
end;
$$;


-- ----------------------------------------------------------------------------
-- get_weekly_xp — always returns exactly 7 rows, Monday..Sunday.
--
-- Replaces the client-side week maths in src/lib/api/profile.js, which built
-- the week in BROWSER-local time and sent it to a UTC database.
-- ----------------------------------------------------------------------------
create or replace function public.get_weekly_xp()
returns table (day date, xp_earned int)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := private.require_uid();
  v_week date;
begin
  v_week := private.week_start_for(private.local_date_for(v_uid, now()));

  return query
  select g::date, coalesce(da.xp_earned, 0)
  from generate_series(v_week, v_week + 6, interval '1 day') g
  left join public.daily_activity da
    on da.user_id = v_uid and da.local_date = g::date
  order by g;
end;
$$;


-- ----------------------------------------------------------------------------
-- get_leaderboard — the ONLY way to see other users.
--
-- profiles is not directly selectable by other users, so "show the ladder"
-- cannot quietly become "dump every user row". This returns display fields
-- only: no email, no timezone, no preferences.
-- ----------------------------------------------------------------------------
create or replace function public.get_leaderboard(p_limit int default 50, p_offset int default 0)
returns table (
  rank       bigint,
  user_id    uuid,
  username   text,
  avatar_url text,
  level      int,
  total_xp   bigint,
  streak     int,
  tier_code  text,
  tier_name  jsonb,
  title_name jsonb,
  is_me      boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    rank() over (order by s.total_xp desc, p.created_at asc),
    p.id,
    p.username::text,
    p.avatar_url,
    s.level,
    s.total_xp,
    s.streak_current,
    t.code,
    t.name,
    ti.name,
    p.id = auth.uid()
  from public.user_stats s
  join public.profiles p on p.id = s.user_id
  left join lateral (
    select rt.code, rt.name
    from public.rank_tiers rt
    where rt.min_total_xp <= s.total_xp
    order by rt.min_total_xp desc
    limit 1
  ) t on true
  left join public.user_equipped ue on ue.user_id = p.id and ue.slot = 'title'
  left join public.items ti on ti.id = ue.item_id
  where p.deleted_at is null
  order by s.total_xp desc, p.created_at asc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
$$;


create or replace function public.get_my_rank()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
  v_rank bigint;
  v_total bigint;
begin
  select count(*) + 1 into v_rank
  from public.user_stats s
  join public.profiles p on p.id = s.user_id
  where p.deleted_at is null
    and s.total_xp > (select s2.total_xp from public.user_stats s2 where s2.user_id = v_uid);

  select count(*) into v_total
  from public.user_stats s
  join public.profiles p on p.id = s.user_id
  where p.deleted_at is null;

  return jsonb_build_object('rank', v_rank, 'total_players', v_total);
end;
$$;


-- ----------------------------------------------------------------------------
-- Rewards catalog — everything ownable, with an `owned` flag. One round trip
-- instead of the six parallel queries in src/lib/api/profile.js.
-- ----------------------------------------------------------------------------
create or replace function public.get_rewards_catalog()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  return jsonb_build_object(
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'item_id',      i.id,
        'code',         i.code,
        'item_type',    i.item_type,
        'name',         i.name,
        'description',  i.description,
        'rarity',       i.rarity,
        'config',       i.config,
        'acquisition',  i.acquisition,
        'price_coins',  i.price_coins,
        'unlock_level', i.unlock_level,
        'owned',        ui.user_id is not null,
        'equipped',     ue.user_id is not null
      ) order by i.item_type, i.rarity, i.code)
      from public.items i
      left join public.user_items ui on ui.item_id = i.id and ui.user_id = v_uid
      left join public.user_equipped ue on ue.item_id = i.id and ue.user_id = v_uid
      where i.is_active
    ), '[]'::jsonb),
    'achievements', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code',        a.code,
        'name',        a.name,
        'description', a.description,
        'rarity',      a.rarity,
        'icon',        a.icon,
        'xp_reward',   a.xp_reward,
        'unlocked',    ua.user_id is not null,
        'unlocked_at', ua.unlocked_at
      ) order by a.rarity, a.code)
      from public.achievements a
      left join public.user_achievements ua
        on ua.achievement_id = a.id and ua.user_id = v_uid
      where a.is_active
    ), '[]'::jsonb)
  );
end;
$$;


-- ----------------------------------------------------------------------------
-- Account deletion — soft first, hard later (see 007 for the purge job).
-- ----------------------------------------------------------------------------
create or replace function public.request_account_deletion()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  update public.profiles set deleted_at = now() where id = v_uid;
  return jsonb_build_object(
    'success', true,
    'purge_after', (now() + interval '30 days')
  );
end;
$$;
