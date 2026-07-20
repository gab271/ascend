import { supabase } from '../supabase';
import { loc, unwrap } from './_shared';

// ─── Equipped-item mapping ────────────────────────────────────
// The database now has ONE items table and a user_equipped(user_id, slot) row
// per slot, replacing v1's separate titles/cosmetics/shop_items tables and the
// seven active_*_id columns on profiles.
//
// The pages still read active_title / active_frame / active_shop_emote, so this
// maps the new `equipped` object back onto those names. Keeps the UI working
// without a rewrite of every component.
function shapeEquipped(slotItem) {
  if (!slotItem) return null;
  return {
    id:        slotItem.item_id,
    code:      slotItem.code,
    name:      loc(slotItem.name),
    rarity:    slotItem.rarity,
    config:    slotItem.config ?? {},
    item_type: slotItem.item_type,
  };
}

function shapeProfile(raw) {
  if (!raw) return null;
  const eq = raw.equipped ?? {};

  return {
    id:         raw.id,
    username:   raw.username,
    avatar_url: raw.avatar_url,
    created_at: raw.created_at,

    total_xp:        raw.total_xp ?? 0,
    coins:           raw.coins ?? 0,
    level:           raw.level ?? 1,
    xp:              raw.xp ?? 0,
    xp_next:         raw.xp_next ?? 100,
    streak:          raw.streak ?? 0,
    longest_streak:  raw.longest_streak ?? 0,
    is_private:      raw.is_private ?? false,

    // Attributes are DATA now, not three fixed columns. The array arrives
    // ordered by sort_order and already carries its own label, colour and
    // icon — so adding a seventh life area to the `attributes` table makes a
    // seventh card appear with no frontend change at all.
    attributes: (raw.attributes ?? []).map(a => ({
      code:  a.code,
      label: loc(a.label),
      color: a.color,
      icon:  a.icon,
      xp:    Number(a.xp ?? 0),
    })),

    // New in v2 — the soloq tier and banked streak freezes.
    tier: raw.tier ? { ...raw.tier, name: loc(raw.tier.name) } : null,
    freezes_banked: raw.freezes_banked ?? 0,

    timezone:           raw.timezone,
    day_cutoff_hour:    raw.day_cutoff_hour,
    mission_categories: raw.mission_categories ?? ['health', 'money', 'discipline'],
    onboarded:          raw.onboarded ?? false,

    // Legacy-compatible equipped slots
    active_title:      shapeEquipped(eq.title),
    active_frame:      shapeEquipped(eq.frame),
    active_background: shapeEquipped(eq.background),
    active_shop_frame:     shapeEquipped(eq.frame),
    active_shop_emote:     shapeEquipped(eq.emote),
    active_shop_nameplate: shapeEquipped(eq.nameplate),
    active_shop_banner:    shapeEquipped(eq.banner),

    equipped: eq,
  };
}

// ─── Fetch own profile ────────────────────────────────────────
// One RPC replaces v1's profiles select with seven nested joins.
export async function getMyProfile() {
  const { data, error } = await supabase.rpc('get_my_profile');
  if (error) return { data: null, error };
  return { data: shapeProfile(data), error: null };
}

// v1 had a separate "full" variant because shop-item joins could fail if
// migrations weren't applied. One RPC returns everything now, so they're the
// same call — kept as an alias so Profile.jsx keeps working.
export const getMyProfileFull = getMyProfile;

// ─── Weekly XP chart ──────────────────────────────────────────
// Returns exactly 7 numbers, Monday..Sunday.
//
// v1 built the week client-side with new Date() and toISOString() — browser
// local time against a UTC database. The server derives it now, from the user's
// stored timezone and day cutoff.
export async function getWeeklyXP() {
  const { data, error } = await supabase.rpc('get_weekly_xp');
  if (error) return { data: null, error };
  const week = (data ?? []).map(r => r.xp_earned ?? 0);
  while (week.length < 7) week.push(0);
  return { data: week.slice(0, 7), error: null };
}

