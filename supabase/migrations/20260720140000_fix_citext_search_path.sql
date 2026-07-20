-- ============================================================================
-- 009 — FIX: signup failed with "Database error saving new user"
-- ============================================================================
-- THE BUG
--
-- private.handle_new_user() runs with `set search_path = ''` (correct — it is
-- SECURITY DEFINER, and an unset search_path is a privilege-escalation vector).
-- But it also referenced the type `citext`:
--
--     where p.username = v_username::citext
--
-- citext is an EXTENSION type. It does not live in pg_catalog, and pg_catalog
-- is the only schema an empty search_path implicitly searches. So the type name
-- could not be resolved, the trigger threw, the auth.users insert rolled back,
-- and GoTrue surfaced "Database error saving new user" (HTTP 500).
--
-- It failed at runtime rather than at CREATE FUNCTION time because plpgsql
-- bodies are parsed lazily — which is why every migration applied cleanly.
--
-- THE FIX
--
-- Drop citext instead of schema-qualifying it. It was never earning its keep:
-- the CHECK constraint is ^[A-Z0-9_]{3,20}$ and both handle_new_user() and
-- update_username() call upper(), so usernames are uppercase-only by
-- construction. Case-insensitive comparison is therefore a no-op, and plain
-- text has no extension dependency and no search_path hazard.
--
-- Behaviour is unchanged; the CHECK actually gets stricter, since `~` on text
-- is case-sensitive while on citext it was not.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. citext -> text. The UNIQUE index is rebuilt automatically.
-- ----------------------------------------------------------------------------
alter table public.profiles
  alter column username type text;

-- ----------------------------------------------------------------------------
-- 2. Harden the timezone check too.
--
-- pg_timezone_names IS in pg_catalog so this worked, but it was relying on the
-- implicit pg_catalog lookup. Making it explicit removes the ambiguity.
-- ----------------------------------------------------------------------------
create or replace function private.is_valid_timezone(p_tz text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (select 1 from pg_catalog.pg_timezone_names where name = p_tz);
$$;

-- ----------------------------------------------------------------------------
-- 3. handle_new_user — same logic, no citext.
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

  -- Resolve collisions rather than failing: a username clash must never cost
  -- someone their account.
  while exists (select 1 from public.profiles p where p.username = v_username) loop
    v_suffix := v_suffix + 1;
    v_username := left(v_base, 19 - length(v_suffix::text)) || '_' || v_suffix::text;
  end loop;

  v_tz := coalesce(new.raw_user_meta_data ->> 'timezone', 'Europe/Madrid');
  if not private.is_valid_timezone(v_tz) then
    v_tz := 'Europe/Madrid';
  end if;

  insert into public.profiles (id, username, timezone)
  values (new.id, v_username, v_tz);

  insert into public.user_stats (user_id) values (new.id);

  insert into public.user_items (user_id, item_id, acquired_via)
  select new.id, i.id, 'starter'
  from public.items i
  where i.acquisition = 'starter' and i.is_active
  on conflict do nothing;

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. update_username — same fix.
-- ----------------------------------------------------------------------------
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
    select 1 from public.profiles p where p.username = v_clean and p.id <> v_uid
  ) then
    return jsonb_build_object('success', false, 'reason', 'taken');
  end if;

  update public.profiles set username = v_clean where id = v_uid;
  return jsonb_build_object('success', true, 'username', v_clean);
end;
$$;

revoke execute on function public.update_username(text) from public, anon;
grant execute on function public.update_username(text) to authenticated;

-- ----------------------------------------------------------------------------
-- 5. Verify the trigger is still attached to auth.users.
--
-- If this raises, the trigger was never created (migration 005 may have failed
-- silently on that statement) and signup would fail for a different reason.
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'on_auth_user_created' and not tgisinternal
  ) then
    raise exception 'Trigger on_auth_user_created is missing — re-run migration 005.';
  end if;
  raise notice 'OK: on_auth_user_created is attached.';
end;
$$;

-- citext is left installed but unused. Dropping it would require the extension
-- to have no dependents; harmless to keep, and removing it is not worth a
-- separate migration.
