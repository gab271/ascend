import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getMyProfile, getRewardsCatalog, setActiveCosmetic } from '../../lib/api/profile';
import { getMyShopItems, setActiveShopItem } from '../../lib/api/shop';
import RewardCard from '../../components/game/RewardCard';

const CATEGORIES = ['badges', 'titles', 'frames', 'backgrounds', 'shop'];

// Maps Rewards tab category → RPC type. Badges are not equippable.
const CATEGORY_TYPE = { titles: 'title', frames: 'frame', backgrounds: 'background' };

const RARITY_COLOR = {
  common: '#8B9AB3', rare: '#33D1FF', epic: '#7C5CFF', legendary: '#F5C451',
};

function ShopItemCard({ item, isEquipped, onEquip, t }) {
  const color = RARITY_COLOR[item.rarity] || '#8B9AB3';
  const cfg   = item.config || {};
  const [loading, setLoading] = useState(false);

  // Slot names come straight from the `slots` table now:
  // title | frame | background | banner | nameplate | emote
  const preview = item.item_type === 'emote'
    ? cfg.emoji || '✨'
    : ({ nameplate: '📛', banner: '🎌', frame: '🖼️', background: '🌌', title: '🏷️' })[item.item_type]
      ?? '🔮';

  const handleEquip = async () => {
    setLoading(true);
    await onEquip(item.id);
    setLoading(false);
  };

  return (
    <div style={{
      background: 'var(--panel)',
      border: `1px solid ${isEquipped ? color : color + '44'}`,
      borderRadius: 12, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: isEquipped ? `0 0 16px ${color}33` : 'none',
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{
        height: 80, position: 'relative',
        background: `radial-gradient(ellipse at center, ${color}18 0%, transparent 70%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36,
      }}>
        {preview}
        {isEquipped && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: 'rgba(51,230,161,0.15)',
            border: '1px solid rgba(51,230,161,0.4)',
            borderRadius: 4, padding: '2px 7px',
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--green)', letterSpacing: '0.1em',
          }}>
            {t('rewards.equipped')}
          </div>
        )}
      </div>
      <div style={{ padding: '10px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: color, letterSpacing: '0.12em', marginBottom: 4,
        }}>
          {t(`rewards.rarities.${item.rarity}`)} · {t(`rewards.types.${item.item_type}`)}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
          color: 'var(--text)', marginBottom: 4,
        }}>
          {item.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          color: 'var(--text-muted)', lineHeight: 1.4, flex: 1, marginBottom: 10,
        }}>
          {item.description}
        </div>
        <button
          onClick={handleEquip}
          disabled={isEquipped || loading}
          style={{
            width: '100%', padding: '7px 0',
            borderRadius: 7, border: `1px solid ${isEquipped ? 'rgba(51,230,161,0.3)' : color + '66'}`,
            background: isEquipped ? 'rgba(51,230,161,0.08)' : `${color}18`,
            color: isEquipped ? 'var(--green)' : color,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', cursor: isEquipped ? 'default' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (!isEquipped) e.currentTarget.style.background = `${color}30`; }}
          onMouseLeave={e => { if (!isEquipped) e.currentTarget.style.background = `${color}18`; }}
        >
          {loading ? '...' : isEquipped ? t('rewards.equipped') : t('rewards.equip')}
        </button>
      </div>
    </div>
  );
}

export default function Rewards() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState('badges');
  const [rewards,        setRewards]        = useState({ badges: [], titles: [], frames: [], backgrounds: [] });
  const [shopItems,      setShopItems]      = useState([]);
  const [totalXP,        setTotalXP]        = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [activeIds,      setActiveIds]      = useState({ title: null, frame: null, background: null });
  // Keyed by slot code so activeShopIds[item.item_type] resolves directly.
  const [activeShopIds,  setActiveShopIds]  = useState({
    frame: null, emote: null, nameplate: null, banner: null,
  });

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
          setActiveShopIds({
            frame:     p.active_shop_frame?.id     ?? null,
            emote:     p.active_shop_emote?.id     ?? null,
            nameplate: p.active_shop_nameplate?.id ?? null,
            banner:    p.active_shop_banner?.id    ?? null,
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

  async function handleShopEquip(itemId) {
    const { error } = await setActiveShopItem(itemId);
    if (!error) {
      const equipped = shopItems.find(i => i.id === itemId);
      if (equipped) {
        setActiveShopIds(prev => ({ ...prev, [equipped.item_type]: itemId }));
      }
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>{t('common.loading')}</div>
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
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>{t('rewards.unlocked')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--text-muted)' }}>{totalItems - totalUnlocked}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>{t('rewards.locked')}</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, var(--panel), #1A1600)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--gold)' }}>
            {Math.round((totalUnlocked / totalItems) * 100)}%
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>{t('rewards.completed')}</div>
        </div>
        <div className="card" style={{ flex: 2 }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 10 }}>
            {t('rewards.inventoryProgress')}
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
            {totalXP.toLocaleString()} XP total · {t('rewards.keepCompleting')}
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
              {t(`rewards.categories.${cat}`)}
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
          ? items.map(item => (
              <ShopItemCard
                key={item.id}
                item={item}
                isEquipped={activeShopIds[item.item_type] === item.id}
                onEquip={handleShopEquip}
                t={t}
              />
            ))
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
          {t('rewards.noPurchases')}
        </div>
      )}
    </div>
  );
}