// ─── Update username ──────────────────────────────────────────
export async function updateUsername(username) {
  const { data, error } = await supabase.rpc('update_username', {
    p_username: username,
  });
  return { error: unwrap(data, error).error };
}

// ─── Update timezone / day cutoff ─────────────────────────────
// New in v2. Past days keep the dates they were earned on — changing this
// affects future entries only.
export async function updateTimezone(timezone, cutoffHour = null) {
  const { data, error } = await supabase.rpc('update_timezone', {
    p_timezone:    timezone,
    p_cutoff_hour: cutoffHour,
  });
  return { error: unwrap(data, error).error };
}

// ─── Upload avatar ────────────────────────────────────────────
export async function uploadAvatar(file) {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: userError ?? new Error('No autenticado') };

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { error: { message: 'Solo se permiten imágenes JPG, PNG o WebP.' } };
  }
  if (file.size > 2 * 1024 * 1024) {
    return { error: { message: 'La imagen no puede superar 2 MB.' } };
  }

  const ext  = file.name.split('.').pop().toLowerCase();
  // Path must start with the user's id — the storage RLS policy checks it.
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(path);

  // Cache-bust so the <img> refreshes after an overwrite.
  const busted = `${publicUrl}?v=${Date.now()}`;

  const { data, error: rpcError } = await supabase.rpc('update_avatar_url', {
    p_avatar_url: publicUrl,
  });
  const res = unwrap(data, rpcError);

  return { data: busted, error: res.error };
}

// ─── Equip a cosmetic ─────────────────────────────────────────
// The slot is inferred from the item, so the `type` argument v1 passed is no
// longer needed. Kept in the signature for call-site compatibility.
export async function setActiveCosmetic(_type, itemId) {
  const { data, error } = await supabase.rpc('equip_item', { p_item_id: itemId });
  return { error: unwrap(data, error).error };
}

export async function unequipSlot(slot) {
  const { data, error } = await supabase.rpc('unequip_slot', { p_slot: slot });
  return { error: unwrap(data, error).error };
}

// ─── Rewards catalog ──────────────────────────────────────────
// One RPC replaces v1's six parallel queries.
// Returned in the { badges, titles, frames, backgrounds } shape Rewards.jsx
// already renders — "badges" are achievements.
export async function getRewardsCatalog() {
  const { data, error } = await supabase.rpc('get_rewards_catalog');
  if (error) return { data: null, error };

  const items = data?.items ?? [];
  const achievements = data?.achievements ?? [];

  const shapeItem = (i) => ({
    id:          i.item_id,
    code:        i.code,
    name:        loc(i.name),
    description: loc(i.description),
    rarity:      i.rarity,
    config:      i.config ?? {},
    item_type:   i.item_type,
    acquisition: i.acquisition,
    price:       i.price_coins,
    unlock_level: i.unlock_level,
    unlocked:    i.owned,
    equipped:    i.equipped,
    // Cosmetics have no emoji of their own; fall back to a slot glyph so
    // RewardCard always renders something.
    icon: ({ title: '🏷️', frame: '🖼️', background: '🌌',
             banner: '🎌', nameplate: '📛', emote: '😀' })[i.item_type] ?? '✨',
  });

  const byType = (t) => items.filter(i => i.item_type === t).map(shapeItem);

  return {
    data: {
      badges: achievements.map(a => ({
        id:          a.code,
        code:        a.code,
        name:        loc(a.name),
        description: loc(a.description),
        rarity:      a.rarity,
        icon:        a.icon,
        xp_required: a.xp_reward,
        unlocked:    a.unlocked,
        unlocked_at: a.unlocked_at,
      })),
      titles:      byType('title'),
      frames:      byType('frame'),
      backgrounds: byType('background'),
      banners:     byType('banner'),
      nameplates:  byType('nameplate'),
      emotes:      byType('emote'),
    },
    error: null,
  };
}

// ─── Account deletion ─────────────────────────────────────────
// Soft delete: recoverable for 30 days, then hard-deleted for GDPR.
export async function requestAccountDeletion() {
  const { data, error } = await supabase.rpc('request_account_deletion');
  return unwrap(data, error);
}
