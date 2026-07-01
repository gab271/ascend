import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getShopRotation, purchaseShopItem } from '../../lib/api/shop';
import { getMyProfile } from '../../lib/api/profile';

// ─── Rarity config ────────────────────────────────────────────
const RARITY_BASE = {
  common:    { color: '#8B9AB3', glow: 'rgba(139,154,179,0.35)' },
  rare:      { color: '#33D1FF', glow: 'rgba(51,209,255,0.45)'  },
  epic:      { color: '#7C5CFF', glow: 'rgba(124,92,255,0.5)'   },
  legendary: { color: '#F5C451', glow: 'rgba(245,196,81,0.55)'  },
};

// ─── Countdown to UTC midnight ────────────────────────────────
function getMsUntilUtcMidnight() {
  const now = new Date();
  const midnight = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return midnight - now;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sc = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sc).padStart(2, '0')}`;
}

function RotationTimer({ t }) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    const tick = () => setDisplay(formatCountdown(getMsUntilUtcMidnight()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 6, height: 6, borderRadius: '50%',
        background: 'var(--gold)',
        boxShadow: '0 0 8px var(--gold)',
        animation: 'pulse-dot 1.5s ease-in-out infinite',
        flexShrink: 0,
      }} />
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        color: 'var(--text-muted)', letterSpacing: '0.1em',
      }}>
        {t('shop.newRotation')}&nbsp;
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 14,
        color: 'var(--gold)', letterSpacing: '0.12em', fontWeight: 700,
      }}>
        {display}
      </span>
    </div>
  );
}

// ─── CSS-based item visual preview ───────────────────────────
function ItemPreview({ item, size = 'normal' }) {
  const { item_type, config, rarity } = item;
  const r = RARITY_BASE[rarity] || RARITY_BASE.common;
  const isLarge = size === 'large';
  const h = isLarge ? 180 : 120;

  const containerStyle = {
    width: '100%', height: h, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    background: 'rgba(10,11,16,0.8)',
    flexShrink: 0,
  };

  if (item_type === 'animated_frame') {
    const anim = config.animation || 'pulse';
    const animMap = {
      pulse:  'frame-pulse 2s ease-in-out infinite',
      rotate: 'frame-rotate 4s linear infinite',
      scan:   'frame-scan 2s ease-in-out infinite',
      glitch: 'frame-glitch 1.5s steps(2) infinite',
      wave:   'frame-wave 3s ease-in-out infinite',
    };
    return (
      <div style={containerStyle}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${r.glow} 0%, transparent 70%)`,
        }} />
        {/* Animated ring */}
        <div style={{
          width: isLarge ? 110 : 72,
          height: isLarge ? 110 : 72,
          borderRadius: '50%',
          border: `${isLarge ? 4 : 3}px solid ${config.color || r.color}`,
          boxShadow: `0 0 ${isLarge ? 24 : 16}px ${config.color || r.color}, inset 0 0 ${isLarge ? 16 : 10}px ${r.glow}`,
          animation: animMap[anim] || animMap.pulse,
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute',
          width: isLarge ? 88 : 56,
          height: isLarge ? 88 : 56,
          borderRadius: '50%',
          border: `1px solid ${config.secondary_color || 'rgba(255,255,255,0.15)'}`,
        }} />
        <span style={{
          position: 'absolute', bottom: 10,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: config.color || r.color, letterSpacing: '0.15em', opacity: 0.8,
        }}>
          {config.preview_label || 'FRAME'}
        </span>
      </div>
    );
  }

  if (item_type === 'emote') {
    const animMap = {
      bounce: 'emote-bounce 0.8s ease-in-out infinite',
      spin:   'emote-spin 2s linear infinite',
      float:  'emote-float 2.5s ease-in-out infinite',
      flash:  'emote-flash 1s ease-in-out infinite',
      shake:  'emote-shake 0.5s ease-in-out infinite',
    };
    return (
      <div style={containerStyle}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${r.glow} 0%, transparent 65%)`,
        }} />
        <div style={{
          fontSize: isLarge ? 64 : 42,
          lineHeight: 1,
          animation: animMap[config.animation] || animMap.bounce,
          userSelect: 'none',
        }}>
          {config.emoji || '✨'}
        </div>
        {config.secondary_emoji && (
          <div style={{
            position: 'absolute', bottom: isLarge ? 16 : 10, right: isLarge ? 24 : 16,
            fontSize: isLarge ? 22 : 16, opacity: 0.7,
            animation: 'emote-float 3s ease-in-out infinite reverse',
          }}>
            {config.secondary_emoji}
          </div>
        )}
        <span style={{
          position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: r.color, letterSpacing: '0.15em',
        }}>
          {config.label || 'EMOTE'}
        </span>
      </div>
    );
  }

  if (item_type === 'nameplate') {
    return (
      <div style={containerStyle}>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${r.glow} 0%, transparent 70%)`,
        }} />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1,
        }}>
          {/* Nameplate preview */}
          <div style={{
            padding: isLarge ? '8px 24px' : '5px 16px',
            borderRadius: 4,
            background: config.bg_color || 'rgba(124,92,255,0.1)',
            border: `1px solid ${config.color || r.color}40`,
            boxShadow: `0 0 ${isLarge ? 20 : 12}px ${config.glow_color || r.glow}`,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: isLarge ? 24 : 16,
              color: config.color || r.color,
              textShadow: `0 0 ${isLarge ? 16 : 10}px ${config.glow_color || r.glow}`,
              letterSpacing: '0.12em',
            }}>
              TU_NOMBRE
            </span>
          </div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: r.color, letterSpacing: '0.15em',
          }}>
            {config.style?.toUpperCase() || 'STYLE'}
          </span>
        </div>
      </div>
    );
  }

  if (item_type === 'profile_banner') {
    const patternSvgs = {
      hexagons: `url("data:image/svg+xml,%3Csvg width='20' height='23' viewBox='0 0 20 23' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L20 5.5v11L10 22 0 16.5v-11z' stroke='${encodeURIComponent(config.accent_color || r.color)}' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`,
      circuit:  `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0' y='19' width='40' height='2' fill='${encodeURIComponent(config.accent_color || r.color)}' opacity='0.1'/%3E%3Crect x='19' y='0' width='2' height='40' fill='${encodeURIComponent(config.accent_color || r.color)}' opacity='0.1'/%3E%3C/svg%3E")`,
      stars:    `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='5' cy='5' r='1' fill='${encodeURIComponent(config.accent_color || r.color)}' opacity='0.6'/%3E%3Ccircle cx='40' cy='20' r='1.5' fill='white' opacity='0.5'/%3E%3Ccircle cx='70' cy='60' r='1' fill='${encodeURIComponent(config.accent_color || r.color)}' opacity='0.7'/%3E%3Ccircle cx='20' cy='55' r='0.8' fill='white' opacity='0.4'/%3E%3C/svg%3E")`,
      waves:    `url("data:image/svg+xml,%3Csvg width='60' height='30' viewBox='0 0 60 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 15 Q15 0 30 15 Q45 30 60 15' stroke='${encodeURIComponent(config.accent_color || r.color)}' stroke-opacity='0.15' fill='none' stroke-width='1'/%3E%3C/svg%3E")`,
      grid:     `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='30' height='30' fill='none' stroke='${encodeURIComponent(config.accent_color || r.color)}' stroke-opacity='0.12'/%3E%3C/svg%3E")`,
    };
    return (
      <div style={{
        ...containerStyle,
        background: config.gradient || 'linear-gradient(135deg, #0A0B10, #131722)',
        backgroundImage: config.gradient || undefined,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: patternSvgs[config.pattern] || patternSvgs.grid,
          backgroundSize: config.pattern === 'hexagons' ? '20px 23px'
            : config.pattern === 'stars' ? '80px 80px'
            : config.pattern === 'waves' ? '60px 30px'
            : '30px 30px',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at center, ${r.glow} 0%, transparent 60%)`,
        }} />
        <span style={{
          position: 'relative', zIndex: 1,
          fontFamily: 'var(--font-display)', fontSize: isLarge ? 28 : 20,
          color: config.accent_color || r.color,
          textShadow: `0 0 20px ${r.glow}`,
          letterSpacing: '0.15em',
        }}>
          {config.label || 'BANNER'}
        </span>
      </div>
    );
  }

  return <div style={{ ...containerStyle, fontSize: 32 }}>🎁</div>;
}

// ─── Shop item card ───────────────────────────────────────────
function ShopCard({ item, onPurchase, purchasing, featured = false, t }) {
  const r = { ...RARITY_BASE[item.rarity] || RARITY_BASE.common, label: t(`shop.rarities.${item.rarity}`) };
  const [hovered, setHovered] = useState(false);
  const [justBought, setJustBought] = useState(false);

  const handleBuy = async () => {
    if (item.owned || purchasing) return;
    const ok = await onPurchase(item.shop_item_id);
    if (ok) {
      setJustBought(true);
      setTimeout(() => setJustBought(false), 2000);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: featured
          ? `linear-gradient(145deg, rgba(10,11,16,0.95), rgba(19,23,34,0.98))`
          : 'var(--panel)',
        border: `1px solid ${hovered || item.owned ? r.color + '60' : 'var(--border)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered && !item.owned ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered || featured
          ? `0 8px 32px ${r.glow}, 0 0 0 1px ${r.color}20`
          : 'none',
        cursor: item.owned ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Rarity top bar */}
      <div style={{
        height: featured ? 3 : 2,
        background: `linear-gradient(90deg, transparent, ${r.color}, transparent)`,
        flexShrink: 0,
      }} />

      {/* Featured badge */}
      {featured && (
        <div style={{
          position: 'absolute', top: 14, left: 14, zIndex: 10,
          background: `linear-gradient(90deg, ${r.color}, ${r.color}cc)`,
          color: 'var(--void)',
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9,
          letterSpacing: '0.2em', padding: '3px 10px', borderRadius: 3,
        }}>
          {t('shop.featured')}
        </div>
      )}

      {/* Owned badge */}
      {item.owned && (
        <div style={{
          position: 'absolute', top: 14, right: 14, zIndex: 10,
          background: 'rgba(51,230,161,0.15)',
          border: '1px solid rgba(51,230,161,0.4)',
          color: 'var(--green)',
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.15em', padding: '3px 10px', borderRadius: 3,
        }}>
          {t('shop.acquired')}
        </div>
      )}

      {/* Item preview */}
      <div style={{ padding: featured ? '24px 20px 16px' : '18px 16px 12px' }}>
        <ItemPreview item={item} size={featured ? 'large' : 'normal'} />
      </div>

      {/* Info */}
      <div style={{ padding: '0 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Type + rarity */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--text-muted)', letterSpacing: '0.12em',
          }}>
            {t(`shop.typeLabels.${item.item_type}`) || item.item_type.toUpperCase()}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: r.color, letterSpacing: '0.1em',
            background: `${r.color}15`, border: `1px solid ${r.color}30`,
            padding: '1px 6px', borderRadius: 3,
          }}>
            {r.label}
          </span>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700,
          fontSize: featured ? 18 : 14,
          color: item.owned ? 'var(--text-muted)' : 'var(--text)',
          letterSpacing: '0.03em', marginBottom: 4,
          lineHeight: 1.2,
        }}>
          {item.name}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'var(--font-body)', fontSize: 12,
          color: 'var(--text-muted)', lineHeight: 1.5,
          flex: 1, marginBottom: 14,
        }}>
          {item.description}
        </div>

        {/* Price + buy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Coin price */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(245,196,81,0.08)',
            border: '1px solid rgba(245,196,81,0.2)',
            borderRadius: 6, padding: '6px 12px',
            flex: 1, justifyContent: 'center',
          }}>
            <span style={{ fontSize: 14 }}>🪙</span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: featured ? 22 : 18,
              color: 'var(--gold)', letterSpacing: '0.06em',
            }}>
              {item.price.toLocaleString()}
            </span>
          </div>

          {/* Buy button */}
          {!item.owned && (
            <button
              onClick={handleBuy}
              disabled={purchasing}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: 12, letterSpacing: '0.1em',
                cursor: purchasing ? 'wait' : 'pointer',
                border: 'none',
                transition: 'all 0.2s',
                background: justBought
                  ? 'rgba(51,230,161,0.2)'
                  : hovered
                    ? `linear-gradient(135deg, ${r.color}, ${r.color}cc)`
                    : `linear-gradient(135deg, ${r.color}22, ${r.color}15)`,
                color: justBought ? 'var(--green)' : hovered ? 'white' : r.color,
                boxShadow: hovered ? `0 4px 16px ${r.glow}` : 'none',
              }}
            >
              {justBought ? t('shop.bought') : purchasing ? '...' : t('shop.buy')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Shop page ───────────────────────────────────────────
export default function Shop() {
  const { t } = useLanguage();
  const [items, setItems]         = useState([]);
  const [coins, setCoins]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [toast, setToast]         = useState(null); // { msg, type }

  // Load rotation + coins balance
  useEffect(() => {
    Promise.all([
      getShopRotation(),
      getMyProfile(),
    ]).then(([{ data: shopData, error: shopErr }, { data: profile }]) => {
      if (!shopErr && shopData) setItems(shopData);
      if (profile) setCoins(profile.coins ?? 0);
      setLoading(false);
    });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePurchase = useCallback(async (itemId) => {
    setPurchasing(true);
    const { data, error } = await purchaseShopItem(itemId);
    setPurchasing(false);

    if (error) {
      const hint = error.hint || error.message || '';
      showToast(
        hint === 'INSUFFICIENT_COINS' || hint.includes('coins')
          ? t('shop.insufficientCoins')
          : hint.includes('already own')
            ? t('shop.alreadyOwned')
            : t('shop.purchaseError'),
        'error'
      );
      return false;
    }

    // Update local state
    setItems(prev => prev.map(it =>
      it.shop_item_id === itemId ? { ...it, owned: true } : it
    ));
    setCoins(data.coins_remaining);
    showToast(`"${data.item_name}" ${t('shop.acquired')} −${data.coins_spent.toLocaleString()} 🪙`);
    return true;
  }, []);

  const featured   = items.find(i => i.featured);
  const regular    = items.filter(i => !i.featured);

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300,
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 12,
        color: 'var(--text-muted)', letterSpacing: '0.2em',
      }}>
        {t('shop.loading')}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Toast notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 999,
          padding: '12px 20px', borderRadius: 10,
          background: toast.type === 'error'
            ? 'rgba(255,77,106,0.15)' : 'rgba(51,230,161,0.12)',
          border: `1px solid ${toast.type === 'error' ? 'rgba(255,77,106,0.4)' : 'rgba(51,230,161,0.35)'}`,
          color: toast.type === 'error' ? 'var(--red)' : 'var(--green)',
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
          letterSpacing: '0.04em',
          boxShadow: toast.type === 'error'
            ? '0 8px 24px rgba(255,77,106,0.2)' : '0 8px 24px rgba(51,230,161,0.2)',
          animation: 'slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1)',
          maxWidth: 360,
        }}>
          {toast.msg}
        </div>
      )}

      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 32,
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: '0.22em', marginBottom: 6,
          }}>
            {t('shop.nightMarket')}
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 38,
            color: 'var(--text)', letterSpacing: '0.08em', lineHeight: 1,
          }}>
            {t('shop.dailyStore')}
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Rotation timer */}
          <div style={{
            background: 'var(--panel)', border: '1px solid var(--border)',
            borderRadius: 10, padding: '10px 18px',
          }}>
            <RotationTimer t={t} />
          </div>

          {/* Coin balance */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'linear-gradient(135deg, rgba(245,196,81,0.12), rgba(245,196,81,0.06))',
            border: '1px solid rgba(245,196,81,0.35)',
            borderRadius: 12, padding: '12px 20px',
            boxShadow: '0 4px 20px rgba(245,196,81,0.15)',
          }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>🪙</span>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 9,
                color: 'rgba(245,196,81,0.6)', letterSpacing: '0.2em', marginBottom: 2,
              }}>
                {t('shop.coins')}
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 26,
                color: 'var(--gold)', letterSpacing: '0.06em', lineHeight: 1,
              }}>
                {coins.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{
        marginBottom: 28, padding: '12px 18px', borderRadius: 10,
        background: 'linear-gradient(135deg, rgba(124,92,255,0.06), transparent)',
        border: '1px solid rgba(124,92,255,0.2)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚔️</span>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: 'var(--text-muted)', lineHeight: 1.5,
        }}>
          {t('shop.infoText')}
        </p>
      </div>

      {/* ── Empty state ── */}
      {items.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          fontFamily: 'var(--font-ui)', fontSize: 16,
          color: 'var(--text-muted)', letterSpacing: '0.1em',
        }}>
          {t('shop.empty')}
        </div>
      )}

      {/* ── Featured + grid layout ── */}
      {items.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: featured ? '1fr 2fr' : '1fr',
          gap: 16,
          alignItems: 'start',
        }}>

          {/* Regular items — left column */}
          {regular.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 14,
              alignContent: 'start',
            }}>
              {regular.map(item => (
                <ShopCard
                  key={item.shop_item_id}
                  item={item}
                  onPurchase={handlePurchase}
                  purchasing={purchasing}
                  t={t}
                />
              ))}
            </div>
          )}

          {/* Featured item — right column */}
          {featured && (
            <ShopCard
              item={featured}
              onPurchase={handlePurchase}
              purchasing={purchasing}
              featured
              t={t}
            />
          )}
        </div>
      )}

    </div>
  );
}
