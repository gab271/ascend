import { useState, useEffect, useRef } from 'react';
import { Flame, Zap, Shield, DollarSign, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { currentUser, dailyMissions, ranking } from '../data/mockData';

// ─── Animated counter ────────────────────────────────────────────
function useCountUp(target, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setValue(Math.floor(ease * target));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

// ─── Hexagonal Level Display (SVG) ──────────────────────────────
// THE signature ASCEND visual element
function HexLevel({ level, title }) {
  return (
    <div style={{ position: 'relative', width: 210, height: 230, flexShrink: 0 }}>
      {/* Outer rotating dashed ring */}
      <div style={{
        position: 'absolute',
        inset: -18,
        borderRadius: '50%',
        border: '1px dashed rgba(124,92,255,0.32)',
        animation: 'spin-slow 22s linear infinite',
        pointerEvents: 'none',
      }}>
        {/* Orbit dot */}
        <div style={{
          position: 'absolute',
          top: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 9,
          height: 9,
          borderRadius: '50%',
          background: 'var(--violet)',
          boxShadow: '0 0 14px var(--violet)',
        }} />
      </div>

      {/* Second counter-rotating ring */}
      <div style={{
        position: 'absolute',
        inset: -35,
        borderRadius: '50%',
        border: '1px dashed rgba(51,209,255,0.14)',
        animation: 'spin-slow 38s linear infinite',
        animationDirection: 'reverse',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          bottom: -5,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--cyan)',
          boxShadow: '0 0 10px var(--cyan)',
        }} />
      </div>

      {/* SVG hexagon + level number */}
      <svg
        width="210"
        height="230"
        viewBox="0 0 210 230"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>
          <filter id="hexglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="numglow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hexFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#33D1FF" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Glow hex (slightly larger, behind) */}
        <polygon
          points="105,6 198,55 198,175 105,224 12,175 12,55"
          fill="none"
          stroke="rgba(124,92,255,0.7)"
          strokeWidth="1.5"
          filter="url(#hexglow)"
        />

        {/* Main hex fill */}
        <polygon
          points="105,14 188,60 188,168 105,214 22,168 22,60"
          fill="url(#hexFill)"
          stroke="rgba(124,92,255,0.3)"
          strokeWidth="1"
        />

        {/* "LVL" label */}
        <text
          x="105"
          y="82"
          textAnchor="middle"
          fontFamily="'Rajdhani', sans-serif"
          fontWeight="700"
          fontSize="13"
          fill="rgba(124,92,255,0.85)"
          letterSpacing="6"
        >
          LVL
        </text>

        {/* THE BIG NUMBER — the hero of this element */}
        <text
          x="105"
          y="162"
          textAnchor="middle"
          fontFamily="'Bebas Neue', sans-serif"
          fontSize="100"
          fill="white"
          filter="url(#numglow)"
        >
          {level}
        </text>

        {/* Title below */}
        <text
          x="105"
          y="202"
          textAnchor="middle"
          fontFamily="'Rajdhani', sans-serif"
          fontWeight="700"
          fontSize="11"
          fill="rgba(245,196,81,0.85)"
          letterSpacing="4"
        >
          {title.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

// ─── Segmented XP Bar ────────────────────────────────────────────
function SegmentedXPBar({ current, max, segments = 20 }) {
  const [tick, setTick] = useState(0);
  const percent = (current / max) * 100;

  useEffect(() => {
    const t = setTimeout(() => setTick(1), 300);
    return () => clearTimeout(t);
  }, []);

  const animPercent = tick ? percent : 0;
  const filled = Math.floor((animPercent / 100) * segments);
  const partial = ((animPercent / 100) * segments) % 1;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--violet)' }}>
          <Zap size={11} />
          EXPERIENCIA
        </span>
        <span>
          {current.toLocaleString()}
          <span style={{ color: 'var(--text-muted)' }}> / {max.toLocaleString()} XP</span>
        </span>
      </div>

      {/* Segmented blocks */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          const isPartial = i === filled && partial > 0;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 14,
                background: isFilled
                  ? 'linear-gradient(90deg, var(--violet), var(--cyan))'
                  : isPartial
                    ? `linear-gradient(90deg, var(--violet) ${partial * 100}%, var(--surface) ${partial * 100}%)`
                    : 'var(--surface)',
                borderRadius: 2,
                border: isFilled || isPartial ? 'none' : '1px solid var(--border)',
                boxShadow: isFilled ? '0 0 5px rgba(124,92,255,0.3)' : 'none',
                transition: `background ${0.6 + i * 0.04}s cubic-bezier(0.4, 0, 0.2, 1)`,
                transitionDelay: tick ? `${i * 0.03}s` : '0s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isFilled && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(0deg, transparent, rgba(255,255,255,0.14))',
                }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text-muted)',
        textAlign: 'right',
      }}>
        {(max - current).toLocaleString()} XP para nivel {currentUser.level + 1}
      </div>
    </div>
  );
}

