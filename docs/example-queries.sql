-- ============================================================================
-- Ascend — example queries & the local test checklist
-- ============================================================================
-- Run these against STAGING. Section 8 is the security checklist: run it as a
-- real signed-in user, never as the service role.
--
-- Prefix `explain (analyze, buffers)` on any query to check the planner is
-- using the indexes from migration 004.
-- ============================================================================


-- ─── 1. Log a habit (complete a mission) ────────────────────────────────────
-- The whole write path in one call: ledger row, streak bonus, freeze grant,
-- level items, achievement evaluation, cache refresh.

select public.ensure_daily_missions();
select public.get_missions();

-- Take an assignment_id from the result above:
select public.complete_mission(1);

-- Returns:
-- {
--   "success": true, "xp_awarded": 50, "coins_awarded": 10,
--   "streak_bonus": 10, "total_xp": 1250, "coins": 340,
--   "level": 6, "xp_into_level": 50, "xp_next": 100,
--   "leveled_up": false, "streak": 8,
--   "new_achievements": [{"code": "week_warrior", ...}]
-- }

-- Undo it — writes compensating rows, never deletes:
select public.uncomplete_mission(1);


-- ─── 2. Today's XP, computed from the ledger ────────────────────────────────
-- The authoritative version. Note local_date, not occurred_at::date: a user
-- in Auckland and a user in Madrid have different "todays".

select
  coalesce(sum(xp_delta), 0)    as xp_today,
  coalesce(sum(coins_delta), 0) as coins_today,
  count(*) filter (where kind in ('mission_daily', 'mission_weekly')) as missions_done
from public.ledger_events
where user_id = auth.uid()
  and local_date = private.local_date_for(auth.uid(), now());

-- The cached version the app actually reads (same numbers, one row read):
select * from public.daily_activity
where user_id = auth.uid()
  and local_date = private.local_date_for(auth.uid(), now());


-- ─── 3. Current streak ──────────────────────────────────────────────────────
-- Cached (what the UI reads — a single indexed row):
select streak_current, streak_longest, last_active_local_date
from public.user_stats
where user_id = auth.uid();

-- Derived from scratch (what the cache must always agree with):
select * from private.compute_streak(auth.uid());

-- The raw days behind it — useful when a user disputes a broken streak:
select local_date, missions_completed, xp_earned, counts_for_streak, freeze_applied
from public.daily_activity
where user_id = auth.uid()
order by local_date desc
limit 30;


-- ─── 4. Weekly XP chart ─────────────────────────────────────────────────────
-- Always exactly 7 rows, Monday..Sunday, in the user's own timezone.
select * from public.get_weekly_xp();


-- ─── 5. Leaderboard ─────────────────────────────────────────────────────────
select * from public.get_leaderboard(50, 0);
select public.get_my_rank();

-- Confirm the leaderboard index is used (expect an index scan on
-- user_stats_leaderboard_idx, NOT a sequential scan + sort):
explain (analyze, buffers)
select * from public.get_leaderboard(50, 0);


-- ─── 6. Shop & inventory ────────────────────────────────────────────────────
select public.ensure_shop_rotation();
select public.get_shop_rotation();

select public.purchase_item('<item-uuid>');
select public.equip_item('<item-uuid>');

select public.get_my_profile();
select public.get_rewards_catalog();


-- ─── 7. THE RECOVERY DRILL ──────────────────────────────────────────────────
-- The single most important test in this file. Snapshot the caches, wipe and
-- rebuild them from the ledger alone, then diff. Any row returned is a bug in
-- the derivation logic.

create temp table stats_before as
  select * from public.user_stats;

select private.recompute_all_stats();

select 'MISMATCH' as problem, b.user_id,
       b.total_xp as before_xp, a.total_xp as after_xp,
       b.coins    as before_coins, a.coins after_coins,
       b.level    as before_level, a.level after_level,
       b.streak_current as before_streak, a.streak_current after_streak
