-- ============================================================================
-- 007 — Row Level Security, grants, storage policies, scheduled jobs
-- ============================================================================
-- Read this file as the security model.
--
-- Supabase grants ALL on new public tables to anon/authenticated via default
-- privileges. That is the opposite of what this app needs, so the first thing
-- we do is take it all back and hand out only what is required.
--
-- The rule: the client is READ-ONLY on everything that matters. Every write
-- affecting XP, coins, items or streaks goes through a SECURITY DEFINER RPC.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Revoke Supabase's permissive defaults
-- ----------------------------------------------------------------------------
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant usage on schema public to anon, authenticated;

-- ----------------------------------------------------------------------------
-- 2. Enable RLS on every table. No exceptions.
--
-- A table with RLS enabled and no policy denies everything, which is the
-- correct default: it fails closed.
-- ----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.user_stats          enable row level security;
alter table public.ledger_events       enable row level security;
alter table public.mission_assignments enable row level security;
alter table public.daily_activity      enable row level security;
alter table public.streak_freezes      enable row level security;
alter table public.user_items          enable row level security;
alter table public.user_equipped       enable row level security;
alter table public.user_achievements   enable row level security;
alter table public.missions            enable row level security;
alter table public.items               enable row level security;
alter table public.achievements        enable row level security;
alter table public.slots               enable row level security;
alter table public.level_curve         enable row level security;
alter table public.rank_tiers          enable row level security;
alter table public.shop_rotations      enable row level security;

-- ----------------------------------------------------------------------------
-- 3. Catalog tables: readable by any signed-in user, writable by nobody.
--
-- Content changes ship as migrations or seed updates via the service role.
-- ----------------------------------------------------------------------------
create policy "catalog readable" on public.missions
  for select to authenticated using (is_active);

create policy "catalog readable" on public.items
  for select to authenticated using (is_active);

create policy "catalog readable" on public.achievements
  for select to authenticated using (is_active);

create policy "catalog readable" on public.slots
  for select to authenticated using (true);

create policy "catalog readable" on public.level_curve
  for select to authenticated using (true);

create policy "catalog readable" on public.rank_tiers
  for select to authenticated using (true);

create policy "catalog readable" on public.shop_rotations
  for select to authenticated using (true);

grant select on
  public.missions, public.items, public.achievements, public.slots,
  public.level_curve, public.rank_tiers, public.shop_rotations
to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Own-row-only tables.
--
-- SELECT only. No INSERT/UPDATE/DELETE policy exists, and no grant is issued,
-- so these are unwritable from the browser by construction.
--
-- (select auth.uid()) rather than auth.uid() — the subselect is evaluated once
-- per query instead of once per row. On a leaderboard scan that is the
-- difference between one call and thousands.
-- ----------------------------------------------------------------------------
create policy "own rows" on public.ledger_events
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.mission_assignments
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.daily_activity
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.streak_freezes
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.user_items
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.user_achievements
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own rows" on public.user_stats
  for select to authenticated using ((select auth.uid()) = user_id);

grant select on
  public.ledger_events, public.mission_assignments, public.daily_activity,
  public.streak_freezes, public.user_items, public.user_achievements,
  public.user_stats
to authenticated;

-- ----------------------------------------------------------------------------
-- 5. profiles — own row only.
--
-- Other users' profiles are NEVER directly selectable. The leaderboard goes
-- through get_leaderboard(), which returns display columns only. Without this
-- split, "show the ladder" would expose every profile row to every user.
-- ----------------------------------------------------------------------------
create policy "own profile" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id and deleted_at is null);

grant select on public.profiles to authenticated;
-- No UPDATE grant: username, avatar and timezone all go through validating
-- RPCs. A raw UPDATE would bypass the format and ownership checks.

-- ----------------------------------------------------------------------------
-- 6. user_equipped — the one table the client may write directly.
--
-- Safe because the validate trigger re-checks ownership and slot type
-- server-side, and equipping has no economic effect.
-- ----------------------------------------------------------------------------
create policy "own loadout select" on public.user_equipped
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "own loadout insert" on public.user_equipped
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "own loadout update" on public.user_equipped
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "own loadout delete" on public.user_equipped
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_equipped to authenticated;

-- ----------------------------------------------------------------------------
-- 7. Function execution.
--
-- Postgres grants EXECUTE on new functions to PUBLIC by default. Lock that
-- down and re-grant only the client-facing RPCs. Anything in `private` is
-- already unreachable (no schema USAGE), but defence in depth is cheap.
-- ----------------------------------------------------------------------------
revoke execute on all functions in schema public from public, anon;

grant execute on function
  public.ensure_daily_missions(),
  public.ensure_weekly_missions(),
  public.get_missions(),
  public.complete_mission(bigint),
  public.uncomplete_mission(bigint),
  public.ensure_shop_rotation(),
  public.get_shop_rotation(),
  public.purchase_item(uuid),
  public.equip_item(uuid),
  public.unequip_slot(text),
  public.get_my_profile(),
  public.update_username(text),
  public.update_avatar_url(text),
  public.update_timezone(text, int),
  public.update_mission_preferences(public.attribute_type[]),
  public.complete_onboarding(public.attribute_type[]),
  public.get_weekly_xp(),
  public.get_leaderboard(int, int),
  public.get_my_rank(),
  public.get_rewards_catalog(),
  public.request_account_deletion()
to authenticated;

-- ----------------------------------------------------------------------------
-- 8. Storage: avatars bucket.
--
-- Path convention is {user_id}/avatar.ext — matching uploadAvatar() in
-- src/lib/api/profile.js. storage.foldername()[1] is the first path segment,
-- so a user can only write inside their own folder.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable" on storage.objects
  for select to public using (bucket_id = 'avatars');

drop policy if exists "users manage own avatar" on storage.objects;
create policy "users manage own avatar" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- ----------------------------------------------------------------------------
-- 9. Scheduled jobs (pg_cron).
--
-- Guarded: if pg_cron is not enabled on the project this block is skipped
-- rather than failing the migration. Enable it in
-- Dashboard -> Database -> Extensions -> pg_cron, then re-run this migration.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise notice 'pg_cron not enabled — skipping scheduled jobs. Enable it and re-run.';
    return;
  end if;

  -- Nightly self-heal: rebuild every cached counter from the ledger. Any drift
  -- between cache and truth disappears within 24 hours instead of compounding
  -- silently for months, which is how gamified apps normally rot.
  perform cron.schedule(
    'ascend-recompute-stats',
    '30 4 * * *',
    $job$ select private.recompute_all_stats(); $job$
  );

  -- GDPR purge: hard-delete accounts soft-deleted more than 30 days ago.
  -- Deleting the auth.users row cascades through profiles and every
  -- user-owned table.
  perform cron.schedule(
    'ascend-purge-deleted',
    '0 5 * * *',
    $job$
      delete from auth.users u
      using public.profiles p
      where p.id = u.id
        and p.deleted_at is not null
        and p.deleted_at < now() - interval '30 days';
    $job$
  );
end;
$$;
