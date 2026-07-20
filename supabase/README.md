# Ascend — database runbook

Operational steps. For *why* the schema looks the way it does, see
[`../docs/database-design.md`](../docs/database-design.md).

---

## Apply a migration

Migrations are **forward-only** and applied in filename order. Never edit one
that has already been applied — write a new one.

### Dashboard (no Docker, current workflow)

1. Supabase → SQL Editor
2. Paste the whole file wrapped in a transaction:
   ```sql
   begin;
   -- paste migration here
   commit;
   ```
   If it fails, everything rolls back and you retry from a known state.
3. Record it, or a future `supabase db push` will try to reapply everything:
   ```sql
   insert into supabase_migrations.schema_migrations (version, name)
   values ('<timestamp>', '<name_without_timestamp>')
   on conflict do nothing;
   ```

### CLI (also no Docker — `db push` talks straight to the remote)

```bash
npx supabase link --project-ref <ref>
npx supabase db push
```

Only `supabase start` and `supabase db diff` need Docker. You need neither.

---

## Seed

```sql
-- SQL Editor: paste all of supabase/seed.sql
```

Every statement is `on conflict (code) do update`, so it is **idempotent** —
re-run it any time. This is also how you ship new content: add a mission to
`seed.sql`, commit, re-run.

Re-run the seed after any migration that adds attributes or catalog tables.

Verify:
```sql
select
  (select count(*) from public.attributes)               as attributes,   -- 6
  (select count(*) from public.missions where is_active) as missions,     -- 60
  (select count(*) from public.items    where is_active) as items,        -- 22
  (select count(*) from public.achievements)             as achievements, -- 15
  (select count(*) from public.level_curve)              as levels;       -- 100
```

---

## After ANY migration that adds a table

Supabase's default privileges grant `ALL` on new public tables to `anon`.
Migration 011 revoked those defaults, but verify — this must return **0 rows**:

```sql
select table_name from information_schema.role_table_grants
where table_schema = 'public' and grantee = 'anon';
```

And RLS must be on everywhere — also **0 rows**:

```sql
select tablename from pg_tables
where schemaname = 'public' and not rowsecurity;
```

---

## Backups

### Layer 1 — schema in git ✅
The `migrations/` folder *is* a schema backup. Already done, and it is the
thing whose absence made v1 unrecoverable.

### Layer 2 — nightly `pg_dump` ⚠️ needs a one-time secret

[`../.github/workflows/backup.yml`](../.github/workflows/backup.yml) runs daily
at 03:00 UTC and keeps 90 days of artifacts, versus the free plan's 7. It also
acts as a keep-alive so the project never idles into a pause.

**It does nothing until you set the secret:**

1. Supabase → Settings → Database → Connection string → **URI** (session pooler)
2. https://github.com/gab271/ascend/settings/secrets/actions → New repository secret
   - Name: `SUPABASE_DB_URL`
   - Value: the full `postgresql://...` URI, password included
3. Actions tab → "Database backup" → **Run workflow** to confirm it works

### Restore

```bash
gunzip ascend-full-YYYY-MM-DD.sql.gz
psql "$TARGET_DB_URL" -f ascend-full-YYYY-MM-DD.sql
```

Restore into **staging** first. A backup you have never restored is a
hypothesis, not a backup.

### Before any risky schema change

Actions → Database backup → Run workflow. Ten seconds, and it is the one that
saves you.

---

## Health checks

### The recovery drill — the most important test in the project

Proves every cached number is reproducible from `ledger_events` alone. Run it
after any change to XP, streak or attribute logic.

```sql
create temp table stats_before as select * from public.user_stats;

select private.recompute_all_stats();

select 'MISMATCH' as problem, b.user_id, b.total_xp, a.total_xp, b.level, a.level
from stats_before b
join public.user_stats a using (user_id)
where (b.total_xp, b.coins, b.level, b.streak_current)
  is distinct from (a.total_xp, a.coins, a.level, a.streak_current);
```

**Expect 0 rows.** Anything else is a bug in the derivation logic.

### End-to-end + security

Sign in, open DevTools console, paste
[`../docs/verify-console.js`](../docs/verify-console.js). It runs the happy
path and six cheat attempts that must all fail.

### Integrity audits

Section 10 of [`../docs/example-queries.sql`](../docs/example-queries.sql) —
all should return 0 rows.

---

## Adding content (no migration needed)

This is the point of the design. All of these are plain `INSERT`s in `seed.sql`:

| To add | Insert into | Notes |
|---|---|---|
| A mission | `missions` | `icon` must be an **emoji** — the UI renders it raw |
| A life category | `attributes` | Dashboard and profile pick it up automatically |
| An achievement | `achievements` | `criteria` jsonb; the evaluator never changes |
| A cosmetic | `items` | `item_type` must match a row in `slots` |
| A cosmetic slot | `slots` | e.g. `avatar_border` |
| A rank tier | `rank_tiers` | |
| Rebalanced levels | `level_curve` | Update rows; users re-level on next recompute |

Always key on `code`, never a generated UUID — that is what keeps seeds
re-runnable.
