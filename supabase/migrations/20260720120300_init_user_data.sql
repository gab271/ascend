-- ============================================================================
-- 004 — User data: assignments, the ledger, rollups, freezes, inventory
-- ============================================================================

-- ----------------------------------------------------------------------------
-- mission_assignments
--
-- Replaces v1's user_daily_missions + user_weekly_missions, which were
-- near-identical tables differing only by assigned_date vs week_start — every
-- query, RPC and RLS policy had to be written twice.
-- ----------------------------------------------------------------------------
create table public.mission_assignments (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  mission_id    uuid not null references public.missions(id) on delete restrict,
  cadence       public.cadence_type not null,

  -- daily  -> the local date it was assigned for
  -- weekly -> the Monday of that local week
  period_start  date not null,

  assigned_at   timestamptz not null default now(),
  completed_at  timestamptz,

  -- Snapshot of the reward actually paid. If a mission is rebalanced from
  -- 50 -> 80 XP next year, history must still show what was really earned.
  -- Never recompute past rewards from the current catalog.
  xp_awarded    int,
  coins_awarded int,

  -- THIS is what makes ensure_daily_missions() idempotent. Call it fifty
  -- times, get one assignment.
  constraint mission_assignments_unique
    unique (user_id, mission_id, cadence, period_start),

  constraint mission_assignments_award_consistency check (
    (completed_at is null and xp_awarded is null and coins_awarded is null) or
    (completed_at is not null and xp_awarded is not null and coins_awarded is not null)
  )
);

-- The hottest query in the app: "what are my missions for today?"
create index mission_assignments_lookup_idx
  on public.mission_assignments (user_id, cadence, period_start);

-- Partial index for open missions only — much smaller than the full index.
create index mission_assignments_open_idx
  on public.mission_assignments (user_id, period_start) where completed_at is null;

create index mission_assignments_mission_idx on public.mission_assignments (mission_id);


-- ----------------------------------------------------------------------------
-- ledger_events — APPEND-ONLY. THE SOURCE OF TRUTH. ⭐
--
-- Every number on a profile is derived from this table. If user_stats or
-- daily_activity ever drift, they get deleted and rebuilt from here.
--
-- XP and coins live in ONE row on purpose: completing a mission grants both,
-- and two tables would mean two inserts with a window where one succeeded and
-- the other did not. One row is atomic by construction — it is impossible to
-- award XP without the matching coins.
--
-- UPDATE and DELETE are blocked by trigger (migration 005). Corrections are
-- new rows with negated deltas and reverses_id pointing at the original.
-- ----------------------------------------------------------------------------
create table public.ledger_events (
  id              bigint generated always as identity primary key,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  kind            public.ledger_kind not null,

  xp_delta        int not null default 0,
  coins_delta     int not null default 0,
  attribute       public.attribute_type,

  occurred_at     timestamptz not null default now(),
  -- Frozen at insert from the user's timezone + cutoff. Never recomputed:
  -- if a user flies to Japan, past days keep the dates they were earned on.
  local_date      date not null,

  -- ON DELETE RESTRICT: you must not be able to delete a mission or item that
  -- history references. The ledger pins the catalog in place. Retire content
  -- with is_active = false, never DELETE.
  assignment_id   bigint references public.mission_assignments(id) on delete restrict,
  achievement_id  uuid references public.achievements(id) on delete restrict,
  item_id         uuid references public.items(id) on delete restrict,

  -- UNIQUE: an event can be reversed at most once.
  reverses_id     bigint unique references public.ledger_events(id) on delete restrict,

  idempotency_key text not null,
  notes           text,

  -- The anti-double-award guard. A double-clicked button, a retry, or a
  -- network hiccup can physically never award XP twice. This is a constraint,
  -- not a code convention — it holds even if the app logic is wrong.
  constraint ledger_events_idempotency unique (user_id, idempotency_key)
);

create index ledger_events_user_date_idx   on public.ledger_events (user_id, local_date);
create index ledger_events_user_recent_idx on public.ledger_events (user_id, occurred_at desc);
create index ledger_events_assignment_idx  on public.ledger_events (assignment_id);
create index ledger_events_achievement_idx on public.ledger_events (achievement_id);
create index ledger_events_item_idx        on public.ledger_events (item_id);

comment on table public.ledger_events is
  'APPEND-ONLY source of truth for XP and coins. Never UPDATE or DELETE.';


-- ----------------------------------------------------------------------------
-- daily_activity — per-day rollup. CACHE, rebuildable.
--
-- Pure GROUP BY of the ledger. Exists because the weekly chart and the streak
-- walk both need per-day data, and scanning the whole ledger for a 7-day chart
-- gets slower forever while this stays constant-size.
-- ----------------------------------------------------------------------------
create table public.daily_activity (
  user_id            uuid not null references public.profiles(id) on delete cascade,
  local_date         date not null,
  missions_completed int not null default 0,
  xp_earned          int not null default 0,
  coins_earned       int not null default 0,
  counts_for_streak  boolean not null default false,
  freeze_applied     boolean not null default false,
  primary key (user_id, local_date)
);

create index daily_activity_recent_idx on public.daily_activity (user_id, local_date desc);


-- ----------------------------------------------------------------------------
-- streak_freezes — APPEND-ONLY.
--
-- Balance = COUNT(*) WHERE consumed_for_date IS NULL. Never decrement a
-- counter; consuming a freeze sets the date on one row.
--
-- UNIQUE (user_id, consumed_for_date) prevents burning two freezes on the same
-- day. NULLs are distinct in Postgres unique indexes, so any number of freezes
-- can sit banked.
-- ----------------------------------------------------------------------------
create table public.streak_freezes (
  id                bigint generated always as identity primary key,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  granted_at        timestamptz not null default now(),
  source            text not null,
  consumed_for_date date,
  constraint streak_freezes_one_per_day unique (user_id, consumed_for_date)
);

create index streak_freezes_banked_idx
  on public.streak_freezes (user_id) where consumed_for_date is null;


-- ----------------------------------------------------------------------------
-- user_items — ownership. APPEND-ONLY.
-- ----------------------------------------------------------------------------
create table public.user_items (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  item_id         uuid not null references public.items(id) on delete restrict,
  acquired_at     timestamptz not null default now(),
  acquired_via    public.acquisition_type not null,
  ledger_event_id bigint references public.ledger_events(id) on delete restrict,
  primary key (user_id, item_id)   -- can't buy the same item twice
);

create index user_items_item_idx on public.user_items (item_id);


-- ----------------------------------------------------------------------------
-- user_equipped — the loadout. MUTABLE.
--
-- PRIMARY KEY (user_id, slot) enforces "one item per slot" structurally,
-- replacing v1's seven nullable active_*_id columns on profiles.
-- A trigger (005) validates ownership and that items.item_type = slot.
-- ----------------------------------------------------------------------------
create table public.user_equipped (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  slot        text not null references public.slots(code) on delete restrict,
  item_id     uuid not null references public.items(id) on delete restrict,
  equipped_at timestamptz not null default now(),
  primary key (user_id, slot)
);

create index user_equipped_item_idx on public.user_equipped (item_id);


-- ----------------------------------------------------------------------------
-- user_achievements — APPEND-ONLY.
-- ----------------------------------------------------------------------------
create table public.user_achievements (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  uuid not null references public.achievements(id) on delete restrict,
  unlocked_at     timestamptz not null default now(),
  ledger_event_id bigint references public.ledger_events(id) on delete restrict,
  primary key (user_id, achievement_id)   -- idempotent unlocking
);

create index user_achievements_achievement_idx on public.user_achievements (achievement_id);
