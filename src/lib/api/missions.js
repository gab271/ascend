import { supabase } from '../supabase';

// ─── Get today's missions ─────────────────────────────────────
// Lazily assigns missions for today if not yet done (idempotent RPC),
// then fetches the full list with mission details joined.
export async function getDailyMissions() {
  // Ensure missions are assigned (no-op if already done today)
  const { error: assignError } = await supabase.rpc('ensure_daily_missions');
  if (assignError) return { data: null, error: assignError };

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('user_daily_missions')
    .select(`
      id,
      completed,
      completed_at,
      xp_awarded,
      assigned_date,
      mission:missions (
        id, name, description, xp, attribute, rarity, icon
      )
    `)
    .eq('assigned_date', today)
    .order('id');

  return { data, error };
}

// ─── Complete a mission ───────────────────────────────────────
// Calls the complete_mission() SECURITY DEFINER RPC.
// The RPC validates, awards XP, updates streak, unlocks rewards.
//
// Returns { data, error } where data is:
//   {
//     success, xp_awarded, streak_bonus, new_total_xp,
//     new_level, new_xp, new_xp_next, leveled_up, new_streak,
//     new_badges: [], new_titles: [], new_cosmetics: []
//   }
export async function completeMission(missionId) {
  const { data, error } = await supabase.rpc('complete_mission', {
    p_mission_id: missionId,
  });
  return { data, error };
}

// ─── Full mission catalog ─────────────────────────────────────
// Used on the /missions page to show all available missions.
export async function getMissionsCatalog() {
  const { data, error } = await supabase
    .from('missions')
    .select('id, name, description, xp, attribute, rarity, icon')
    .eq('is_active', true)
    .order('rarity')
    .order('xp', { ascending: false });

  return { data, error };
}
