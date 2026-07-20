-- ============================================================================
-- 011 — Close the anon-grant gap, permanently
-- ============================================================================
-- WHAT WAS WRONG
--
-- Migration 007 ran `revoke all on all tables in schema public from anon,
-- authenticated`. That only affects tables that existed AT THAT MOMENT.
--
-- Supabase ships default privileges that grant ALL on new public tables to
-- anon and authenticated. So public.attributes and public.user_attribute_xp,
-- created in migration 010, came into existence readable by anon.
--
-- No data actually leaked — their RLS policies are `to authenticated`, so an
-- anonymous request matched no policy and got 0 rows. But the design calls for
-- two layers (no grant AND RLS) and those tables only had one. Relying on RLS
-- alone means a single mistaken policy becomes a full public dump.
--
-- This migration fixes the instance and the cause.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Sweep: revoke every anon table grant in public.
--
-- A loop rather than a fixed list, so it also catches anything else that
-- slipped through — and stays correct if re-run later.
--
-- anon needs ZERO table access in this app: the landing page queries nothing,
-- and auth flows go through GoTrue, not PostgREST.
-- ----------------------------------------------------------------------------
do $$
declare
  r record;
  n int := 0;
begin
  for r in
    select distinct table_name
    from information_schema.role_table_grants
    where table_schema = 'public' and grantee = 'anon'
  loop
    execute format('revoke all on public.%I from anon', r.table_name);
    n := n + 1;
  end loop;

  if n = 0 then
    raise notice 'No anon table grants found — already clean.';
  else
    raise notice 'Revoked anon grants on % table(s).', n;
  end if;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. The actual fix: stop FUTURE tables from being auto-granted.
--
-- Without this, migration 012 would reintroduce exactly the same hole. Default
-- privileges apply per creating role, so this covers tables created by the
-- migration runner.
-- ----------------------------------------------------------------------------
alter default privileges in schema public
  revoke all on tables from anon;

alter default privileges in schema public
  revoke all on sequences from anon;

-- authenticated is handled deliberately per table (grant select where the RLS
-- policy allows it), so revoke its blanket default too.
alter default privileges in schema public
  revoke all on tables from authenticated;

alter default privileges in schema public
  revoke all on sequences from authenticated;

-- ----------------------------------------------------------------------------
-- 3. Re-grant what the app genuinely needs.
--
-- Step 1 was a blunt sweep over anon only, but re-stating the authenticated
-- grants keeps this file self-contained and safe to replay.
-- ----------------------------------------------------------------------------
grant select on
  public.attributes, public.user_attribute_xp,
  public.missions, public.items, public.achievements, public.slots,
  public.level_curve, public.rank_tiers, public.shop_rotations,
  public.ledger_events, public.mission_assignments, public.daily_activity,
  public.streak_freezes, public.user_items, public.user_achievements,
  public.user_stats, public.profiles
to authenticated;

grant select, insert, update, delete on public.user_equipped to authenticated;

-- ----------------------------------------------------------------------------
-- 4. Assert the invariant.
--
-- Fails the migration if any table in public is still reachable by anon, and
-- names the offenders. Cheap to run, and turns a silent regression into a
-- loud one.
-- ----------------------------------------------------------------------------
do $$
declare
  v_bad text;
begin
  select string_agg(distinct table_name, ', ')
    into v_bad
  from information_schema.role_table_grants
  where table_schema = 'public' and grantee = 'anon';

  if v_bad is not null then
    raise exception 'anon still holds grants on: %', v_bad;
  end if;

  raise notice 'OK: anon has no table privileges in schema public.';
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. Assert every user-facing table still has RLS enabled.
--
-- The two protections are meant to be independent; check both.
-- ----------------------------------------------------------------------------
do $$
declare
  v_bad text;
begin
  select string_agg(tablename, ', ')
    into v_bad
  from pg_tables
  where schemaname = 'public' and not rowsecurity;

  if v_bad is not null then
    raise exception 'RLS is disabled on: %', v_bad;
  end if;

  raise notice 'OK: RLS enabled on every table in schema public.';
end;
$$;