// ─── Angular Stat Card ───────────────────────────────────────────
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
      {/* Background glow spot */}
      <div style={{
        position: 'absolute',
        bottom: -20, right: -20,
        width: 100, height: 100,
        borderRadius: '50%',
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
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 11,
            color: change >= 0 ? 'var(--green)' : 'var(--red)',
            background: change >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
            border: `1px solid ${change >= 0 ? 'rgba(51,230,161,0.3)' : 'rgba(255,77,106,0.3)'}`,
            borderRadius: 3,
            padding: '2px 7px',
          }}>
            {change >= 0 ? '+' : ''}{change}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 56,
        color,
        lineHeight: 1,
        marginBottom: 2,
        textShadow: `0 0 30px ${color}55`,
      }}>
        {animated}
      </div>

      <div style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 700,
        fontSize: 10,
        letterSpacing: '0.22em',
        color: 'var(--text-muted)',
        marginBottom: 10,
      }}>
        {label}
      </div>

      <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${barWidth}%`,
          height: '100%',
          background: color,
          borderRadius: 3,
          transition: 'width 1.1s cubic-bezier(0.4, 0, 0.2, 1)',
          transitionDelay: '0.6s',
        }} />
      </div>
    </div>
  );
}

// ─── Mission row ─────────────────────────────────────────────────
function MissionRow({ mission, onComplete }) {
  const rarityColor = {
    common: 'var(--rarity-common)',
    rare: 'var(--rarity-rare)',
    epic: 'var(--rarity-epic)',
    legendary: 'var(--rarity-legendary)',
  }[mission.rarity];

  const attrColor = {
    health: 'var(--green)',
    money: 'var(--gold)',
    discipline: 'var(--violet)',
  }[mission.attribute];

  const attrLabel = { health: 'SALUD', money: 'DINERO', discipline: 'DISCIPLINA' }[mission.attribute];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
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
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 13,
            color: mission.completed ? 'var(--text-muted)' : 'var(--text)',
            textDecoration: mission.completed ? 'line-through' : 'none',
          }}>
            {mission.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 8,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: rarityColor,
            background: `${rarityColor}15`,
            border: `1px solid ${rarityColor}44`,
            borderRadius: 2,
            padding: '1px 5px',
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
          borderRadius: 7,
          padding: '7px 13px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.08em',
          cursor: mission.completed ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          transition: 'var(--transition)',
          flexShrink: 0,
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

// ─── Simple weekly bar chart ──────────────────────────────────────
function WeeklyChart({ data }) {
  const max = Math.max(...data);
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
      {data.map((val, i) => {
        const isToday = i === todayIdx;
        const h = Math.max((val / max) * 100, 8);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: '100%',
              height: 55,
              display: 'flex',
              alignItems: 'flex-end',
            }}>
              <div style={{
                width: '100%',
                height: `${h}%`,
                background: isToday
                  ? 'linear-gradient(180deg, var(--cyan), var(--violet))'
                  : 'var(--surface)',
                borderRadius: '3px 3px 0 0',
                border: isToday ? '1px solid var(--cyan)' : '1px solid var(--border)',
                boxShadow: isToday ? '0 0 10px var(--cyan-glow)' : 'none',
                minHeight: 4,
                transition: 'height 0.8s ease',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: isToday ? 'var(--cyan)' : 'var(--text-muted)',
            }}>
              {days[i]}
            </span>
          </div>
        );
      })}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '28px 36px',
            background: 'linear-gradient(135deg, var(--panel), #16102A)',
            borderColor: 'rgba(124,92,255,0.25)',
            minWidth: 280,
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Background glow */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(124,92,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <HexLevel level={currentUser.level} title={currentUser.title} />
        </div>

        {/* ─ XP + info ─ */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, var(--panel), #12182E)',
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.2em',
              marginBottom: 4,
            }}>
              {greeting.toUpperCase()},
              <span style={{ color: 'var(--violet)', marginLeft: 6 }}>{currentUser.username}</span>
            </div>

            {/* Total XP display */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
              }}>XP TOTAL</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 42,
                color: 'var(--violet)',
                lineHeight: 1,
                textShadow: '0 0 30px var(--violet-glow)',
              }}>
                {currentUser.totalXP.toLocaleString()}
              </span>
            </div>
          </div>

          <SegmentedXPBar current={currentUser.xp} max={currentUser.xpNext} />
        </div>

        {/* ─ Streak ─ */}
        <div
          className="card"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'linear-gradient(160deg, var(--panel), #1A1200)',
            borderColor: 'rgba(245,196,81,0.2)',
            gap: 6,
          }}
        >
          <div style={{
            fontSize: 42,
            animation: 'streak-pulse 2.2s ease-in-out infinite',
            filter: 'drop-shadow(0 0 12px rgba(245,196,81,0.6))',
          }}>
            🔥
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 72,
            color: 'var(--gold)',
            lineHeight: 0.9,
            textShadow: '0 0 40px var(--gold-glow)',
          }}>
            {currentUser.streak}
          </div>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: '0.22em',
            color: 'var(--text-muted)',
          }}>
            DÍAS DE RACHA
          </div>
        </div>
      </div>

      {/* ═══ ROW 2: Attributes ══════════════════════════════════ */}
      <div>
        <div className="section-label">ATRIBUTOS</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatCard label="SALUD" value={currentUser.stats.health.value} max={100} color="var(--green)" icon={Shield} change={currentUser.stats.health.change} />
          <StatCard label="DINERO" value={currentUser.stats.money.value} max={100} color="var(--gold)" icon={DollarSign} change={currentUser.stats.money.change} />
          <StatCard label="DISCIPLINA" value={currentUser.stats.discipline.value} max={100} color="var(--violet)" icon={Zap} change={currentUser.stats.discipline.change} />
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
            <Link to="/missions" style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.1em',
              color: 'var(--violet)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}>
              VER TODAS <ChevronRight size={13} />
            </Link>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {missions.map((m, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: 6,
                  background: m.completed ? 'var(--green)' : 'var(--surface)',
                  border: m.completed ? 'none' : '1px solid var(--border)',
                  borderRadius: 3,
                  transition: 'background 0.4s ease',
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
              <Link to="/ranking" style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                gap: 3,
              }}>
                VER <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {friends.map((user, idx) => (
                <div
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    borderRadius: 7,
                    background: user.isMe ? 'var(--violet-dim)' : 'transparent',
                    border: `1px solid ${user.isMe ? 'rgba(124,92,255,0.3)' : 'transparent'}`,
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!user.isMe) e.currentTarget.style.background = 'var(--surface)'; }}
                  onMouseLeave={e => { if (!user.isMe) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 16,
                    width: 22,
                    textAlign: 'center',
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
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 700,
                      fontSize: 12,
                      color: user.isMe ? 'var(--violet)' : 'var(--text)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      letterSpacing: '0.04em',
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