from stats_before b
join public.user_stats a using (user_id)
where (b.total_xp, b.coins, b.level, b.streak_current, b.stat_health,
       b.stat_money, b.stat_discipline)
  is distinct from
      (a.total_xp, a.coins, a.level, a.streak_current, a.stat_health,
       a.stat_money, a.stat_discipline);

-- Expected result: 0 rows. If this is empty, every cached number in the
-- database is reproducible from ledger_events, which is the entire premise of
-- the design. Run it after any change to the XP or streak logic.


-- ─── 8. SECURITY CHECKLIST — run as a signed-in user, NOT service role ──────
-- Testing with elevated keys and shipping tables anyone can read is the single
-- most common Supabase mistake. Every statement below must FAIL.

-- 8a. Grant yourself infinite XP:
insert into public.ledger_events
  (user_id, kind, xp_delta, coins_delta, local_date, idempotency_key)
values (auth.uid(), 'admin_grant', 999999, 999999, current_date, 'hack');
--> expected: permission denied for table ledger_events

-- 8b. Edit history:
update public.ledger_events set xp_delta = 999999 where user_id = auth.uid();
--> expected: permission denied (and the append-only trigger behind it)

-- 8c. Hand yourself coins:
update public.user_stats set coins = 999999 where user_id = auth.uid();
--> expected: permission denied for table user_stats

-- 8d. Read someone else's profile:
select * from public.profiles where id <> auth.uid();
--> expected: 0 rows (RLS, not an error)

-- 8e. Read someone else's ledger:
select * from public.ledger_events where user_id <> auth.uid();
--> expected: 0 rows

-- 8f. Equip an item you do not own:
insert into public.user_equipped (user_id, slot, item_id)
values (auth.uid(), 'frame', '<some-unowned-item-uuid>');
--> expected: exception "User does not own item ..."

-- 8g. Call an internal function directly:
select private.write_ledger(auth.uid(), 'admin_grant', 999999, 0, null, 'hack');
--> expected: permission denied for schema private

-- 8h. Buy something you cannot afford:
select public.purchase_item('<expensive-item-uuid>');
--> expected: {"success": false, "reason": "insufficient_coins"}

-- 8i. Double-award via rapid completion — run twice in a row:
select public.complete_mission(<id>);
select public.complete_mission(<id>);
--> expected: first succeeds, second returns "already_completed".
--    Even if the app logic were wrong, the idempotency key makes a second
--    ledger row impossible.


-- ─── 9. Timezone verification ───────────────────────────────────────────────
-- Prove the cutoff works before trusting it with real streaks.

select public.update_timezone('Pacific/Auckland', 4);

select
  private.local_date_for(auth.uid(), now())                        as today_local,
  private.local_date_for(auth.uid(), '2026-07-15T01:30:00Z')       as at_0130_utc,
  private.week_start_for(private.local_date_for(auth.uid(), now())) as week_start;

-- With a 4am cutoff, an event at 01:30 local must return the PREVIOUS day.
-- That is what stops a late-night gym session from reading as a missed day.

select public.update_timezone('Europe/Madrid', 4);   -- restore


-- ─── 10. Integrity audits — should all return 0 rows ────────────────────────

-- Coins spent but no item received:
select le.* from public.ledger_events le
left join public.user_items ui on ui.ledger_event_id = le.id
where le.kind = 'purchase' and ui.user_id is null;

-- Completed assignments with no ledger event backing them:
select ma.* from public.mission_assignments ma
where ma.completed_at is not null
  and not exists (
    select 1 from public.ledger_events le
    where le.assignment_id = ma.id
      and le.kind in ('mission_daily', 'mission_weekly')
  );

-- Negative balances (the CHECK should make this impossible):
select * from public.user_stats where coins < 0 or total_xp < 0;

-- Freezes consumed for a day that is not marked as frozen:
select f.* from public.streak_freezes f
left join public.daily_activity d
  on d.user_id = f.user_id and d.local_date = f.consumed_for_date
where f.consumed_for_date is not null
  and (d.user_id is null or not d.freeze_applied);
