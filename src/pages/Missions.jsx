import { useState } from 'react';
import { allMissions } from '../data/mockData';
import { CheckCircle2, Zap, Shield, DollarSign, Filter } from 'lucide-react';

const RARITY_CONFIG = {
  common:    { label: 'COMÚN',     color: 'var(--rarity-common)', glow: 'rgba(139,154,179,0.3)' },
  rare:      { label: 'RARA',      color: 'var(--rarity-rare)',   glow: 'rgba(51,209,255,0.3)' },
  epic:      { label: 'ÉPICA',     color: 'var(--rarity-epic)',   glow: 'rgba(124,92,255,0.35)' },
  legendary: { label: 'LEGENDARIA',color: 'var(--rarity-legendary)', glow: 'rgba(245,196,81,0.4)' },
};

const ATTR_CONFIG = {
  health:     { label: 'SALUD',      color: 'var(--green)',  icon: Shield },
  money:      { label: 'DINERO',     color: 'var(--gold)',   icon: DollarSign },
  discipline: { label: 'DISCIPLINA', color: 'var(--violet)', icon: Zap },
};

const FILTERS = ['all', 'health', 'money', 'discipline', 'legendary'];

function MissionCard({ mission, onComplete }) {
  const rarity = RARITY_CONFIG[mission.rarity];
  const attr = ATTR_CONFIG[mission.attribute];

  // Legendary gets special shimmer border
  const isLegendary = mission.rarity === 'legendary';

  return (
    <div
      style={{
        position: 'relative',
        background: mission.completed
          ? 'rgba(51,230,161,0.04)'
          : isLegendary
            ? 'linear-gradient(135deg, #1A1600, #131722)'
            : 'var(--panel)',
        border: `1px solid ${mission.completed ? 'rgba(51,230,161,0.25)' : rarity.color + '55'}`,
        borderRadius: 14,
        padding: '22px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: mission.completed ? 0.65 : 1,
        overflow: 'hidden',
        cursor: mission.completed ? 'default' : 'pointer',
      }}
      onMouseEnter={e => {
        if (!mission.completed) {
          e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
          e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 30px ${rarity.glow}`;
          e.currentTarget.style.borderColor = rarity.color;
        }
      }}
      onMouseLeave={e => {
        if (!mission.completed) {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.borderColor = rarity.color + '55';
        }
      }}
    >
      {/* Legendary shimmer background */}
      {isLegendary && !mission.completed && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(245,196,81,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* Top-right corner glow */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${rarity.glow} 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: mission.completed ? 0 : 0.6,
      }} />

      {/* Corner bracket decoration */}
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        width: 14,
        height: 14,
        borderTop: `2px solid ${rarity.color}`,
        borderLeft: `2px solid ${rarity.color}`,
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 14,
        height: 14,
        borderBottom: `2px solid ${rarity.color}`,
        borderRight: `2px solid ${rarity.color}`,
        opacity: 0.5,
      }} />

      {/* Rarity + attribute badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.12em',
          color: rarity.color,
          background: `${rarity.color}18`,
          border: `1px solid ${rarity.color}44`,
          borderRadius: 4,
          padding: '3px 8px',
        }}>
          {isLegendary ? '⭐ ' : ''}{rarity.label}
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.1em',
          color: attr.color,
          background: `${attr.color}18`,
          border: `1px solid ${attr.color}33`,
          borderRadius: 4,
          padding: '3px 8px',
        }}>
          <attr.icon size={10} />
          {attr.label}
        </div>
      </div>

      {/* Icon + title */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div style={{
          fontSize: 32,
          lineHeight: 1,
          flexShrink: 0,
          filter: mission.completed ? 'grayscale(1)' : 'none',
        }}>
          {mission.icon}
        </div>
        <div>
          <h3 style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 16,
            color: mission.completed ? 'var(--text-muted)' : 'var(--text)',
            marginBottom: 5,
            letterSpacing: '0.03em',
            textDecoration: mission.completed ? 'line-through' : 'none',
          }}>
            {mission.name}
          </h3>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 13,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            {mission.description}
          </p>
        </div>
      </div>

      {/* Bottom: XP + button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-display)',
          fontSize: 24,
          color: isLegendary ? 'var(--gold)' : 'var(--violet)',
        }}>
          <Zap size={16} color="var(--violet)" />
          +{mission.xp}
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
          }}>
            XP
          </span>
        </div>

        <button
          onClick={() => !mission.completed && onComplete(mission.id)}
          disabled={mission.completed}
          style={{
            background: mission.completed ? 'transparent' : rarity.color,
            color: mission.completed ? 'var(--green)' : rarity.color === 'var(--rarity-legendary)' ? 'var(--void)' : 'white',
            border: `1px solid ${mission.completed ? 'var(--green)' : rarity.color}`,
            borderRadius: 8,
            padding: '9px 18px',
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: '0.1em',
            cursor: mission.completed ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'var(--transition)',
            boxShadow: mission.completed ? 'none' : `0 4px 14px ${rarity.glow}`,
          }}
        >
          {mission.completed ? (
            <><CheckCircle2 size={14} /> Completada</>
          ) : (
            'Completar Misión'
          )}
        </button>
      </div>
    </div>
  );
}

export default function Missions() {
  const [missions, setMissions] = useState(allMissions);
  const [activeFilter, setActiveFilter] = useState('all');

  const completeMission = (id) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
  };

  const filtered = missions.filter(m => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'legendary') return m.rarity === 'legendary';
    return m.attribute === activeFilter;
  });

  const filterLabels = {
    all: 'Todas',
    health: 'Salud',
    money: 'Dinero',
    discipline: 'Disciplina',
    legendary: '⭐ Legendarias',
  };

  const filterColors = {
    all: 'var(--text-secondary)',
    health: 'var(--green)',
    money: 'var(--gold)',
    discipline: 'var(--violet)',
    legendary: 'var(--gold)',
  };

  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.filter(m => !m.completed).reduce((sum, m) => sum + m.xp, 0);

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'MISIONES ACTIVAS', value: missions.length - completedCount, color: 'var(--cyan)' },
          { label: 'COMPLETADAS', value: completedCount, color: 'var(--green)' },
          { label: 'XP DISPONIBLE', value: `${totalXP.toLocaleString()} XP`, color: 'var(--violet)' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
            }}>
              {stat.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 32,
              color: stat.color,
            }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 24,
        padding: '6px',
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        width: 'fit-content',
      }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: activeFilter === f ? 'white' : 'var(--text-muted)',
              background: activeFilter === f ? filterColors[f] : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
              boxShadow: activeFilter === f ? `0 4px 14px ${filterColors[f]}44` : 'none',
            }}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Mission cards grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 18,
      }}>
        {filtered.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onComplete={completeMission}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-ui)',
          fontSize: 16,
          letterSpacing: '0.1em',
        }}>
          NO HAY MISIONES EN ESTA CATEGORÍA
        </div>
      )}
    </div>
  );
}
