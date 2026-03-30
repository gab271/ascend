import { supabase } from '../supabase';

// ─── Ensure + fetch today's shop rotation ────────────────────
// Calls ensure_shop_rotation() (idempotent) then get_shop_rotation().
// Returns { data: ShopItem[], error }
export async function getShopRotation() {
  const { error: ensureError } = await supabase.rpc('ensure_shop_rotation');
  if (ensureError) return { data: null, error: ensureError };

  const { data, error } = await supabase.rpc('get_shop_rotation');
  return { data, error };
}

// ─── Purchase a shop item ─────────────────────────────────────
// Returns { data: { success, item_name, coins_spent, coins_remaining, ... }, error }
export async function purchaseShopItem(itemId) {
  const { data, error } = await supabase.rpc('purchase_shop_item', {
    p_item_id: itemId,
  });
  return { data, error };
}
