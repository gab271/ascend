import { CheckCircle2, Circle } from 'lucide-react';
import { RARITY_CONFIG } from '../../config/rarities';

const ATTR_COLOR = {
  health:     'var(--green)',
  money:      'var(--gold)',
  discipline: 'var(--violet)',
};
const ATTR_LABEL = { health: 'SALUD', money: 'DINERO', discipline: 'DISCIPLINA' };

// Compact mission row — used in Dashboard's daily missions list
export default function MissionRow({ mission, onComplete }) {
  const rarityColor = RARITY_CONFIG[mission.rarity]?.color ?? 'var(--text-muted)';
  const attrColor = ATTR_COLOR[mission.attribute];
  const attrLabel = ATTR_LABEL[mission.attribute];

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 16px',
        background: mission.completed ? 'rgba(51,230,161,0.04)' : 'var(--surface)',
        border: `1px solid ${mission.completed ? 'rgba(51,230,161,0.2)' : 'var(--border)'}`,
        borderLeft: `3px solid ${mission.completed ? 'var(--green)' : rarityColor}`,
        borderRadius: 9,
        transition: 'var(--transition)',
        opacity: mission.completed ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (!mission.completed) {
          e.currentTarget.style.borderColor = rarityColor;
          e.currentTarget.style.background = `${rarityColor}08`;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = mission.completed ? 'rgba(51,230,161,0.2)' : 'var(--border)';
        e.currentTarget.style.background = mission.completed ? 'rgba(51,230,161,0.04)' : 'var(--surface)';
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0, filter: mission.completed ? 'grayscale(1)' : 'none' }}>
        {mission.icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
            color: mission.completed ? 'var(--text-muted)' : 'var(--text)',
            textDecoration: mission.completed ? 'line-through' : 'none',
          }}>
            {mission.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: 8, fontWeight: 700, letterSpacing: '0.1em',
            color: rarityColor, background: `${rarityColor}15`, border: `1px solid ${rarityColor}44`,
            borderRadius: 2, padding: '1px 5px',
          }}>
            {mission.rarity.toUpperCase()}
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>
          <span style={{ color: attrColor }}>▸ {attrLabel}</span>
          <span style={{ margin: '0 5px', color: 'var(--border-bright)' }}>·</span>
          <span style={{ color: 'var(--violet)' }}>+{mission.xp} XP</span>
        </div>
      </div>
      <button
        onClick={() => !mission.completed && onComplete(mission.id)}
        disabled={mission.completed}
        style={{
          background: mission.completed ? 'transparent' : 'var(--violet)',
          color: mission.completed ? 'var(--green)' : 'white',
          border: `1px solid ${mission.completed ? 'var(--green)' : 'var(--violet)'}`,
          borderRadius: 7, padding: '7px 13px',
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em',
          cursor: mission.completed ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'var(--transition)', flexShrink: 0,
          boxShadow: mission.completed ? 'none' : '0 4px 12px var(--violet-glow)',
        }}
        onMouseEnter={e => { if (!mission.completed) { e.currentTarget.style.background = '#8B6FFF'; e.currentTarget.style.transform = 'scale(1.05)'; } }}
        onMouseLeave={e => { if (!mission.completed) { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.transform = 'scale(1)'; } }}
      >
        {mission.completed ? <><CheckCircle2 size={13} /> Hecho</> : <><Circle size={13} /> Completar</>}
      </button>
    </div>
  );
}
