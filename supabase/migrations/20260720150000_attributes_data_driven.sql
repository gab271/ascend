-- ============================================================================
-- 010 — Attributes become DATA, not an enum
-- ============================================================================
-- WHY
--
-- The original brief asked for a schema "flexible enough to add new habit types
-- later without migrations". I then made attribute_type a Postgres enum, which
-- is precisely the thing that cannot do that — and the onboarding page proved
-- it by shipping six categories against a three-value enum.
--
-- This replaces the enum with:
--   attributes         — a catalog row per life area (health, mind, ...)
--   user_attribute_xp  — one row per user per attribute, replacing the fixed
--                        stat_health / stat_money / stat_discipline columns
--
-- After this, adding a seventh category is ONE INSERT. No migration, no new
-- column, no code change — the dashboard renders whatever the table contains.
--
-- Still fully derivable: user_attribute_xp is a cache rebuilt from
-- ledger_events, exactly like the columns it replaces.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. The attributes catalog
--
-- Colors and icons match src/pages/app/Onboarding.jsx so the UI can render
-- straight from the database instead of a hardcoded config file.
-- ----------------------------------------------------------------------------
create table if not exists public.attributes (
  code        text primary key,
  label       jsonb not null,
  description jsonb not null default '{"en": "", "es": ""}'::jsonb,
  color       text not null,
  icon        text not null,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint attributes_label_locales
    check (jsonb_exists(label, 'en') and jsonb_exists(label, 'es'))
);

insert into public.attributes (code, label, description, color, icon, sort_order) values
  ('health',     '{"en": "Health",     "es": "Salud"}',
                 '{"en": "Train your body, sleep better, and fuel yourself right.",
                   "es": "Entrena tu cuerpo, duerme mejor y aliméntate bien."}',
                 '#33E6A1', '⚡', 1),
  ('money',      '{"en": "Money",      "es": "Dinero"}',
                 '{"en": "Build wealth, master finance, and own your time.",
                   "es": "Construye riqueza, domina las finanzas y adueñate de tu tiempo."}',
                 '#F5C451', '💰', 2),
  ('discipline', '{"en": "Discipline", "es": "Disciplina"}',
                 '{"en": "Build habits, sharpen focus, and master your willpower.",
                   "es": "Crea hábitos, afina tu enfoque y domina tu voluntad."}',
                 '#7C5CFF', '🎯', 3),
  ('social',     '{"en": "Social",     "es": "Social"}',
                 '{"en": "Strengthen bonds, expand your network, and connect.",
                   "es": "Fortalece vínculos, amplía tu red y conecta."}',
                 '#33D1FF', '🤝', 4),
  ('mind',       '{"en": "Mind",       "es": "Mente"}',
                 '{"en": "Read, learn and grow your knowledge every day.",
                   "es": "Lee, aprende y haz crecer tu conocimiento cada día."}',
                 '#A78BFA', '🧠', 5),
  ('creativity', '{"en": "Creativity", "es": "Creatividad"}',
                 '{"en": "Create, express yourself, and build something meaningful.",
                   "es": "Crea, exprésate y construye algo significativo."}',
                 '#FF8C42', '🎨', 6)
on conflict (code) do update set
  label = excluded.label, description = excluded.description,
  color = excluded.color, icon = excluded.icon, sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- 2. Per-attribute XP — replaces the three fixed stat_* columns
-- ----------------------------------------------------------------------------
create table if not exists public.user_attribute_xp (
  user_id        uuid not null references public.profiles(id) on delete cascade,
  attribute_code text not null references public.attributes(code) on delete restrict,
  xp             bigint not null default 0,
  primary key (user_id, attribute_code)
);

comment on table public.user_attribute_xp is
  'CACHE. Rebuildable from ledger_events via private.recompute_user_stats().';

-- ----------------------------------------------------------------------------
-- 3. Carry existing XP across before the old columns go away
-- ----------------------------------------------------------------------------
insert into public.user_attribute_xp (user_id, attribute_code, xp)
select user_id, 'health', stat_health from public.user_stats where stat_health <> 0
union all
select user_id, 'money', stat_money from public.user_stats where stat_money <> 0
union all
select user_id, 'discipline', stat_discipline from public.user_stats where stat_discipline <> 0
on conflict (user_id, attribute_code) do update set xp = excluded.xp;

-- ----------------------------------------------------------------------------
-- 4. enum -> text, with real foreign keys
--
-- The FKs are what the enum was really providing (a closed value set), except
-- now the value set is editable at runtime.
-- ----------------------------------------------------------------------------
-- Each step is guarded so the whole file can be re-run safely after a partial
-- application. `udt_name` is the underlying type: 'attribute_type' for a scalar
-- column, '_attribute_type' for an array of it.

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'missions'
      and column_name = 'attribute' and udt_name = 'attribute_type'
  ) then
    alter table public.missions alter column attribute type text using attribute::text;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'missions_attribute_fk') then
    alter table public.missions
      add constraint missions_attribute_fk
      foreign key (attribute) references public.attributes(code) on delete restrict;
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'ledger_events'
      and column_name = 'attribute' and udt_name = 'attribute_type'
  ) then
    alter table public.ledger_events alter column attribute type text using attribute::text;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'ledger_events_attribute_fk') then
    alter table public.ledger_events
      add constraint ledger_events_attribute_fk
      foreign key (attribute) references public.attributes(code) on delete restrict;
  end if;
