import { supabase } from '../supabase';
import { loc } from './_shared';

// ─── Get paginated ranking ────────────────────────────────────
// get_leaderboard() is a SECURITY DEFINER function and the ONLY way to see
// other users. profiles is own-row-only under RLS, so this returns display
// columns exclusively — no email, timezone, or preferences leak.
//
// Rows: { rank, user_id, username, avatar_url, level, total_xp, streak,
//         tier_code, tier_name, title_name, is_me }
export async function getRanking({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_limit:  Math.min(limit, 100),
    p_offset: offset,
  });
  if (error) return { data: null, error };

  return {
    data: (data ?? []).map(r => ({
      rank:       Number(r.rank),
      user_id:    r.user_id,
      username:   r.username,
      avatar_url: r.avatar_url,
      level:      r.level,
      total_xp:   Number(r.total_xp ?? 0),
      streak:     r.streak,
      tier_code:  r.tier_code,
      tier_name:  loc(r.tier_name),
      title_name: loc(r.title_name),
      is_me:      r.is_me,
    })),
    error: null,
  };
}

// ─── Get the current user's rank position ─────────────────────
// v1 fetched the top 100 and searched client-side, so anyone outside the top
// 100 simply had no rank. get_my_rank() counts server-side and is exact at any
// position. The leaderboard row is merged in when the user is on page one.
export async function getMyRank() {
  const [{ data: rankData, error: rankErr }, { data: board }] = await Promise.all([
    supabase.rpc('get_my_rank'),
    getRanking({ limit: 100 }),
  ]);

  if (rankErr) return { data: null, error: rankErr };

  const mine = (board ?? []).find(r => r.is_me) ?? null;

  return {
    data: {
      ...(mine ?? {}),
      rank:          rankData?.rank ?? mine?.rank ?? null,
      total_players: rankData?.total_players ?? null,
      is_me:         true,
    },
    error: null,
  };
}
