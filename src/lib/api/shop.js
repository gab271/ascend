import { supabase } from '../supabase';
import { loc, unwrap } from './_shared';

// ─── Ensure + fetch today's shop rotation ─────────────────────
// The rotation is global (same shop for everyone) but "today" is resolved from
// the caller's own timezone, so a user in Auckland never sees an empty shop.
export async function getShopRotation() {
  const { error: ensureError } = await supabase.rpc('ensure_shop_rotation');
  if (ensureError) return { data: null, error: ensureError };

  const { data, error } = await supabase.rpc('get_shop_rotation');
  if (error) return { data: null, error };

  return {
    data: (data ?? []).map((i, idx) => ({
      // Shop.jsx keys off shop_item_id; item_id kept for the purchase call.
      shop_item_id: i.item_id,
      item_id:      i.item_id,
      id:           i.item_id,
      code:         i.code,
      name:         loc(i.name),
      description:  loc(i.description),
      item_type:    i.item_type,
      rarity:       i.rarity,
      config:       i.config ?? {},
      price:        i.price,
      owned:        i.owned,
      // First slot is the featured deal.
      featured:     idx === 0,
    })),
    error: null,
  };
}

// ─── Items the user owns ──────────────────────────────────────
// Reads user_items directly — RLS restricts it to the caller's own rows.
export async function getMyShopItems() {
  const { data, error } = await supabase
    .from('user_items')
    .select(`
      acquired_at,
      acquired_via,
      item:items (
        id, code, name, description, item_type, rarity, price_coins, config
      )
    `)
    .order('acquired_at', { ascending: false });

  if (error) return { data: null, error };

  return {
    data: (data ?? []).map(row => ({
      purchased_at: row.acquired_at,
      acquired_via: row.acquired_via,
      item: row.item ? {
        id:          row.item.id,
        code:        row.item.code,
        name:        loc(row.item.name),
        description: loc(row.item.description),
        item_type:   row.item.item_type,
        rarity:      row.item.rarity,
        price:       row.item.price_coins,
        config:      row.item.config ?? {},
      } : null,
    })),
    error: null,
  };
}

// ─── Equip an owned item ──────────────────────────────────────
// The slot is inferred from the item's type server-side.
export async function setActiveShopItem(itemId) {
  const { data, error } = await supabase.rpc('equip_item', { p_item_id: itemId });
  return { error: unwrap(data, error).error };
}

// ─── Purchase ─────────────────────────────────────────────────
// Charges the ROTATION price, not the catalog price, and re-checks the balance
// server-side. Expected failures (insufficient_coins, already_owned,
// not_in_rotation) arrive as errors with `hint` set to the reason.
export async function purchaseShopItem(itemId) {
  const { data, error } = await supabase.rpc('purchase_item', {
    p_item_id: itemId,
  });
  const res = unwrap(data, error);
  if (res.error) return res;

  return {
    data: {
      ...res.data,
      // Shop.jsx renders data.item_name in its toast.
      item_name: res.data.item_code,
    },
    error: null,
  };
}
