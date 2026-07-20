-- ============================================================================
-- 008 — Profile privacy
-- ============================================================================
-- The Settings page already ships a privacy toggle. This adds the column and
-- RPC behind it, and teaches the leaderboard to respect it.
--
-- Additive only: a new nullable-with-default column plus a CREATE OR REPLACE
-- of an existing function. Nothing is renamed or dropped, so a deployed build
-- that predates this migration keeps working — which is the rule from
-- docs/database-design.md §6.3.
-- ============================================================================

alter table public.profiles
  add column if not exists is_private boolean not null default false;

comment on column public.profiles.is_private is
  'When true the user is hidden from other players'' leaderboard views.';

-- Partial index: the leaderboard filters on this, and the overwhelming
-- majority of rows are false, so only the private ones are worth indexing.
create index if not exists profiles_private_idx
  on public.profiles (id) where is_private;


-- ----------------------------------------------------------------------------
-- set_profile_private — called by the Settings toggle.
-- ----------------------------------------------------------------------------
create or replace function public.set_profile_private(p_is_private boolean)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := private.require_uid();
begin
  update public.profiles set is_private = coalesce(p_is_private, false)
  where id = v_uid;

  return jsonb_build_object('success', true, 'is_private', coalesce(p_is_private, false));
end;
$$;

revoke execute on function public.set_profile_private(boolean) from public, anon;
grant execute on function public.set_profile_private(boolean) to authenticated;


-- ----------------------------------------------------------------------------
-- get_leaderboard — now hides private players from everyone except themselves.
--
-- Callers always see their own row so they never lose sight of their rank.
-- Note the ranking window still runs over the filtered set, so ranks stay
-- contiguous for the viewer.
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
    and (not p.is_private or p.id = auth.uid())
  order by s.total_xp desc, p.created_at asc
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
$$;

-- CREATE OR REPLACE keeps existing grants, but re-stating them is harmless and
-- makes the file self-contained if it is ever replayed onto a fresh database.
revoke execute on function public.get_leaderboard(int, int) from public, anon;
grant execute on function public.get_leaderboard(int, int) to authenticated;


-- ----------------------------------------------------------------------------
-- get_my_profile — expose is_private so Settings can render the toggle without
-- a second query.
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
        'rarity', i.rarity, 'config', i.config, 'item_type', i.item_type
      ))
      from public.user_equipped ue
      join public.items i on i.id = ue.item_id
      where ue.user_id = v_uid
    ), '{}'::jsonb)
  );
end;
$$;

revoke execute on function public.get_my_profile() from public, anon;
grant execute on function public.get_my_profile() to authenticated;
