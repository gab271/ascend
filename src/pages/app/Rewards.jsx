import { useState, useEffect } from 'react';
import { getMyProfile, getRewardsCatalog, setActiveCosmetic } from '../../lib/api/profile';
import { getMyShopItems } from '../../lib/api/shop';
import RewardCard from '../../components/game/RewardCard';

const CATEGORIES = ['badges', 'titles', 'frames', 'backgrounds', 'shop'];
const CATEGORY_LABELS = {
  badges:      'Insignias',
  titles:      'Títulos',
  frames:      'Marcos',
  backgrounds: 'Fondos',
  shop:        'Tienda',
};

// Maps Rewards tab category → RPC type. Badges are not equippable.
const CATEGORY_TYPE = { titles: 'title', frames: 'frame', backgrounds: 'background' };

const RARITY_COLOR = {
  common: '#8B9AB3', rare: '#33D1FF', epic: '#7C5CFF', legendary: '#F5C451',
};
const RARITY_LABEL = {
  common: 'COMÚN', rare: 'RARA', epic: 'ÉPICA', legendary: 'LEGENDARIA',
};
const TYPE_LABEL = {
  animated_frame: 'Marco Animado', emote: 'Emote',
  nameplate: 'Chapa', profile_banner: 'Banner de Perfil',
};

function ShopItemCard({ item }) {
  const color = RARITY_COLOR[item.rarity] || '#8B9AB3';
  const cfg   = item.config || {};
  // Simple emoji/color preview
  const preview = item.item_type === 'emote'
    ? cfg.emoji || '✨'
    : item.item_type === 'nameplate'
      ? '🏷️'
      : item.item_type === 'profile_banner'
        ? '🖼️'
        : '🔮';

  return (
    <div style={{
      background: 'var(--panel)',
      border: `1px solid ${color}44`,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{
        height: 80,
        background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        {preview}
      </div>
      <div style={{ padding: '10px 14px 14px' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: color, letterSpacing: '0.12em', marginBottom: 4,
        }}>
          {RARITY_LABEL[item.rarity]} · {TYPE_LABEL[item.item_type]}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
          color: 'var(--text)', marginBottom: 4,
        }}>
          {item.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-muted)', lineHeight: 1.4,
        }}>
          {item.description}
        </div>
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)',
        }}>
          🪙 {item.price.toLocaleString()} monedas
        </div>
      </div>
    </div>
  );
}

export default function Rewards() {
  const [activeCategory, setActiveCategory] = useState('badges');
  const [rewards,        setRewards]        = useState({ badges: [], titles: [], frames: [], backgrounds: [] });
  const [shopItems,      setShopItems]      = useState([]);
  const [totalXP,        setTotalXP]        = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [activeIds,      setActiveIds]      = useState({ title: null, frame: null, background: null });

  useEffect(() => {
    Promise.all([getRewardsCatalog(), getMyProfile(), getMyShopItems()]).then(
      ([{ data: r }, { data: p }, { data: s }]) => {
        if (r) setRewards(r);
        if (s) setShopItems(s.map(row => row.item).filter(Boolean));
        if (p) {
          setTotalXP(p.total_xp ?? 0);
          setActiveIds({
            title:      p.active_title?.id      ?? null,
            frame:      p.active_frame?.id      ?? null,
            background: p.active_background?.id ?? null,
          });
        }
        setLoading(false);
      }
    );
  }, []);

  async function handleEquip(item) {
    const type = CATEGORY_TYPE[activeCategory];
    if (!type) return;
    const { error } = await setActiveCosmetic(type, item.id);
    if (!error) setActiveIds(prev => ({ ...prev, [type]: item.id }));
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>CARGANDO...</div>
    </div>
  );

  const isShopTab     = activeCategory === 'shop';
  const items         = isShopTab ? shopItems : (rewards[activeCategory] || []);
  const unlockedCount = isShopTab ? shopItems.length : items.filter(i => i.unlocked).length;

  const totalUnlocked = Object.values(rewards).flat().filter(i => i.unlocked).length + shopItems.length;
  const totalItems    = Object.values(rewards).flat().length + shopItems.length;

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), #1A1030)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--violet)' }}>{totalUnlocked}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>DESBLOQUEADOS</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--text-muted)' }}>{totalItems - totalUnlocked}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>BLOQUEADOS</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), #1A1600)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--gold)' }}>
            {Math.round((totalUnlocked / totalItems) * 100)}%
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>COMPLETADO</div>
        </div>
        <div className="card" style={{ flex: 2 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 10 }}>
            PROGRESO DEL INVENTARIO
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {Array.from({ length: totalItems }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 24,
                background: i < totalUnlocked ? 'var(--violet)' : 'var(--surface)',
                borderRadius: 3, transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {totalXP.toLocaleString()} XP total · Sigue completando misiones para desbloquear más
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {CATEGORIES.map(cat => {
          const catItems    = cat === 'shop' ? shopItems : (rewards[cat] || []);
          const catUnlocked = cat === 'shop' ? shopItems.length : catItems.filter(i => i.unlocked).length;
          const isActive    = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 20px',
                background: 'transparent', border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--violet)' : 'transparent'}`,
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em',
                color: isActive ? 'var(--violet)' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'var(--transition)',
                marginBottom: -1,
                display: 'flex', alignItems: 'center', gap: 8,
                textTransform: 'uppercase',
              }}
            >
              {CATEGORY_LABELS[cat]}
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 10,
                color: isActive ? 'var(--violet)' : 'var(--text-muted)',
                background: isActive ? 'var(--violet-dim)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'rgba(124,92,255,0.3)' : 'var(--border)'}`,
                borderRadius: 3, padding: '1px 5px',
              }}>
                {catUnlocked}/{catItems.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reward grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
        {isShopTab
          ? items.map(item => <ShopItemCard key={item.id} item={item} />)
          : items.map(item => {
              const type = CATEGORY_TYPE[activeCategory];
              return (
                <RewardCard
                  key={item.id}
                  item={item}
                  onEquip={type ? () => handleEquip(item) : undefined}
                  isEquipped={type ? activeIds[type] === item.id : false}
                />
              );
            })
        }
      </div>

      {/* Empty state for shop tab */}
      {isShopTab && shopItems.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          fontFamily: 'var(--font-ui)', fontSize: 14,
          color: 'var(--text-muted)', letterSpacing: '0.08em',
        }}>
          Aún no has comprado nada en la tienda.
        </div>
      )}
    </div>
  );
}
