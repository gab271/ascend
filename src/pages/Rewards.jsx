import { useState } from 'react';
import { rewards } from '../data/mockData';
import { Lock, Check, Star } from 'lucide-react';
import { currentUser } from '../data/mockData';

const RARITY_CONFIG = {
  common:    { label: 'COMÚN',      color: 'var(--rarity-common)', glow: 'rgba(139,154,179,0.3)', bg: 'rgba(139,154,179,0.08)' },
  rare:      { label: 'RARA',       color: 'var(--rarity-rare)',   glow: 'rgba(51,209,255,0.3)',  bg: 'rgba(51,209,255,0.08)' },
  epic:      { label: 'ÉPICA',      color: 'var(--rarity-epic)',   glow: 'rgba(124,92,255,0.35)', bg: 'rgba(124,92,255,0.08)' },
  legendary: { label: 'LEGENDARIA', color: 'var(--rarity-legendary)', glow: 'rgba(245,196,81,0.4)', bg: 'rgba(245,196,81,0.08)' },
};

const CATEGORIES = ['badges', 'titles', 'frames', 'backgrounds'];
const CATEGORY_LABELS = {
  badges:      'Insignias',
  titles:      'Títulos',
  frames:      'Marcos',
  backgrounds: 'Fondos',
};

function RewardCard({ item }) {
  const rarity = RARITY_CONFIG[item.rarity];
  const [hovered, setHovered] = useState(false);
  const isLegendary = item.rarity === 'legendary';

  const renderPreview = () => {
    if (item.type === 'badge') {
      return (
        <div style={{
          fontSize: 40,
          filter: item.unlocked ? 'none' : 'grayscale(1) opacity(0.4)',
        }}>
          {item.icon}
        </div>
      );
    }
    if (item.type === 'title') {
      return (
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 16,
          color: item.unlocked ? rarity.color : 'var(--text-muted)',
          letterSpacing: '0.15em',
          textAlign: 'center',
          padding: '8px 12px',
          background: item.unlocked ? rarity.bg : 'var(--surface)',
          border: `1px solid ${item.unlocked ? rarity.color + '55' : 'var(--border)'}`,
          borderRadius: 6,
          filter: item.unlocked ? 'none' : 'opacity(0.5)',
        }}>
          {item.name.toUpperCase()}
        </div>
      );
    }
    if (item.type === 'frame') {
      return (
        <div style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          border: `3px solid ${item.unlocked ? rarity.color : 'var(--border)'}`,
          boxShadow: item.unlocked ? `0 0 16px ${rarity.glow}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surface)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 18,
          color: item.unlocked ? rarity.color : 'var(--text-muted)',
          filter: item.unlocked ? 'none' : 'opacity(0.5)',
        }}>
          GX
        </div>
      );
    }
    if (item.type === 'background') {
      return (
        <div style={{
          width: 72,
          height: 52,
          borderRadius: 8,
          background: item.unlocked ? item.color : 'var(--surface)',
          border: `1px solid ${item.unlocked ? rarity.color + '66' : 'var(--border)'}`,
          position: 'relative',
          overflow: 'hidden',
          filter: item.unlocked ? 'none' : 'opacity(0.5)',
        }}>
          {item.unlocked && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '12px 12px',
            }} />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: item.unlocked
          ? isLegendary
            ? 'linear-gradient(135deg, #1A1600, #131722)'
            : 'var(--panel)'
          : 'var(--surface)',
        border: `1px solid ${
          item.unlocked
            ? hovered ? rarity.color : rarity.color + '44'
            : 'var(--border)'
        }`,
        borderRadius: 14,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && item.unlocked ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered && item.unlocked ? `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${rarity.glow}` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Legendary shimmer */}
      {isLegendary && item.unlocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(245,196,81,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Locked overlay */}
      {!item.unlocked && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(10,11,16,0.55)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          zIndex: 5,
          backdropFilter: 'blur(1px)',
        }}>
          <Lock size={20} color="var(--text-muted)" />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
          }}>
            {item.xpRequired.toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Rarity corner */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8,
        fontFamily: 'var(--font-ui)',
        fontSize: 8,
        fontWeight: 700,
        letterSpacing: '0.1em',
        color: item.unlocked ? rarity.color : 'var(--text-muted)',
        padding: '2px 6px',
        background: item.unlocked ? rarity.bg : 'transparent',
        borderRadius: 3,
        border: item.unlocked ? `1px solid ${rarity.color}33` : 'none',
      }}>
        {rarity.label}
      </div>

      {/* Unlocked check */}
      {item.unlocked && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: 'var(--green-dim)',
          border: '1px solid rgba(51,230,161,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Check size={11} color="var(--green)" />
        </div>
      )}

      {/* Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 70,
        filter: !item.unlocked ? 'blur(2px)' : 'none',
      }}>
        {renderPreview()}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.05em',
        color: item.unlocked ? 'var(--text)' : 'var(--text-muted)',
        textAlign: 'center',
      }}>
        {item.name}
      </div>

      {/* Equip button for unlocked items */}
      {item.unlocked && (
        <button style={{
          background: 'transparent',
          border: `1px solid ${rarity.color}55`,
          borderRadius: 6,
          padding: '6px 16px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.1em',
          color: rarity.color,
          cursor: 'pointer',
          transition: 'var(--transition)',
          width: '100%',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = rarity.bg;
          e.currentTarget.style.borderColor = rarity.color;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = `${rarity.color}55`;
        }}
        >
          EQUIPAR
        </button>
      )}
    </div>
  );
}

export default function Rewards() {
  const [activeCategory, setActiveCategory] = useState('badges');

  const items = rewards[activeCategory] || [];
  const unlockedCount = items.filter(i => i.unlocked).length;

  // Summary stats
  const totalUnlocked = Object.values(rewards).flat().filter(i => i.unlocked).length;
  const totalItems = Object.values(rewards).flat().length;

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
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 10 }}>PROGRESO DEL INVENTARIO</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {Array.from({ length: totalItems }).map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: 24,
                background: i < totalUnlocked ? 'var(--violet)' : 'var(--surface)',
                borderRadius: 3,
                transition: 'background 0.3s ease',
              }} />
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            {currentUser.totalXP.toLocaleString()} XP total · Sigue completando misiones para desbloquear más
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 24,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 0,
      }}>
        {CATEGORIES.map(cat => {
          const catItems = rewards[cat] || [];
          const catUnlocked = catItems.filter(i => i.unlocked).length;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${isActive ? 'var(--violet)' : 'transparent'}`,
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.08em',
                color: isActive ? 'var(--violet)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                marginBottom: -1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                textTransform: 'uppercase',
              }}
            >
              {CATEGORY_LABELS[cat]}
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: isActive ? 'var(--violet)' : 'var(--text-muted)',
                background: isActive ? 'var(--violet-dim)' : 'var(--surface)',
                border: `1px solid ${isActive ? 'rgba(124,92,255,0.3)' : 'var(--border)'}`,
                borderRadius: 3,
                padding: '1px 5px',
              }}>
                {catUnlocked}/{catItems.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Reward grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 16,
      }}>
        {items.map(item => (
          <RewardCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
