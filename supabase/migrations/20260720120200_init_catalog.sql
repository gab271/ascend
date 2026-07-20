-- ============================================================================
-- 003 — Content catalog: level curve, rank tiers, missions, achievements,
--       items, shop rotations
-- ============================================================================
-- Every table here is CONTENT. Adding a mission, a cosmetic, an achievement,
-- or rebalancing the level curve is an INSERT/UPDATE — never a migration.
--
-- All of them carry a stable `code` slug. Seeds reference the code, never the
-- generated UUID, so seed.sql is idempotent and re-runnable forever. This is
-- what makes a from-scratch rebuild reproducible.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- level_curve — a TABLE, not a formula.
--
-- level = MAX(level) WHERE cumulative_xp <= total_xp
--
-- Stored as rows so progression can be rebalanced by updating data instead of
-- shipping a migration and re-deriving every user.
-- ----------------------------------------------------------------------------
create table public.level_curve (
  level         int primary key check (level >= 1),
  cumulative_xp bigint not null unique check (cumulative_xp >= 0),
  title         jsonb
);

-- ----------------------------------------------------------------------------
-- rank_tiers — the soloq ladder (Bronze → Challenger)
-- ----------------------------------------------------------------------------
create table public.rank_tiers (
  code         text primary key,
  name         jsonb not null,
  min_total_xp bigint not null unique check (min_total_xp >= 0),
  icon         text,
  color        text,
  sort_order   int not null,
  constraint rank_tiers_name_locales
    check (jsonb_exists(name, 'en') and jsonb_exists(name, 'es'))
);

-- ----------------------------------------------------------------------------
-- missions
--
-- name/description are jsonb {"en": ..., "es": ...} rather than a separate
-- mission_translations table. Deliberate, justified denormalization: they are
-- ALWAYS fetched with their mission and never queried independently, so a join
-- would cost on every read and buy nothing. The CHECK gives the integrity a
-- table would have provided. This is the only denormalization in the schema.
-- ----------------------------------------------------------------------------
create table public.missions (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          jsonb not null,
  description   jsonb not null,
  cadence       public.cadence_type not null,
  attribute     public.attribute_type not null,
  rarity        public.rarity_type not null,
  xp_reward     int not null check (xp_reward >= 0),
  coins_reward  int not null default 0 check (coins_reward >= 0),
  icon          text not null,
  target_value  numeric,
  target_unit   text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  constraint missions_name_locales
    check (jsonb_exists(name, 'en') and jsonb_exists(name, 'es')),
  constraint missions_description_locales
    check (jsonb_exists(description, 'en') and jsonb_exists(description, 'es'))
);

-- Partial index: the assignment pool only ever queries active missions.
create index missions_pool_idx
  on public.missions (cadence, attribute) where is_active;

comment on column public.missions.code is
  'Stable slug (e.g. run_5k). Seeds key on this so they are re-runnable.';

-- ----------------------------------------------------------------------------
-- achievements
--
-- `criteria` as jsonb is what delivers "new content without migrations".
-- A single evaluator function (private.evaluate_achievements) reads it:
--   {"type": "streak_reach",   "value": 30}
--   {"type": "level_reach",    "value": 25}
--   {"type": "total_xp",       "value": 50000}
--   {"type": "missions_total", "value": 100}
--   {"type": "attribute_xp",   "attribute": "health", "value": 5000}
-- ----------------------------------------------------------------------------
create table public.achievements (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique,
  name         jsonb not null,
  description  jsonb not null,
  rarity       public.rarity_type not null,
  icon         text not null,
  xp_reward    int not null default 0 check (xp_reward >= 0),
  coins_reward int not null default 0 check (coins_reward >= 0),
  criteria     jsonb not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  constraint achievements_criteria_typed
    check (jsonb_exists(criteria, 'type')),
  constraint achievements_name_locales
    check (jsonb_exists(name, 'en') and jsonb_exists(name, 'es'))
);

-- ----------------------------------------------------------------------------
-- items — ALL cosmetics in one table.
--
-- Replaces v1's titles + cosmetics + shop_items (three catalog tables, three
-- join tables, and seven active_*_id columns on profiles). Render config lives
-- in `config` jsonb, so a new cosmetic type needs zero schema changes.
-- ----------------------------------------------------------------------------
create table public.items (
  id                    uuid primary key default gen_random_uuid(),
  code                  text not null unique,
  item_type             text not null references public.slots(code) on delete restrict,
  name                  jsonb not null,
  description           jsonb not null default '{"en": "", "es": ""}'::jsonb,
  rarity                public.rarity_type not null,
  config                jsonb not null default '{}'::jsonb,
  acquisition           public.acquisition_type not null,
  price_coins           int check (price_coins >= 0),
  unlock_level          int check (unlock_level >= 1),
  unlock_achievement_id uuid references public.achievements(id) on delete restrict,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),

  -- Each acquisition route must carry the data that route needs.
  constraint items_shop_needs_price
    check (acquisition <> 'shop' or price_coins is not null),
  constraint items_level_needs_level
    check (acquisition <> 'level' or unlock_level is not null),
  constraint items_achievement_needs_ref
    check (acquisition <> 'achievement' or unlock_achievement_id is not null),
  constraint items_name_locales
    check (jsonb_exists(name, 'en') and jsonb_exists(name, 'es'))
);

create index items_type_idx on public.items (item_type) where is_active;
create index items_shop_idx on public.items (acquisition) where is_active;
-- FKs are not auto-indexed by Postgres; unindexed FKs make deletes slow.
create index items_unlock_achievement_idx on public.items (unlock_achievement_id);

-- ----------------------------------------------------------------------------
-- shop_rotations — APPEND-ONLY. Global rotation (same shop for everyone).
--
-- price_coins is SNAPSHOTTED so a historical purchase always reconciles
-- against what was actually charged, even after the catalog price changes.
-- ----------------------------------------------------------------------------
create table public.shop_rotations (
  rotation_date date not null,
  item_id       uuid not null references public.items(id) on delete restrict,
  price_coins   int not null check (price_coins >= 0),
  slot_index    int not null,
  created_at    timestamptz not null default now(),
  primary key (rotation_date, item_id)
);

create index shop_rotations_item_idx on public.shop_rotations (item_id);
