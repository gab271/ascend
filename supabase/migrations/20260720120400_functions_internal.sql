-- ============================================================================
-- 005 — Internal machinery (private schema) + triggers
-- ============================================================================
-- Everything here lives in `private`, which PostgREST does not expose. These
-- functions take a user_id and write XP directly — if any of them were
-- callable from the browser the whole economy would be forgeable.
--
-- Every SECURITY DEFINER function sets `search_path = ''` and fully qualifies
-- its references. Without that, a user can create objects in a schema they
-- control and hijack the function's elevated privileges. This is the standard
-- Postgres privilege-escalation vector.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Timezone helpers
-- ----------------------------------------------------------------------------
create or replace function private.is_valid_timezone(p_tz text)
returns boolean
language sql
stable
as $$
  select exists (select 1 from pg_timezone_names where name = p_tz);
$$;

-- THE timezone rule, in one place:
--   local_date = (instant in user's zone) - (cutoff hours), truncated to a day
--
-- With the default 4am cutoff, an event at 01:30 on the 15th returns the 14th.
create or replace function private.local_date_for(p_user_id uuid, p_ts timestamptz default now())
returns date
language sql
stable
security definer
set search_path = ''
as $$
  select ((p_ts at time zone p.timezone) - make_interval(hours => p.day_cutoff_hour))::date
  from public.profiles p
  where p.id = p_user_id;
$$;

-- Postgres weeks start Monday, which matches the app.
create or replace function private.week_start_for(p_date date)
returns date
language sql
immutable
as $$
  select date_trunc('week', p_date)::date;
$$;


-- ----------------------------------------------------------------------------
-- stable_random — a deterministic value in [0, 1) derived from a seed string.
--
-- Used to pick daily missions and shop rotations. Deterministic on purpose:
-- seeding with (item, user, date) means refreshing the page cannot reroll your
-- missions, and the same day always produces the same result — which also
-- makes the selection reproducible when debugging.
--
-- bit(32)::int yields a SIGNED value, so 2^31 is added to shift it into
-- [0, 2^32) before scaling.
-- ----------------------------------------------------------------------------
create or replace function private.stable_random(p_seed text)
returns numeric
language sql
immutable
as $$
  select ((('x' || substr(md5(p_seed), 1, 8))::bit(32)::int)::bigint + 2147483648::bigint)::numeric
         / 4294967296::numeric;
$$;


-- ----------------------------------------------------------------------------
-- Generic triggers
-- ----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

-- Timezone validity (CHECK constraints cannot contain the required subquery).
create or replace function private.validate_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_valid_timezone(new.timezone) then
    raise exception 'Invalid IANA timezone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger profiles_validate
  before insert or update of timezone on public.profiles
  for each row execute function private.validate_profile();


-- ----------------------------------------------------------------------------
-- Append-only enforcement.
--
-- This is what makes "append-only" a property of the DATABASE rather than a
-- promise made by application code. Even the service role hits this.
-- ----------------------------------------------------------------------------
create or replace function private.block_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception
    'Table %.% is append-only. Insert a compensating row instead of % .',
    tg_table_schema, tg_table_name, tg_op
    using errcode = '0A000';
end;
$$;

create trigger ledger_events_append_only
  before update or delete on public.ledger_events
  for each row execute function private.block_mutation();

create trigger user_achievements_append_only
  before update on public.user_achievements
  for each row execute function private.block_mutation();


-- ----------------------------------------------------------------------------
-- New user bootstrap.
--
-- Reads raw_user_meta_data.username — exactly what src/lib/api/auth.js already
-- sends on signUp(). Sanitises it and resolves collisions rather than failing
-- signup, because a username clash must never cost a user their account.
-- ----------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_base     text;
  v_username text;
  v_suffix   int := 0;
  v_tz       text;
begin
  v_base := upper(coalesce(new.raw_user_meta_data ->> 'username', ''));
  v_base := regexp_replace(v_base, '[^A-Z0-9_]', '', 'g');

  if length(v_base) < 3 then
    v_base := 'ASCENDER';
  end if;
  v_base := left(v_base, 20);
  v_username := v_base;

  while exists (select 1 from public.profiles p where p.username = v_username::citext) loop
    v_suffix := v_suffix + 1;
    v_username := left(v_base, 19 - length(v_suffix::text)) || '_' || v_suffix::text;
  end loop;

  v_tz := coalesce(new.raw_user_meta_data ->> 'timezone', 'Europe/Madrid');
  if not private.is_valid_timezone(v_tz) then
    v_tz := 'Europe/Madrid';
  end if;

  insert into public.profiles (id, username, timezone)
  values (new.id, v_username::citext, v_tz);

  insert into public.user_stats (user_id) values (new.id);

  -- Give every new account the starter cosmetics so the profile is never bare.
  insert into public.user_items (user_id, item_id, acquired_via)
  select new.id, i.id, 'starter'
  from public.items i
  where i.acquisition = 'starter' and i.is_active
  on conflict do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();


-- ----------------------------------------------------------------------------
-- Streak computation — derived entirely from daily_activity.
--
-- A day counts if the user completed something OR a freeze covered it.
-- ----------------------------------------------------------------------------
create or replace function private.compute_streak(p_user_id uuid)
returns table (streak_current int, streak_longest int)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_today  date := private.local_date_for(p_user_id, now());
  v_cursor date;
  v_cur    int := 0;
  v_best   int := 0;
  v_run    int := 0;
  v_prev   date := null;
  r        record;
begin
  -- Current streak: walk backwards. If today is not yet active we start from
  -- yesterday, because the day is not over — an unfinished today must not
  -- read as a broken streak.
  v_cursor := v_today;
  if not exists (
    select 1 from public.daily_activity d
    where d.user_id = p_user_id and d.local_date = v_cursor
      and (d.counts_for_streak or d.freeze_applied)
  ) then
    v_cursor := v_today - 1;
  end if;

  while exists (
    select 1 from public.daily_activity d
    where d.user_id = p_user_id and d.local_date = v_cursor
      and (d.counts_for_streak or d.freeze_applied)
  ) loop
    v_cur := v_cur + 1;
    v_cursor := v_cursor - 1;
  end loop;

  -- Longest streak: one ordered pass over qualifying days.
  for r in
    select d.local_date
    from public.daily_activity d
    where d.user_id = p_user_id and (d.counts_for_streak or d.freeze_applied)
    order by d.local_date
  loop
    if v_prev is not null and r.local_date = v_prev + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    if v_run > v_best then
      v_best := v_run;
    end if;
    v_prev := r.local_date;
  end loop;

  streak_current := v_cur;
  streak_longest := greatest(v_best, v_cur);
  return next;
end;
$$;


-- ----------------------------------------------------------------------------
-- refresh_derived — recompute level + streak from totals already in user_stats.
-- ----------------------------------------------------------------------------
create or replace function private.refresh_derived(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_total  bigint;
  v_level  int;
  v_cum    bigint;
  v_next   bigint;
  v_streak record;
begin
  select s.total_xp into v_total from public.user_stats s where s.user_id = p_user_id;
  if v_total is null then
    return;
  end if;

  select lc.level, lc.cumulative_xp into v_level, v_cum
  from public.level_curve lc
  where lc.cumulative_xp <= v_total
  order by lc.cumulative_xp desc
  limit 1;

  if v_level is null then
    v_level := 1;
    v_cum   := 0;
  end if;

  select lc.cumulative_xp into v_next
  from public.level_curve lc
  where lc.level = v_level + 1;

  select * into v_streak from private.compute_streak(p_user_id);

  update public.user_stats s set
    level                  = v_level,
    xp_into_level          = (v_total - v_cum)::int,
    xp_next                = coalesce((v_next - v_cum)::int, 0),
    -- Assigned directly, not GREATEST'd against the stored value: compute_streak
    -- scans all history, so it is authoritative. This is what guarantees a
    -- recompute reproduces identical values.
    streak_current         = v_streak.streak_current,
    streak_longest         = v_streak.streak_longest,
    last_active_local_date = (
      select max(d.local_date) from public.daily_activity d
      where d.user_id = p_user_id and d.counts_for_streak
    ),
    recomputed_at          = now()
  where s.user_id = p_user_id;
end;
$$;


-- ----------------------------------------------------------------------------
-- apply_ledger_to_caches — the ONLY thing that maintains user_stats and
-- daily_activity during normal operation.
-- ----------------------------------------------------------------------------
create or replace function private.apply_ledger_to_caches()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mission_delta int;
begin
  v_mission_delta := case
    when new.kind in ('mission_daily', 'mission_weekly') then 1
    when new.kind = 'correction' and new.assignment_id is not null then -1
    else 0
  end;

  update public.user_stats s set
    total_xp        = s.total_xp + new.xp_delta,
    coins           = s.coins + new.coins_delta,
    stat_health     = s.stat_health
                        + case when new.attribute = 'health' then new.xp_delta else 0 end,
    stat_money      = s.stat_money
                        + case when new.attribute = 'money' then new.xp_delta else 0 end,
    stat_discipline = s.stat_discipline
                        + case when new.attribute = 'discipline' then new.xp_delta else 0 end
  where s.user_id = new.user_id;

  insert into public.daily_activity as da
    (user_id, local_date, missions_completed, xp_earned, coins_earned, counts_for_streak)
  values
    (new.user_id, new.local_date, v_mission_delta, new.xp_delta, new.coins_delta, v_mission_delta > 0)
  on conflict (user_id, local_date) do update set
    missions_completed = da.missions_completed + excluded.missions_completed,
    xp_earned          = da.xp_earned + excluded.xp_earned,
    coins_earned       = da.coins_earned + excluded.coins_earned;

  update public.daily_activity d
     set counts_for_streak = (d.missions_completed > 0)
   where d.user_id = new.user_id and d.local_date = new.local_date;

  perform private.refresh_derived(new.user_id);
  return null;
end;
$$;

create trigger ledger_events_apply_caches
  after insert on public.ledger_events
  for each row execute function private.apply_ledger_to_caches();


-- ----------------------------------------------------------------------------
-- write_ledger — the single entry point for creating XP/coin events.
--
-- Returns NULL when the idempotency key already exists, so callers can detect
-- a duplicate award instead of silently double-paying.
--
-- p_local_date overrides the computed day. Used by corrections so a reversal
-- lands on the day it is correcting, not the day it was issued — otherwise
-- undoing Monday's mission on Wednesday would decrement Wednesday and leave
-- both days' totals wrong.
-- ----------------------------------------------------------------------------
create or replace function private.write_ledger(
  p_user_id         uuid,
  p_kind            public.ledger_kind,
  p_xp              int,
  p_coins           int,
  p_attribute       public.attribute_type,
  p_idempotency_key text,
  p_assignment_id   bigint default null,
  p_achievement_id  uuid   default null,
  p_item_id         uuid   default null,
  p_reverses_id     bigint default null,
  p_notes           text   default null,
  p_local_date      date   default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
begin
  insert into public.ledger_events (
    user_id, kind, xp_delta, coins_delta, attribute, local_date,
    assignment_id, achievement_id, item_id, reverses_id, idempotency_key, notes
  )
  values (
    p_user_id, p_kind, p_xp, p_coins, p_attribute,
    coalesce(p_local_date, private.local_date_for(p_user_id, now())),
    p_assignment_id, p_achievement_id, p_item_id, p_reverses_id, p_idempotency_key, p_notes
  )
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_id;

  return v_id;
end;
$$;


-- ----------------------------------------------------------------------------
-- Streak freezes: bridge missed days, and grant new freezes.
-- Tunable constants are declared at the top of each function.
-- ----------------------------------------------------------------------------
create or replace function private.apply_freezes(p_user_id uuid)
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today  date := private.local_date_for(p_user_id, now());
  v_last   date;
  v_gap    date;
  v_banked int;
  v_used   int := 0;
  v_id     bigint;
begin
  select max(d.local_date) into v_last
  from public.daily_activity d
  where d.user_id = p_user_id and (d.counts_for_streak or d.freeze_applied);

  if v_last is null then
    return 0;
  end if;

  select count(*) into v_banked
  from public.streak_freezes f
  where f.user_id = p_user_id and f.consumed_for_date is null;

  v_gap := v_last + 1;
  while v_gap < v_today and v_banked > 0 loop
    select f.id into v_id
    from public.streak_freezes f
    where f.user_id = p_user_id and f.consumed_for_date is null
    order by f.granted_at
    limit 1;

    update public.streak_freezes set consumed_for_date = v_gap where id = v_id;

    insert into public.daily_activity (user_id, local_date, freeze_applied, counts_for_streak)
    values (p_user_id, v_gap, true, false)
    on conflict (user_id, local_date) do update set freeze_applied = true;

    v_banked := v_banked - 1;
    v_used   := v_used + 1;
    v_gap    := v_gap + 1;
  end loop;

  return v_used;
end;
$$;

create or replace function private.maybe_grant_freeze(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  c_every  constant int := 7;   -- one freeze per 7 consecutive days
  c_max    constant int := 3;   -- never bank more than 3
  v_streak int;
  v_banked int;
begin
  select s.streak_current into v_streak from public.user_stats s where s.user_id = p_user_id;
  if v_streak is null or v_streak = 0 or v_streak % c_every <> 0 then
    return false;
  end if;

  select count(*) into v_banked
  from public.streak_freezes f
  where f.user_id = p_user_id and f.consumed_for_date is null;

  if v_banked >= c_max then
    return false;
  end if;

  -- One grant per milestone, enforced by the source string being unique-ish.
  if exists (
    select 1 from public.streak_freezes f
    where f.user_id = p_user_id and f.source = 'streak:' || v_streak::text
  ) then
    return false;
  end if;

  insert into public.streak_freezes (user_id, source)
  values (p_user_id, 'streak:' || v_streak::text);

  return true;
end;
$$;


-- ----------------------------------------------------------------------------
-- evaluate_achievements — one evaluator, driven by the `criteria` jsonb.
-- Adding an achievement is an INSERT; this function never changes.
-- ----------------------------------------------------------------------------
create or replace function private.evaluate_achievements(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s      record;
  r      record;
  v_ok   boolean;
  v_val  bigint;
  v_out  jsonb := '[]'::jsonb;
begin
  select * into s from public.user_stats where user_id = p_user_id;
  if s is null then
    return v_out;
  end if;

  for r in
    select a.* from public.achievements a
    where a.is_active
      and not exists (
        select 1 from public.user_achievements ua
        where ua.user_id = p_user_id and ua.achievement_id = a.id
      )
  loop
    v_ok := false;

    case r.criteria ->> 'type'
      when 'streak_reach' then
        v_ok := s.streak_current >= (r.criteria ->> 'value')::int;
      when 'level_reach' then
        v_ok := s.level >= (r.criteria ->> 'value')::int;
      when 'total_xp' then
        v_ok := s.total_xp >= (r.criteria ->> 'value')::bigint;
      when 'attribute_xp' then
        v_val := case r.criteria ->> 'attribute'
                   when 'health'     then s.stat_health
                   when 'money'      then s.stat_money
                   when 'discipline' then s.stat_discipline
                   else 0
                 end;
        v_ok := v_val >= (r.criteria ->> 'value')::bigint;
      when 'missions_total' then
        select count(*) into v_val
        from public.mission_assignments ma
        where ma.user_id = p_user_id and ma.completed_at is not null;
        v_ok := v_val >= (r.criteria ->> 'value')::bigint;
      else
        v_ok := false;
    end case;

    if v_ok then
      insert into public.user_achievements (user_id, achievement_id)
      values (p_user_id, r.id)
      on conflict do nothing;

      if r.xp_reward > 0 or r.coins_reward > 0 then
        perform private.write_ledger(
          p_user_id, 'achievement', r.xp_reward, r.coins_reward, null,
          'achievement:' || r.id::text, null, r.id
        );
      end if;

      -- Unlock any cosmetics gated behind this achievement.
      insert into public.user_items (user_id, item_id, acquired_via)
      select p_user_id, i.id, 'achievement'
      from public.items i
      where i.unlock_achievement_id = r.id and i.is_active
      on conflict do nothing;

      v_out := v_out || jsonb_build_object(
        'code', r.code, 'name', r.name, 'rarity', r.rarity, 'icon', r.icon
      );
    end if;
  end loop;

  return v_out;
end;
$$;


-- ----------------------------------------------------------------------------
-- grant_level_items — cosmetics unlocked by reaching a level.
-- ----------------------------------------------------------------------------
create or replace function private.grant_level_items(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_items (user_id, item_id, acquired_via)
  select p_user_id, i.id, 'level'
  from public.items i, public.user_stats s
  where s.user_id = p_user_id
    and i.acquisition = 'level'
    and i.is_active
    and i.unlock_level <= s.level
  on conflict do nothing;
end;
$$;


-- ----------------------------------------------------------------------------
-- Equip validation: you must own it, and it must fit the slot.
-- ----------------------------------------------------------------------------
create or replace function private.validate_equipped_item()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type text;
begin
  select i.item_type into v_type from public.items i
  where i.id = new.item_id and i.is_active;

  if v_type is null then
    raise exception 'Item % does not exist or is inactive', new.item_id using errcode = '23503';
  end if;

  if v_type <> new.slot then
    raise exception 'Item % is a % and cannot go in slot %', new.item_id, v_type, new.slot
      using errcode = '23514';
  end if;

  if not exists (
    select 1 from public.user_items ui
    where ui.user_id = new.user_id and ui.item_id = new.item_id
  ) then
    raise exception 'User does not own item %', new.item_id using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger user_equipped_validate
  before insert or update on public.user_equipped
  for each row execute function private.validate_equipped_item();


-- ----------------------------------------------------------------------------
-- THE RECOVERY GUARANTEE.
--
-- Deletes every cached value and rebuilds it from ledger_events alone.
-- Running this must produce identical numbers — that property is the whole
-- point of the design, and test 7 in the checklist verifies it.
--
-- Scheduled nightly (007) so any drift self-heals within 24 hours instead of
-- compounding silently for months.
-- ----------------------------------------------------------------------------
create or replace function private.recompute_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.daily_activity where user_id = p_user_id;

  insert into public.daily_activity
    (user_id, local_date, missions_completed, xp_earned, coins_earned, counts_for_streak)
  select
    e.user_id,
    e.local_date,
    sum(case
          when e.kind in ('mission_daily', 'mission_weekly') then 1
          when e.kind = 'correction' and e.assignment_id is not null then -1
          else 0
        end)::int,
    sum(e.xp_delta)::int,
    sum(e.coins_delta)::int,
    false
  from public.ledger_events e
  where e.user_id = p_user_id
  group by e.user_id, e.local_date;

  update public.daily_activity d
     set counts_for_streak = (d.missions_completed > 0)
   where d.user_id = p_user_id;

  -- Re-apply consumed freezes (they may be the only reason a day exists).
  insert into public.daily_activity (user_id, local_date, freeze_applied, counts_for_streak)
  select f.user_id, f.consumed_for_date, true, false
  from public.streak_freezes f
  where f.user_id = p_user_id and f.consumed_for_date is not null
  on conflict (user_id, local_date) do update set freeze_applied = true;

  update public.user_stats s set
    total_xp        = t.total_xp,
    coins           = t.coins,
    stat_health     = t.h,
    stat_money      = t.m,
    stat_discipline = t.d
  from (
    select
      coalesce(sum(xp_delta), 0)::bigint    as total_xp,
      coalesce(sum(coins_delta), 0)::bigint as coins,
      coalesce(sum(case when attribute = 'health'     then xp_delta else 0 end), 0)::int as h,
      coalesce(sum(case when attribute = 'money'      then xp_delta else 0 end), 0)::int as m,
      coalesce(sum(case when attribute = 'discipline' then xp_delta else 0 end), 0)::int as d
    from public.ledger_events
    where user_id = p_user_id
  ) t
  where s.user_id = p_user_id;

  perform private.refresh_derived(p_user_id);
end;
$$;

create or replace function private.recompute_all_stats()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  r     record;
  v_num int := 0;
begin
  for r in select user_id from public.user_stats loop
    perform private.recompute_user_stats(r.user_id);
    v_num := v_num + 1;
  end loop;
  return v_num;
end;
$$;
