-- ============================================================================
-- 001 — Extensions, enums, private schema, cosmetic slots
-- ============================================================================
-- Enums are used ONLY for structural values (changing them means changing app
-- code anyway). Anything that is *content* — missions, items, achievements,
-- level curve, rank tiers, cosmetic slots — lives in a table so that adding
-- content never requires a migration.
-- ============================================================================

create extension if not exists citext;
create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Private schema: internal machinery.
--
-- PostgREST only exposes `public`, so nothing in here is reachable from the
-- browser no matter what. This is where every SECURITY DEFINER helper that
-- takes a user_id or writes XP lives. If `write_ledger` were callable by the
-- client, a user could grant themselves infinite XP in one line of JavaScript.
-- ----------------------------------------------------------------------------
create schema if not exists private;

revoke all on schema private from public;
revoke usage on schema private from anon, authenticated;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.attribute_type as enum ('health', 'money', 'discipline');

create type public.rarity_type as enum ('common', 'rare', 'epic', 'legendary');

create type public.cadence_type as enum ('daily', 'weekly');

create type public.ledger_kind as enum (
  'mission_daily',
  'mission_weekly',
  'streak_bonus',
  'achievement',
  'purchase',
  'refund',
  'correction',
  'admin_grant'
);

create type public.acquisition_type as enum (
  'shop',
  'achievement',
  'level',
  'seasonal',
  'starter'
);

-- ----------------------------------------------------------------------------
-- slots — cosmetic equipment slots (Steam-profile style)
--
-- A table, not an enum, precisely so that inventing an "avatar_border" slot
-- next year is one INSERT rather than a migration + a new profiles column.
-- ----------------------------------------------------------------------------
create table public.slots (
  code       text primary key,
  label      jsonb not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint slots_label_locales
    check (jsonb_exists(label, 'en') and jsonb_exists(label, 'es'))
);

comment on table public.slots is
  'Cosmetic equipment slots. Add a slot with an INSERT, never a migration.';
