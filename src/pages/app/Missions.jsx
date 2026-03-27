import { useState } from 'react';
import { allMissions } from '../../fixtures/mockData';
import MissionCard from '../../components/game/MissionCard';

const FILTERS = ['all', 'health', 'money', 'discipline', 'legendary'];

const FILTER_LABELS = {
  all:        'Todas',
  health:     'Salud',
  money:      'Dinero',
  discipline: 'Disciplina',
  legendary:  '⭐ Legendarias',
};

const FILTER_COLORS = {
  all:        'var(--text-secondary)',
  health:     'var(--green)',
  money:      'var(--gold)',
  discipline: 'var(--violet)',
  legendary:  'var(--gold)',
};

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

  const completedCount = missions.filter(m => m.completed).length;
  const totalXP = missions.filter(m => !m.completed).reduce((sum, m) => sum + m.xp, 0);

  return (
    <div>
      {/* Header stats */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'MISIONES ACTIVAS', value: missions.length - completedCount, color: 'var(--cyan)' },
          { label: 'COMPLETADAS',      value: completedCount,                    color: 'var(--green)' },
          { label: 'XP DISPONIBLE',   value: `${totalXP.toLocaleString()} XP`,  color: 'var(--violet)' },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              flex: 1, background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 24, padding: '6px',
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 12, width: 'fit-content',
      }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '8px 18px', borderRadius: 8,
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
              color: activeFilter === f ? 'white' : 'var(--text-muted)',
              background: activeFilter === f ? FILTER_COLORS[f] : 'transparent',
              border: 'none', cursor: 'pointer', transition: 'var(--transition)',
              boxShadow: activeFilter === f ? `0 4px 14px ${FILTER_COLORS[f]}44` : 'none',
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Mission cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {filtered.map(mission => (
          <MissionCard key={mission.id} mission={mission} onComplete={completeMission} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          color: 'var(--text-muted)', fontFamily: 'var(--font-ui)',
          fontSize: 16, letterSpacing: '0.1em',
        }}>
          NO HAY MISIONES EN ESTA CATEGORÍA
        </div>
      )}
    </div>
  );
}