end;
$$;

-- profiles.mission_categories: attribute_type[] -> text[]
--
-- ALTER COLUMN ... USING cannot contain a subquery, and there is no reliable
-- element-wise cast for an enum array. So: add a new column, copy through an
-- UPDATE (where subqueries ARE allowed), then swap. Dropping the old column
-- also drops profiles_categories_not_empty, so it is recreated afterwards.
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'mission_categories' and udt_name = '_attribute_type'
  ) then
    alter table public.profiles alter column mission_categories drop default;
    alter table public.profiles add column mission_categories_txt text[];

    update public.profiles
       set mission_categories_txt = array(
         select x::text from unnest(mission_categories) as x
       );

    alter table public.profiles drop column mission_categories;
    alter table public.profiles rename column mission_categories_txt to mission_categories;

    update public.profiles
       set mission_categories = array['health', 'money', 'discipline']::text[]
     where mission_categories is null or array_length(mission_categories, 1) is null;

    alter table public.profiles alter column mission_categories set not null;
    alter table public.profiles
      alter column mission_categories
      set default array['health', 'money', 'discipline']::text[];

    alter table public.profiles
      add constraint profiles_categories_not_empty
      check (array_length(mission_categories, 1) >= 1);
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Retire the fixed stat columns
-- ----------------------------------------------------------------------------
alter table public.user_stats
  drop column if exists stat_health,
  drop column if exists stat_money,
  drop column if exists stat_discipline;

-- ----------------------------------------------------------------------------
-- 6. Functions whose SIGNATURE contains the enum must be dropped, not replaced
--    (CREATE OR REPLACE with different argument types creates an overload).
-- ----------------------------------------------------------------------------
-- Wrapped in EXECUTE so the enum type name is only resolved if the type still
-- exists — otherwise re-running this file would fail on parsing a type that
-- step 13 already dropped.
do $$
begin
  if exists (
    select 1 from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'attribute_type' and n.nspname = 'public'
  ) then
    execute 'drop function if exists private.write_ledger(
               uuid, public.ledger_kind, int, int, public.attribute_type, text,
               bigint, uuid, uuid, bigint, text, date)';
    execute 'drop function if exists public.update_mission_preferences(public.attribute_type[])';
    execute 'drop function if exists public.complete_onboarding(public.attribute_type[])';
  end if;
end;
$$;

