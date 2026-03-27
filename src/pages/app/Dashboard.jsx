import { useState, useEffect } from 'react';
import { Flame, Shield, DollarSign, Zap, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currentUser, dailyMissions, ranking } from '../../fixtures/mockData';
import { useCountUp } from '../../hooks/useCountUp';
import HexLevel from '../../components/game/HexLevel';
import XPBar from '../../components/game/XPBar';
import WeeklyChart from '../../components/game/WeeklyChart';
import MissionRow from '../../components/game/MissionRow';

// ─── Angular Stat Card (dashboard-only) ─────────────────────────
function StatCard({ label, value, max, color, icon: Icon, change }) {
  const animated = useCountUp(value, 1200, 400);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth((value / max) * 100), 600);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <div
      className="clip-angular-tr"
      style={{
        flex: 1,
        background: 'var(--panel)',
        border: `1px solid ${color}22`,
        padding: '22px 22px 18px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}66`;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.35), 0 0 28px ${color}28`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${color}22`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: `${color}18`, border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        {change !== undefined && (
          <div style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
            color: change >= 0 ? 'var(--green)' : 'var(--red)',
            background: change >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
            border: `1px solid ${change >= 0 ? 'rgba(51,230,161,0.3)' : 'rgba(255,77,106,0.3)'}`,
            borderRadius: 3, padding: '2px 7px',
          }}>
            {change >= 0 ? '+' : ''}{change}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 56, color,
        lineHeight: 1, marginBottom: 2, textShadow: `0 0 30px ${color}55`,
      }}>
        {animated}
      </div>

      <div style={{
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
        letterSpacing: '0.22em', color: 'var(--text-muted)', marginBottom: 10,
      }}>
        {label}
      </div>

      <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${barWidth}%`, height: '100%', background: color, borderRadius: 3,
          transition: 'width 1.1s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.6s',
        }} />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
export default function Dashboard() {
  const [missions, setMissions] = useState(dailyMissions);
  const completeMission = (id) => setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));

  const completedCount = missions.filter(m => m.completed).length;
  const friends = ranking.slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ═══ ROW 1: Level hex + XP + Streak ════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 200px', gap: 20 }}>

        {/* ─ Hexagonal level display ─ */}
        <div
          className="card"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '28px 36px',
            background: 'linear-gradient(135deg, var(--panel), #16102A)',
            borderColor: 'rgba(124,92,255,0.25)',
            minWidth: 280, position: 'relative', overflow: 'visible',
          }}
        >
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(124,92,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <HexLevel level={currentUser.level} title={currentUser.title} />
        </div>

        {/* ─ XP + info ─ */}
        <div
          className="card"
          style={{
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--panel), #12182E)',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 4,
            }}>
              {greeting.toUpperCase()},
              <span style={{ color: 'var(--violet)', marginLeft: 6 }}>{currentUser.username}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>XP TOTAL</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 42, color: 'var(--violet)',
                lineHeight: 1, textShadow: '0 0 30px var(--violet-glow)',
              }}>
                {currentUser.totalXP.toLocaleString()}
              </span>
            </div>
          </div>

          <XPBar current={currentUser.xp} max={currentUser.xpNext} nextLevel={currentUser.level + 1} />
        </div>

        {/* ─ Streak ─ */}
        <div
          className="card"
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', textAlign: 'center',
            background: 'linear-gradient(160deg, var(--panel), #1A1200)',
            borderColor: 'rgba(245,196,81,0.2)', gap: 6,
          }}
        >
          <div style={{ fontSize: 42, animation: 'streak-pulse 2.2s ease-in-out infinite', filter: 'drop-shadow(0 0 12px rgba(245,196,81,0.6))' }}>
            🔥
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 72, color: 'var(--gold)', lineHeight: 0.9, textShadow: '0 0 40px var(--gold-glow)' }}>
            {currentUser.streak}
          </div>
          <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, letterSpacing: '0.22em', color: 'var(--text-muted)' }}>
            DÍAS DE RACHA
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: Attributes ══════════════════════════════════ */}
      <div>
        <div className="section-label">ATRIBUTOS</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard label="SALUD"      value={currentUser.stats.health.value}     max={100} color="var(--green)"  icon={Shield}     change={currentUser.stats.health.change} />
          <StatCard label="DINERO"     value={currentUser.stats.money.value}      max={100} color="var(--gold)"   icon={DollarSign} change={currentUser.stats.money.change} />
          <StatCard label="DISCIPLINA" value={currentUser.stats.discipline.value} max={100} color="var(--violet)" icon={Zap}        change={currentUser.stats.discipline.change} />
        </div>
      </div>

      {/* ═══ ROW 3: Missions + sidebar ══════════════════════════ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

        {/* Daily missions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div className="section-label" style={{ marginBottom: 2 }}>MISIONES DEL DÍA</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                {completedCount}/{missions.length} completadas
              </div>
            </div>
            <Link to="/missions" style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: 'var(--violet)', display: 'flex', alignItems: 'center', gap: 3 }}>
              VER TODAS <ChevronRight size={13} />
            </Link>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {missions.map((m, i) => (
                <div key={i} style={{
                  flex: 1, height: 6,
                  background: m.completed ? 'var(--green)' : 'var(--surface)',
                  border: m.completed ? 'none' : '1px solid var(--border)',
                  borderRadius: 3, transition: 'background 0.4s ease',
                }} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {missions.map(mission => (
              <MissionRow key={mission.id} mission={mission} onComplete={completeMission} />
            ))}
          </div>
        </div>

        {/* Right sidebar: ranking + chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Mini ranking */}
          <div className="card" style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>RANKING</div>
              <Link to="/ranking" style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 3 }}>
                VER <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {friends.map((user, idx) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 10px', borderRadius: 7,
                    background: user.isMe ? 'var(--violet-dim)' : 'transparent',
                    border: `1px solid ${user.isMe ? 'rgba(124,92,255,0.3)' : 'transparent'}`,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!user.isMe) e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { if (!user.isMe) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 16, width: 22, textAlign: 'center',
                    color: idx === 0 ? 'var(--gold)' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : 'var(--text-muted)',
                  }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: user.isMe ? 'linear-gradient(135deg, var(--violet), var(--cyan))' : 'var(--surface)',
                    border: `2px solid ${user.isMe ? 'var(--violet)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, color: 'white',
                  }}>
                    {user.username.slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{
                      fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                      color: user.isMe ? 'var(--violet)' : 'var(--text)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.04em',
                    }}>
                      {user.username}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>LVL {user.level}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: user.isMe ? 'var(--violet)' : 'var(--text-muted)' }}>
                    {(user.xp / 1000).toFixed(1)}K
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly XP chart */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div className="section-label" style={{ marginBottom: 0 }}>XP SEMANAL</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--cyan)' }}>
                {currentUser.weeklyXP.reduce((a, b) => a + b, 0).toLocaleString()} XP
              </div>
            </div>
            <WeeklyChart data={currentUser.weeklyXP} />
          </div>
        </div>
      </div>
    </div>
  );
}
