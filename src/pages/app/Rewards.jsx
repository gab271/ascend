import { useState, useEffect } from 'react';
import { getMyProfile, getRewardsCatalog } from '../../lib/api/profile';
import RewardCard from '../../components/game/RewardCard';

const CATEGORIES = ['badges', 'titles', 'frames', 'backgrounds'];
const CATEGORY_LABELS = {
  badges:      'Insignias',
  titles:      'Títulos',
  frames:      'Marcos',
  backgrounds: 'Fondos',
};

export default function Rewards() {
  const [activeCategory, setActiveCategory] = useState('badges');
  const [rewards,        setRewards]        = useState({ badges: [], titles: [], frames: [], backgrounds: [] });
  const [totalXP,        setTotalXP]        = useState(0);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => {
    Promise.all([getRewardsCatalog(), getMyProfile()]).then(([{ data: r }, { data: p }]) => {
      if (r) setRewards(r);
      if (p) setTotalXP(p.total_xp ?? 0);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>CARGANDO...</div>
    </div>
  );

  const items = rewards[activeCategory] || [];
  const unlockedCount = items.filter(i => i.unlocked).length;

  const totalUnlocked = Object.values(rewards).flat().filter(i => i.unlocked).length;
  const totalItems    = Object.values(rewards).flat().length;

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
          const catItems    = rewards[cat] || [];
          const catUnlocked = catItems.filter(i => i.unlocked).length;
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
        {items.map(item => (
          <RewardCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
