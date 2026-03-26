import { supabase } from '../supabase';

// ─── Get paginated ranking ────────────────────────────────────
// Calls get_ranking() SECURITY DEFINER RPC (max 100 rows per call).
// Returns rows shaped as:
//   { rank, user_id, username, level, total_xp, streak,
//     avatar_url, title_name, title_rarity, is_me }
export async function getRanking({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('get_ranking', {
    p_limit:  Math.min(limit, 100),
    p_offset: offset,
  });
  return { data, error };
}

// ─── Get current user's rank position ────────────────────────
// Fetches the top 200 and finds the calling user's entry.
// For more precision at scale, a dedicated DB function would be better.
export async function getMyRank() {
  const { data, error } = await supabase.rpc('get_ranking', {
    p_limit:  100,
    p_offset: 0,
  });
  if (error) return { data: null, error };

  const myEntry = (data || []).find(r => r.is_me);
  return { data: myEntry ?? null, error: null };
}
