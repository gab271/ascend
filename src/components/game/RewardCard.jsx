import { useState } from 'react';
import { Lock, Check } from 'lucide-react';
import { RARITY_CONFIG } from '../../config/rarities';

function renderPreview(item, rarity) {
  if (item.type === 'badge') {
    return <div style={{ fontSize: 40, filter: item.unlocked ? 'none' : 'grayscale(1) opacity(0.4)' }}>{item.icon}</div>;
  }
  if (item.type === 'title') {
    return (
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 16,
        color: item.unlocked ? rarity.color : 'var(--text-muted)',
        letterSpacing: '0.15em', textAlign: 'center', padding: '8px 12px',
        background: item.unlocked ? rarity.bg : 'var(--surface)',
        border: `1px solid ${item.unlocked ? rarity.color + '55' : 'var(--border)'}`,
        borderRadius: 6, filter: item.unlocked ? 'none' : 'opacity(0.5)',
      }}>
        {item.name.toUpperCase()}
      </div>
    );
  }
  if (item.type === 'frame') {
    return (
      <div style={{
        width: 60, height: 60, borderRadius: '50%',
        border: `3px solid ${item.unlocked ? rarity.color : 'var(--border)'}`,
        boxShadow: item.unlocked ? `0 0 16px ${rarity.glow}` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--surface)',
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 18,
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
        width: 72, height: 52, borderRadius: 8,
        background: item.unlocked ? item.color : 'var(--surface)',
        border: `1px solid ${item.unlocked ? rarity.color + '66' : 'var(--border)'}`,
        position: 'relative', overflow: 'hidden',
        filter: item.unlocked ? 'none' : 'opacity(0.5)',
      }}>
        {item.unlocked && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }} />
        )}
      </div>
    );
  }
  return null;
}

export default function RewardCard({ item }) {
  const rarity = RARITY_CONFIG[item.rarity];
  const [hovered, setHovered] = useState(false);
  const isLegendary = item.rarity === 'legendary';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: item.unlocked
          ? isLegendary ? 'linear-gradient(135deg, #1A1600, #131722)' : 'var(--panel)'
          : 'var(--surface)',
        border: `1px solid ${item.unlocked ? (hovered ? rarity.color : rarity.color + '44') : 'var(--border)'}`,
        borderRadius: 14, padding: '24px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: hovered && item.unlocked ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: hovered && item.unlocked ? `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${rarity.glow}` : 'none',
        overflow: 'hidden',
      }}
    >
      {/* Legendary shimmer */}
      {isLegendary && item.unlocked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(245,196,81,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Locked overlay */}
      {!item.unlocked && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(10,11,16,0.55)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
          zIndex: 5, backdropFilter: 'blur(1px)',
        }}>
          <Lock size={20} color="var(--text-muted)" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            {(item.xp_required ?? 0).toLocaleString()} XP
          </span>
        </div>
      )}

      {/* Rarity corner */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        fontFamily: 'var(--font-ui)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
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
          position: 'absolute', top: 8, left: 8, width: 20, height: 20, borderRadius: '50%',
          background: 'var(--green-dim)', border: '1px solid rgba(51,230,161,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={11} color="var(--green)" />
        </div>
      )}

      {/* Preview */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', height: 70,
        filter: !item.unlocked ? 'blur(2px)' : 'none',
      }}>
        {renderPreview(item, rarity)}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em',
        color: item.unlocked ? 'var(--text)' : 'var(--text-muted)', textAlign: 'center',
      }}>
        {item.name}
      </div>

      {/* Equip button */}
      {item.unlocked && (
        <button style={{
          background: 'transparent', border: `1px solid ${rarity.color}55`,
          borderRadius: 6, padding: '6px 16px',
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
          color: rarity.color, cursor: 'pointer', transition: 'var(--transition)', width: '100%',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = rarity.bg; e.currentTarget.style.borderColor = rarity.color; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${rarity.color}55`; }}
        >
          EQUIPAR
        </button>
      )}
    </div>
  );
}