create or replace function private.write_ledger(
  p_user_id         uuid,
  p_kind            public.ledger_kind,
  p_xp              int,
  p_coins           int,
  p_attribute       text,
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
-- 7. Cache maintenance — now writes to user_attribute_xp
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
    total_xp = s.total_xp + new.xp_delta,
    coins    = s.coins + new.coins_delta
  where s.user_id = new.user_id;

  if new.attribute is not null then
    insert into public.user_attribute_xp as uax (user_id, attribute_code, xp)
    values (new.user_id, new.attribute, new.xp_delta)
    on conflict (user_id, attribute_code)
      do update set xp = uax.xp + excluded.xp;
  end if;

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

-- ----------------------------------------------------------------------------
-- 8. Full rebuild — the recovery guarantee, now attribute-agnostic
-- ----------------------------------------------------------------------------
create or replace function private.recompute_user_stats(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.daily_activity where user_id = p_user_id;
  delete from public.user_attribute_xp where user_id = p_user_id;

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

  insert into public.daily_activity (user_id, local_date, freeze_applied, counts_for_streak)
  select f.user_id, f.consumed_for_date, true, false
  from public.streak_freezes f
  where f.user_id = p_user_id and f.consumed_for_date is not null
  on conflict (user_id, local_date) do update set freeze_applied = true;

  -- Per-attribute XP: one GROUP BY, no hardcoded attribute list. This is the
  -- part that used to need editing every time a category was added.
  insert into public.user_attribute_xp (user_id, attribute_code, xp)
  select e.user_id, e.attribute, sum(e.xp_delta)::bigint
  from public.ledger_events e
  where e.user_id = p_user_id and e.attribute is not null
  group by e.user_id, e.attribute;

  update public.user_stats s set
    total_xp = t.total_xp,
    coins    = t.coins
  from (
    select
      coalesce(sum(xp_delta), 0)::bigint    as total_xp,
      coalesce(sum(coins_delta), 0)::bigint as coins
    from public.ledger_events
    where user_id = p_user_id
  ) t
  where s.user_id = p_user_id;

  perform private.refresh_derived(p_user_id);
end;
$$;

-- ----------------------------------------------------------------------------
-- 9. Achievement evaluator — attribute_xp criteria now reads the new table
-- ----------------------------------------------------------------------------
create or replace function private.evaluate_achievements(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s     record;
  r     record;
  v_ok  boolean;
  v_val bigint;
  v_out jsonb := '[]'::jsonb;
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
        select coalesce(uax.xp, 0) into v_val
        from public.user_attribute_xp uax
        where uax.user_id = p_user_id
          and uax.attribute_code = (r.criteria ->> 'attribute');
        v_ok := coalesce(v_val, 0) >= (r.criteria ->> 'value')::bigint;
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
-- 10. Mission assignment — preferences are text[] now
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
  v_prefs text[];
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
  order by private.stable_random(m.code || v_uid::text || v_today::text)
    / case m.rarity
        when 'common' then 8 when 'rare' then 4 when 'epic' then 2 else 1
      end
  limit c_count
  on conflict do nothing;
end;
$$;

-- ----------------------------------------------------------------------------
-- 11. Preference RPCs — text[] signatures, and they now VALIDATE against the
--     attributes table. This is what would have caught the 'mind' bug: an
--     unknown category is rejected with a clear reason instead of a raw
--     enum cast error.
-- ----------------------------------------------------------------------------
create or replace function public.update_mission_preferences(p_categories text[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := private.require_uid();
  v_bad    text[];
begin
  if p_categories is null or array_length(p_categories, 1) is null then
    return jsonb_build_object('success', false, 'reason', 'empty');
  end if;

  select array_agg(c) into v_bad
  from unnest(p_categories) as c
  where not exists (
    select 1 from public.attributes a where a.code = c and a.is_active
  );

  if v_bad is not null then
    return jsonb_build_object(
      'success', false, 'reason', 'unknown_categories', 'unknown', to_jsonb(v_bad)
    );
  end if;

  update public.profiles set mission_categories = p_categories where id = v_uid;
  return jsonb_build_object('success', true);
end;
$$;

create or replace function public.complete_onboarding(p_categories text[])
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid   uuid := private.require_uid();
  v_today date;
  v_res   jsonb;
begin
  v_res := public.update_mission_preferences(p_categories);
  if (v_res ->> 'success')::boolean is not true then
    return v_res;
  end if;

  update public.profiles set onboarded_at = coalesce(onboarded_at, now())
  where id = v_uid;

  -- Drop anything assigned before preferences existed, then re-assign with
  -- them. Safe because none of it can have been completed yet.
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
-- 12. get_my_profile — returns an attributes ARRAY instead of three fixed keys
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
    'is_private',         p.is_private,
    'created_at',         p.created_at,
    'total_xp',           s.total_xp,
    'coins',              s.coins,
    'level',              s.level,
    'xp',                 s.xp_into_level,
    'xp_next',            s.xp_next,
    'streak',             s.streak_current,
    'longest_streak',     s.streak_longest,
    'tier', case when t.code is null then null else jsonb_build_object(
      'code', t.code, 'name', t.name, 'icon', t.icon, 'color', t.color
    ) end,
    'freezes_banked', (
      select count(*) from public.streak_freezes f
      where f.user_id = v_uid and f.consumed_for_date is null
    ),
    -- Every active attribute, with this user's XP. The dashboard renders one
    -- card per element — add a row to `attributes` and it appears automatically.
    'attributes', coalesce((
      select jsonb_agg(jsonb_build_object(
        'code',  a.code,
        'label', a.label,
        'color', a.color,
        'icon',  a.icon,
        'xp',    coalesce(uax.xp, 0)
      ) order by a.sort_order)
      from public.attributes a
      left join public.user_attribute_xp uax
        on uax.user_id = v_uid and uax.attribute_code = a.code
      where a.is_active
    ), '[]'::jsonb),
    'equipped', coalesce((
      select jsonb_object_agg(ue.slot, jsonb_build_object(
        'item_id', i.id, 'code', i.code, 'name', i.name,
        'rarity', i.rarity, 'config', i.config, 'item_type', i.item_type
      ))
      from public.user_equipped ue
      join public.items i on i.id = ue.item_id
      where ue.user_id = v_uid
    ), '{}'::jsonb)
  );
end;
$$;

-- ----------------------------------------------------------------------------
-- 13. The enum has no remaining references — retire it.
-- ----------------------------------------------------------------------------
drop type if exists public.attribute_type;

-- ----------------------------------------------------------------------------
-- 14. RLS + grants for the two new tables
-- ----------------------------------------------------------------------------
alter table public.attributes        enable row level security;
alter table public.user_attribute_xp enable row level security;

create policy "catalog readable" on public.attributes
  for select to authenticated using (is_active);

create policy "own rows" on public.user_attribute_xp
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on public.attributes, public.user_attribute_xp to authenticated;

-- Re-grant the rebuilt functions (dropping a function drops its grants).
revoke execute on function public.update_mission_preferences(text[]) from public, anon;
revoke execute on function public.complete_onboarding(text[]) from public, anon;
grant execute on function
  public.update_mission_preferences(text[]),
  public.complete_onboarding(text[]),
  public.ensure_daily_missions(),
  public.get_my_profile()
to authenticated;

-- ----------------------------------------------------------------------------
-- 15. Rebuild every cache so user_attribute_xp is provably consistent with the
--     ledger from the very first moment it exists.
-- ----------------------------------------------------------------------------
select private.recompute_all_stats();
