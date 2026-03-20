import { Link } from 'react-router-dom';

// ─── Shared input with HUD styling ───────────────────────────────────────────
export function AuthInput({
  label, type = 'text', value, onChange,
  icon, placeholder, focused, onFocus, onBlur,
  suffix, delay = 0, error = false,
}) {
  const borderColor  = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--border)';
  const leftBorder   = error ? 'var(--red)' : focused ? 'var(--violet)' : 'transparent';
  const labelColor   = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--text-muted)';
  const iconColor    = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--text-muted)';
  const bgColor      = error
    ? 'rgba(255,77,106,0.03)'
    : focused ? 'rgba(124,92,255,0.04)' : 'rgba(19,23,34,0.4)';

  return (
    <div style={{
      marginBottom: 28,
      animation: `entry-up 0.5s ease ${delay}s forwards`,
      opacity: 0,
      animationFillMode: 'forwards',
    }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.2em',
        color: labelColor,
        marginBottom: 8,
        transition: 'color 0.2s',
        userSelect: 'none',
      }}>
        {label}
      </label>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: bgColor,
        borderBottom: `2px solid ${borderColor}`,
        borderLeft: `2px solid ${leftBorder}`,
        padding: '0 14px 0 12px',
        minHeight: 52,
        transition: 'all 0.25s ease',
      }}>
        {icon && (
          <span style={{
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--text)',
            letterSpacing: '0.03em',
          }}
        />
        {suffix}
      </div>
    </div>
  );
}

// ─── Shared submit button ─────────────────────────────────────────────────────
export function AuthButton({ loading, children, delay = 0 }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%',
        padding: '16px 24px',
        background: loading ? 'rgba(124,92,255,0.55)' : 'var(--violet)',
        border: 'none',
        clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)',
        color: 'white',
        fontFamily: 'var(--font-display)',
        fontSize: 18,
        letterSpacing: '0.16em',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : '0 8px 32px var(--violet-glow)',
        transition: 'box-shadow 0.3s, background 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        animation: `entry-up 0.5s ease ${delay}s forwards`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.boxShadow = '0 10px 40px rgba(124,92,255,0.55)';
          e.currentTarget.style.background = '#8B6FFF';
        }
      }}
      onMouseLeave={e => {
        if (!loading) {
          e.currentTarget.style.boxShadow = '0 8px 32px var(--violet-glow)';
          e.currentTarget.style.background = 'var(--violet)';
        }
      }}
    >
      {loading && (
        <span style={{ animation: 'spin-slow 0.8s linear infinite', display: 'inline-block', fontSize: 14 }}>
          ◌
        </span>
      )}
      {children}
    </button>
  );
}

// ─── Community stats ──────────────────────────────────────────────────────────
const COMMUNITY_STATS = [
  { value: '2,847', label: 'Agentes activos', color: 'var(--cyan)' },
  { value: '48.2K', label: 'Misiones hoy', color: 'var(--green)' },
  { value: '62 días', label: 'Racha récord', color: 'var(--gold)' },
];

// ─── Left decorative panel ────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      className="auth-left-panel"
      style={{
        width: '48%',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: 'var(--panel)',
        borderRight: '1px solid var(--border)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 52px',
      }}
    >
      {/* Animated grid */}
      <div style={{
        position: 'absolute', inset: '-20%',
        backgroundImage: `
          linear-gradient(rgba(42,51,82,0.22) 1px, transparent 1px),
          linear-gradient(90deg, rgba(42,51,82,0.22) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        animation: 'grid-flow 10s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Radial glows */}
      <div style={{
        position: 'absolute', bottom: -100, right: -50,
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(124,92,255,0.13) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: -60, left: '15%',
        width: 280, height: 180,
        background: 'radial-gradient(ellipse, rgba(51,209,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Scan sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.25), transparent)',
        animation: 'scan-sweep 6s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, var(--violet), var(--cyan), transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* HUD corner brackets */}
      {[
        { top: 20, left: 20, borderWidth: '2px 0 0 2px' },
        { top: 20, right: 20, borderWidth: '2px 2px 0 0' },
        { bottom: 20, left: 20, borderWidth: '0 0 2px 2px' },
        { bottom: 20, right: 20, borderWidth: '0 2px 2px 0' },
      ].map((corner, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 22, height: 22,
          borderColor: 'rgba(124,92,255,0.4)',
          borderStyle: 'solid',
          ...corner,
        }} />
      ))}

      {/* Ghost background text */}
      <div style={{
        position: 'absolute',
        bottom: '8%', left: -14,
        fontFamily: 'var(--font-display)',
        fontSize: '19vw',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(42,51,82,0.55)',
        lineHeight: 0.85,
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-0.02em',
        zIndex: 0,
        whiteSpace: 'nowrap',
      }}>
        ASCE<br />ND
      </div>

      {/* ─ Logo ─ */}
      <Link to="/" style={{ textDecoration: 'none', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
            <polygon
              points="14,2 26,14 14,26 2,14"
              stroke="url(#aLG_auth)"
              strokeWidth="1.5"
              fill="rgba(124,92,255,0.08)"
            />
            <polyline
              points="9,17 14,10 19,17"
              stroke="url(#aLG2_auth)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="14" y1="10" x2="14" y2="20" stroke="url(#aLG2_auth)" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
              <linearGradient id="aLG_auth" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C5CFF" />
                <stop offset="100%" stopColor="#33D1FF" />
              </linearGradient>
              <linearGradient id="aLG2_auth" x1="9" y1="10" x2="19" y2="20" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#33D1FF" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 24,
            letterSpacing: '0.3em',
            color: 'var(--text)',
          }}>ASCEND</span>
        </div>
      </Link>

      {/* ─ Community stats ─ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          marginBottom: 28,
        }}>// COMUNIDAD EN TIEMPO REAL</div>

        {COMMUNITY_STATS.map((s, i) => (
          <div key={s.label} style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
            marginBottom: 22,
            animation: `entry-left 0.6s ease ${0.05 + i * 0.1}s forwards`,
            opacity: 0,
            animationFillMode: 'forwards',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              color: s.color,
              textShadow: `0 0 22px ${s.color}`,
              lineHeight: 1,
              minWidth: 96,
            }}>{s.value}</span>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 11,
              color: 'var(--text-muted)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ─ Quote ─ */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 1, background: 'var(--border)' }} />
          <div style={{ width: 6, height: 6, background: 'var(--violet)', transform: 'rotate(45deg)', opacity: 0.5 }} />
        </div>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          lineHeight: 1.9,
        }}>
          "Cada hábito es XP.<br />Cada día, una misión."
        </p>
      </div>
    </div>
  );
}

// ─── Main Auth Layout ─────────────────────────────────────────────────────────
export default function AuthLayout({ children }) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'var(--void)',
    }}>
      <LeftPanel />

      {/* Right: form area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        overflowY: 'auto',
        minHeight: '100vh',
      }}>
        {children}
      </div>
    </div>
  );
}