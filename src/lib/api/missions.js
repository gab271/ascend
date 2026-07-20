import { supabase } from '../supabase';
import { loc, unwrap } from './_shared';

// ─── NOTE ON DATES ────────────────────────────────────────────
// This file used to contain a getWeekStart() helper that computed the ISO week
// in BROWSER-local time and sent it to a UTC database — users near midnight got
// the wrong week. It is gone on purpose.
//
// The client must never compute a date. It has no authority over what "today"
// means for a given user; only the server knows their timezone and day cutoff.
// Every date now comes from the database.

// Shapes a server mission into what the UI components expect.
//
// `id` is the ASSIGNMENT id, not the mission id. That is deliberate: from the
// UI's point of view a row *is* one assignment, and complete_mission() takes an
// assignment id — so MissionRow's onComplete(mission.id) stays correct.
function shapeMission(m) {
  return {
    id:            m.assignment_id,
    assignment_id: m.assignment_id,
    code:          m.code,
    name:          loc(m.name),
    description:   loc(m.description),
    xp:            m.xp,
    coins_reward:  m.coins,
    attribute:     m.attribute,
    rarity:        m.rarity,
    icon:          m.icon,
    target_value:  m.target_value,
    target_unit:   m.target_unit,
    completed:     m.completed,
    completed_at:  m.completed_at,
  };
}

// Wraps a mission in the { id, completed, mission } row shape the pages
// already normalize against.
function shapeRow(m) {
  const mission = shapeMission(m);
  return {
    id:           mission.id,
    completed:    mission.completed,
    completed_at: mission.completed_at,
    xp_awarded:   mission.completed ? mission.xp : null,
    mission,
  };
}

// One RPC returns dailies AND weeklies, along with the server-derived
// local_date and week_start. Cached briefly so a page rendering both lists
// doesn't fetch twice.
let _cache = null;
async function fetchAll({ force = false } = {}) {
  if (_cache && !force) return _cache;

  const [{ error: eDaily }, { error: eWeekly }] = await Promise.all([
    supabase.rpc('ensure_daily_missions'),
    supabase.rpc('ensure_weekly_missions'),
  ]);
  if (eDaily || eWeekly) return { data: null, error: eDaily ?? eWeekly };

  const { data, error } = await supabase.rpc('get_missions');
  _cache = { data, error };
  // Short-lived: just long enough to dedupe one page load.
  setTimeout(() => { _cache = null; }, 1000);
  return _cache;
}

// ─── Daily missions ───────────────────────────────────────────
export async function getDailyMissions() {
  const { data, error } = await fetchAll();
  if (error) return { data: null, error };
  return { data: (data?.daily ?? []).map(shapeRow), error: null };
}

// ─── Weekly missions ──────────────────────────────────────────
export async function getWeeklyMissions() {
  const { data, error } = await fetchAll();
  if (error) return { data: null, error };
  return { data: (data?.weekly ?? []).map(shapeRow), error: null };
}

// ─── Complete a mission ───────────────────────────────────────
// Daily and weekly now share one function — the assignment already knows its
// cadence, so there is nothing for the client to pick.
//
// Returns { data, error } where data is:
//   { success, xp_awarded, coins_awarded, streak_bonus, total_xp, coins,
//     level, xp_into_level, xp_next, leveled_up, streak, new_achievements[] }
export async function completeMission(assignmentId) {
  const { data, error } = await supabase.rpc('complete_mission', {
    p_assignment_id: assignmentId,
  });
  _cache = null;
  return unwrap(data, error);
}

// Kept as an alias so existing imports keep working.
export const completeWeeklyMission = completeMission;

// ─── Undo a completion ────────────────────────────────────────
// Writes compensating ledger rows; never deletes history.
export async function uncompleteMission(assignmentId) {
  const { data, error } = await supabase.rpc('uncomplete_mission', {
    p_assignment_id: assignmentId,
  });
  _cache = null;
  return unwrap(data, error);
}

// ─── Onboarding ───────────────────────────────────────────────
export async function completeOnboarding(categories) {
  const { data, error } = await supabase.rpc('complete_onboarding', {
    p_categories: categories,
  });
  _cache = null;
  const res = unwrap(data, error);
  return { error: res.error };
}

// ─── Mission preferences ──────────────────────────────────────
export async function getMissionPreferences() {
  const { data, error } = await supabase.rpc('get_my_profile');
  if (error) return { data: ['health', 'money', 'discipline'], error };
  return { data: data?.mission_categories ?? ['health', 'money', 'discipline'], error: null };
}

export async function updateMissionPreferences(categories) {
  const { data, error } = await supabase.rpc('update_mission_preferences', {
    p_categories: categories,
  });
  _cache = null;
  const res = unwrap(data, error);
  return { error: res.error };
}

// ─── Full mission catalog ─────────────────────────────────────
// Used on /missions to show everything available. Reads the table directly —
// the catalog is world-readable to signed-in users.
export async function getMissionsCatalog() {
  const { data, error } = await supabase
    .from('missions')
    .select('id, code, name, description, xp_reward, coins_reward, attribute, rarity, icon, cadence')
    .eq('is_active', true)
    .order('rarity')
    .order('xp_reward', { ascending: false });

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map(m => ({
      id:          m.id,
      code:        m.code,
      name:        loc(m.name),
      description: loc(m.description),
      xp:          m.xp_reward,
      coins_reward: m.coins_reward,
      attribute:   m.attribute,
      rarity:      m.rarity,
      icon:        m.icon,
      cadence:     m.cadence,
    })),
    error: null,
  };
}
