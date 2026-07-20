-- ============================================================================
-- 002 — profiles (identity & settings) + user_stats (derived cache)
-- ============================================================================
-- These are split deliberately:
--   profiles   — what the USER sets   (username, timezone, preferences)
--   user_stats — what the SYSTEM derives (xp, level, coins, streak)
--
-- The split means "rebuild all derived data" touches exactly one table and can
-- never clobber a username or timezone. Every column in user_stats is a cache
-- that can be deleted and recomputed from ledger_events.
-- ============================================================================

create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  username           citext not null unique,
  avatar_url         text,

  -- Timezone handling (see docs/database-design.md §5.3).
  -- day_cutoff_hour = 4 means a mission logged at 01:30 counts for YESTERDAY.
  -- Treating a 1:30am run as a missed day is the #1 "your app broke my streak"
  -- complaint in habit trackers.
  timezone           text not null default 'Europe/Madrid',
  day_cutoff_hour    smallint not null default 4,

  mission_categories public.attribute_type[] not null
                       default array['health', 'money', 'discipline']::public.attribute_type[],
  onboarded_at       timestamptz,

  -- Soft delete: hides from leaderboards + blocks access, recoverable for 30
  -- days, then hard-deleted for GDPR (see 006).
  deleted_at         timestamptz,

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- Mirrors the client-side check in src/lib/api/auth.js — defence in depth.
  constraint profiles_username_format
    check (username ~ '^[A-Z0-9_]{3,20}$'),
  constraint profiles_cutoff_range
    check (day_cutoff_hour between 0 and 23),
  constraint profiles_categories_not_empty
    check (array_length(mission_categories, 1) >= 1)
);

-- Timezone validity needs a subquery against pg_timezone_names, which CHECK
-- constraints forbid — so it is enforced by trigger in migration 005.

create index profiles_active_idx on public.profiles (id) where deleted_at is null;

comment on column public.profiles.timezone is
  'IANA name. Changing it affects FUTURE rows only; past local_date values are frozen.';


-- ----------------------------------------------------------------------------
-- user_stats — 100% derived. Deleting and recomputing must be a no-op.
-- ----------------------------------------------------------------------------
create table public.user_stats (
  user_id                uuid primary key references public.profiles(id) on delete cascade,

  total_xp               bigint not null default 0,
  coins                  bigint not null default 0,

  level                  int not null default 1,
  xp_into_level          int not null default 0,
  xp_next                int not null default 100,

  stat_health            int not null default 0,
  stat_money             int not null default 0,
  stat_discipline        int not null default 0,

  streak_current         int not null default 0,
  streak_longest         int not null default 0,
  last_active_local_date date,

  recomputed_at          timestamptz not null default now(),

  -- With ALL spending funnelled through purchase_item(), this constraint makes
  -- a negative balance unrepresentable rather than merely unlikely. It is also
  -- the race-condition backstop: two concurrent purchases cannot both succeed.
  constraint user_stats_coins_non_negative check (coins >= 0),
  constraint user_stats_total_xp_non_negative check (total_xp >= 0),
  constraint user_stats_level_positive check (level >= 1)
);

-- Leaderboard ordering. user_id included so the index covers the sort fully.
create index user_stats_leaderboard_idx on public.user_stats (total_xp desc, user_id);

comment on table public.user_stats is
  'CACHE. Rebuildable via private.recompute_user_stats(). ledger_events is the truth.';
