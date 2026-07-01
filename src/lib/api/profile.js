import { supabase } from '../supabase';

// ─── Fetch own profile (core fields only) ────────────────────
// Used by Dashboard, Sidebar, and any page that doesn't need
// shop-item cosmetics. Does NOT join shop_items so it works even
// if migrations 00009/00012 haven't been applied yet.
export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      total_xp,
      level,
      xp,
      xp_next,
      streak,
      longest_streak,
      last_active_date,
      stat_health,
      stat_money,
      stat_discipline,
      coins,
      created_at,
      active_title:titles!active_title_id (
        id, name, rarity
      ),
      active_frame:cosmetics!active_frame_id (
        id, name, rarity, config
      ),
      active_background:cosmetics!active_background_id (
        id, name, rarity, config
      )
    `)
    .single();

  return { data, error };
}

// ─── Fetch own profile (full — includes shop item cosmetics) ──
// Used only by the Profile page, which renders equipped shop items.
// Requires migrations 00009 (shop_items table) and 00012
// (active_shop_*_id columns on profiles) to be applied.
export async function getMyProfileFull() {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      avatar_url,
      total_xp,
      level,
      xp,
      xp_next,
      streak,
      longest_streak,
      last_active_date,
      stat_health,
      stat_money,
      stat_discipline,
      coins,
      created_at,
      active_title:titles!active_title_id (
        id, name, rarity
      ),
      active_frame:cosmetics!active_frame_id (
        id, name, rarity, config
      ),
      active_background:cosmetics!active_background_id (
        id, name, rarity, config
      ),
      active_shop_frame:shop_items!active_shop_frame_id (
        id, name, rarity, config, item_type
      ),
      active_shop_emote:shop_items!active_shop_emote_id (
        id, name, rarity, config, item_type
      ),
      active_shop_nameplate:shop_items!active_shop_nameplate_id (
        id, name, rarity, config, item_type
      ),
      active_shop_banner:shop_items!active_shop_banner_id (
        id, name, rarity, config, item_type
      )
    `)
    .single();

  return { data, error };
}

// ─── Weekly XP chart data ────────────────────────────────────
// Returns [{day: '2026-03-24', xp_earned: 320}, ...]
// Fills missing days with 0 so the chart always shows 7 bars.
export async function getWeeklyXP() {
  const { data, error } = await supabase.rpc('get_weekly_xp');
  if (error) return { data: null, error };

  // Build a full 7-day array starting from Monday
  const today  = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  const byDay = Object.fromEntries((data || []).map(r => [r.day, r.xp_earned]));

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toISOString().split('T')[0];
    return byDay[key] ?? 0;
  });

  return { data: week, error: null };
}

// ─── Update username ─────────────────────────────────────────
// Goes through the update_username() SECURITY DEFINER RPC.
export async function updateUsername(username) {
  const { error } = await supabase.rpc('update_username', {
    p_username: username,
  });
  return { error };
}

// ─── Upload avatar and update profile ────────────────────────
export async function uploadAvatar(file) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: userError ?? new Error('No autenticado') };

  // Validate file type and size client-side
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: { message: 'Solo se permiten imágenes JPG, PNG o WebP.' } };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: { message: 'La imagen no puede superar 2 MB.' } };
  }

  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  // Validate + store via SECURITY DEFINER RPC
  const { error: updateError } = await supabase.rpc('update_avatar_url', {
    p_avatar_url: publicUrl,
  });

  return { data: publicUrl, error: updateError };
}

// ─── Equip a cosmetic item ────────────────────────────────────
// type: 'title' | 'frame' | 'background'
export async function setActiveCosmetic(type, itemId) {
  const { error } = await supabase.rpc('set_active_cosmetic', {
    p_type:    type,
    p_item_id: itemId,
  });
  return { error };
}

// ─── Rewards catalog ─────────────────────────────────────────
// Fetches everything the user owns and the full catalog in parallel,
// then merges them (unlocked flag).
export async function getRewardsCatalog() {
  const [
    { data: allBadges,     error: e1 },
    { data: allTitles,     error: e2 },
    { data: allCosmetics,  error: e3 },
    { data: ownedBadges,   error: e4 },
    { data: ownedTitles,   error: e5 },
    { data: ownedCosm,     error: e6 },
  ] = await Promise.all([
    supabase.from('badges').select('*').order('xp_required'),
    supabase.from('titles').select('*').order('xp_required'),
    supabase.from('cosmetics').select('*').order('xp_required'),
    supabase.from('user_badges').select('badge_id'),
    supabase.from('user_titles').select('title_id'),
    supabase.from('user_cosmetics').select('cosmetic_id'),
  ]);

  const error = e1 || e2 || e3 || e4 || e5 || e6;
  if (error) return { data: null, error };

  const ownedBadgeIds  = new Set((ownedBadges  || []).map(r => r.badge_id));
  const ownedTitleIds  = new Set((ownedTitles  || []).map(r => r.title_id));
  const ownedCosmetIds = new Set((ownedCosm    || []).map(r => r.cosmetic_id));

  return {
    data: {
      badges:      (allBadges    || []).map(b => ({ ...b, unlocked: ownedBadgeIds.has(b.id) })),
      titles:      (allTitles    || []).map(t => ({ ...t, unlocked: ownedTitleIds.has(t.id) })),
      frames:      (allCosmetics || []).filter(c => c.type === 'frame').map(c => ({ ...c, unlocked: ownedCosmetIds.has(c.id) })),
      backgrounds: (allCosmetics || []).filter(c => c.type === 'background').map(c => ({ ...c, unlocked: ownedCosmetIds.has(c.id) })),
    },
    error: null,
  };
}
