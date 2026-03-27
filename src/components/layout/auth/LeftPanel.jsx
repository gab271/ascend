import { Link } from 'react-router-dom';
import { CheckCircle2, Trophy, Flame, Zap, Shield, DollarSign, Swords, Star, TrendingUp } from 'lucide-react';
import LogoMark from '../../icons/LogoMark';

/* ─── Login variant content ──────────────────────────────────── */
function LoginContent() {
  const XP = 4230, XP_NEXT = 5000;
  const pct = Math.round((XP / XP_NEXT) * 100);
  const ATTRS = [
    { label: 'SALUD',      val: 78, color: '#33E6A1', grad: 'linear-gradient(90deg,#1aad78,#33E6A1)' },
    { label: 'DINERO',     val: 62, color: '#F5C451', grad: 'linear-gradient(90deg,#c49a30,#F5C451)' },
    { label: 'DISCIPLINA', val: 91, color: '#7C5CFF', grad: 'linear-gradient(90deg,#5a3fd4,#7C5CFF)' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.9)', letterSpacing: '0.24em', marginBottom: 4 }}>
        // ESTADO DEL OPERADOR
      </div>

      <div style={{
        background: 'rgba(10,11,16,0.65)',
        border: '1px solid rgba(42,51,82,0.9)',
        borderTop: '2px solid #7C5CFF',
        padding: '20px 20px 16px',
        animation: 'entry-left 0.6s ease 0.1s forwards', opacity: 0, animationFillMode: 'forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginBottom: 16 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 60, lineHeight: 0.9,
            color: '#7C5CFF', textShadow: '0 0 40px rgba(124,92,255,0.5)',
          }}>24</div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.85)', letterSpacing: '0.2em', marginBottom: 4 }}>NIVEL GLOBAL</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 16, color: '#F5F7FB', letterSpacing: '0.1em', lineHeight: 1 }}>ENFORCER</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(124,92,255,0.75)', letterSpacing: '0.14em', marginTop: 3 }}>◆ ÉPICO</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right', paddingBottom: 4 }}>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 28, color: '#F5C451',
              textShadow: '0 0 18px rgba(245,196,81,0.5)',
              animation: 'streak-pulse 2.5s ease-in-out infinite',
            }}>🔥 14</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(245,196,81,0.5)', letterSpacing: '0.12em', marginTop: 2 }}>DÍAS</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.85)', letterSpacing: '0.18em' }}>XP</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
              <span style={{ color: 'rgba(245,247,251,0.8)' }}>{XP.toLocaleString()}</span>
              <span style={{ color: 'rgba(74,90,122,0.7)' }}> / {XP_NEXT.toLocaleString()}</span>
            </span>
          </div>
          <div style={{ height: 4, background: 'rgba(42,51,82,0.8)', overflow: 'hidden', position: 'relative' }}>
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
              boxShadow: '0 0 8px rgba(124,92,255,0.7)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                backgroundSize: '200% 100%', animation: 'xp-shimmer 2s linear infinite',
              }} />
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(124,92,255,0.6)', letterSpacing: '0.1em', marginTop: 4, textAlign: 'right' }}>
            {pct}% → NIV. 25
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {ATTRS.map(a => (
            <div key={a.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9, letterSpacing: '0.14em', color: a.color }}>{a.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(160,174,203,0.6)' }}>{a.val}</span>
              </div>
              <div style={{ height: 3, background: 'rgba(26,32,53,0.9)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${a.val}%`, background: a.grad, boxShadow: `0 0 5px ${a.color}50` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{
            flex: 1, padding: '8px 10px',
            background: 'rgba(51,230,161,0.04)', border: '1px solid rgba(51,230,161,0.12)',
            borderLeft: '2px solid #33E6A1',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(74,90,122,0.8)', letterSpacing: '0.16em', marginBottom: 4 }}>ÚLTIMA MISIÓN</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={9} color="#33E6A1" />
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11, color: 'rgba(245,247,251,0.75)' }}>Entrenamiento · hace 18h</span>
            </div>
          </div>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(245,196,81,0.06)', border: '1px solid rgba(245,196,81,0.14)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#F5C451', lineHeight: 1 }}>#12</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(245,196,81,0.5)', letterSpacing: '0.1em' }}>GLOBAL</div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex', border: '1px solid rgba(42,51,82,0.7)', overflow: 'hidden',
        animation: 'entry-left 0.6s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards',
      }}>
        {[
          { v: '2.847', l: 'EN LÍNEA',     c: '#33D1FF' },
          { v: '48.2K', l: 'MISIONES HOY', c: '#33E6A1' },
          { v: '62d',   l: 'RACHA RÉC.',   c: '#F5C451' },
        ].map(({ v, l, c }, i, arr) => (
          <div key={l} style={{
            flex: 1, padding: '10px 12px',
            borderRight: i < arr.length - 1 ? '1px solid rgba(42,51,82,0.7)' : 'none',
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: c, textShadow: `0 0 12px ${c}`, lineHeight: 1, marginBottom: 3 }}>{v}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'rgba(74,90,122,0.85)', letterSpacing: '0.14em' }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Register variant content ───────────────────────────────── */
function RegisterContent() {
  const RANKS = [
    { tier: 'LEGEND',    range: 'Nv. 41+',   color: '#F5C451', icon: <Star size={13} />,      desc: 'Élite global. Top 1%.' },
    { tier: 'PHANTOM',   range: 'Nv. 26–40', color: '#7C5CFF', icon: <Zap size={13} />,       desc: 'Alto rendimiento.' },
    { tier: 'ENFORCER',  range: 'Nv. 13–25', color: '#33D1FF', icon: <TrendingUp size={13} />, desc: 'Consistencia probada.' },
    { tier: 'OPERATIVE', range: 'Nv. 6–12',  color: '#33E6A1', icon: <CheckCircle2 size={13} />, desc: 'Disciplina activa.' },
    { tier: 'ROOKIE',    range: 'Nv. 1–5',   color: 'rgba(160,174,203,0.6)', icon: <Shield size={13} />, desc: 'El punto de partida.' },
  ];

  return (
    <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.9)', letterSpacing: '0.24em', marginBottom: 4 }}>
        // RANGOS DEL SISTEMA
      </div>

      <div style={{
        border: '1px solid rgba(42,51,82,0.8)', overflow: 'hidden',
        animation: 'entry-left 0.6s ease 0.1s forwards', opacity: 0, animationFillMode: 'forwards',
      }}>
        {RANKS.map(({ tier, range, color, icon, desc }, i) => (
          <div key={tier} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            background: i === 0 ? `${color}08` : 'rgba(10,11,16,0.4)',
            borderBottom: i < RANKS.length - 1 ? '1px solid rgba(42,51,82,0.5)' : 'none',
            borderLeft: `2px solid ${color}`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: `${color}12`, border: `1px solid ${color}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color,
            }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color, letterSpacing: '0.1em' }}>{tier}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.8)', letterSpacing: '0.06em' }}>{range}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(160,174,203,0.6)', marginTop: 1 }}>{desc}</div>
            </div>
            {i === 0 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: `${color}80`, letterSpacing: '0.1em', flexShrink: 0 }}>← TU META</div>
            )}
          </div>
        ))}
      </div>

      <div style={{ animation: 'entry-left 0.6s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.85)', letterSpacing: '0.2em', marginBottom: 10 }}>
          // PILARES DEL SISTEMA
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { icon: <Shield size={14} />,    label: 'SALUD',      color: '#33E6A1', desc: 'Energía y consistencia física' },
            { icon: <DollarSign size={14} />, label: 'DINERO',     color: '#F5C451', desc: 'Inteligencia financiera' },
            { icon: <Swords size={14} />,     label: 'DISCIPLINA', color: '#7C5CFF', desc: 'Constancia sin negociaciones' },
          ].map(({ icon, label, color, desc }) => (
            <div key={label} style={{
              flex: 1, padding: '12px 10px',
              background: `${color}07`,
              border: `1px solid ${color}20`,
              borderTop: `2px solid ${color}`,
              textAlign: 'center',
            }}>
              <div style={{ color, marginBottom: 6, display: 'flex', justifyContent: 'center' }}>{icon}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color, letterSpacing: '0.12em', marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'rgba(160,174,203,0.55)', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        background: 'rgba(124,92,255,0.06)', border: '1px solid rgba(124,92,255,0.15)',
        animation: 'entry-left 0.6s ease 0.28s forwards', opacity: 0, animationFillMode: 'forwards',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#33E6A1', boxShadow: '0 0 5px #33E6A1', animation: 'pulse-glow 2s infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(160,174,203,0.8)', fontWeight: 600 }}>
          +2.400 operadores activos esta semana
        </span>
      </div>
    </div>
  );
}

/* ─── Left panel shell ───────────────────────────────────────── */
export default function LeftPanel({ variant }) {
  const isRegister = variant === 'register';
  const accentColor = isRegister ? '#33D1FF' : '#7C5CFF';

  return (
    <div className="auth-left-panel" style={{
      width: '46%', flexShrink: 0,
      position: 'sticky', top: 0,
      height: '100vh', maxHeight: '100vh',
      background: '#131722',
      borderRight: '1px solid rgba(42,51,82,0.7)',
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      padding: '44px 44px 40px',
    }}>
      {/* Animated grid */}
      <div style={{
        position: 'absolute', inset: '-20%',
        backgroundImage: 'linear-gradient(rgba(42,51,82,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.15) 1px, transparent 1px)',
        backgroundSize: '44px 44px',
        animation: 'grid-flow 10s linear infinite',
        pointerEvents: 'none',
      }} />

      {/* Radial glow */}
      <div style={{
        position: 'absolute', bottom: -100, right: -80,
        width: 520, height: 520,
        background: `radial-gradient(circle, ${accentColor}0F 0%, transparent 65%)`,
        pointerEvents: 'none', transition: 'background 0.6s',
      }} />
      <div style={{
        position: 'absolute', top: -40, left: '10%',
        width: 300, height: 200,
        background: 'radial-gradient(ellipse, rgba(51,209,255,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Scan sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${accentColor}30, transparent)`,
        animation: 'scan-sweep 6s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 3,
      }} />

      {/* Top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: isRegister
          ? 'linear-gradient(90deg, #33D1FF, #33E6A1, transparent 80%)'
          : 'linear-gradient(90deg, #7C5CFF, #33D1FF, transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* HUD corners */}
      {[
        { top: 16, left: 16, borderWidth: '1.5px 0 0 1.5px' },
        { top: 16, right: 16, borderWidth: '1.5px 1.5px 0 0' },
        { bottom: 16, left: 16, borderWidth: '0 0 1.5px 1.5px' },
        { bottom: 16, right: 16, borderWidth: '0 1.5px 1.5px 0' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', width: 20, height: 20,
          borderColor: `${accentColor}30`, borderStyle: 'solid',
          pointerEvents: 'none', zIndex: 2, ...pos,
        }} />
      ))}

      {/* Ghost ASCEND text */}
      <div style={{
        position: 'absolute', bottom: '4%', left: -10,
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(100px, 14vw, 160px)',
        color: 'transparent',
        WebkitTextStroke: '1px rgba(42,51,82,0.4)',
        lineHeight: 0.85,
        userSelect: 'none', pointerEvents: 'none',
        letterSpacing: '-0.02em', zIndex: 0,
        whiteSpace: 'nowrap',
      }}>
        ASC<br />END
      </div>

      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <LogoMark size={26} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.3em', color: '#F5F7FB' }}>ASCEND</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.6)', letterSpacing: '0.1em', marginTop: 2 }}>v1.0</span>
      </Link>

      {/* Variant content */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: 32 }}>
        {isRegister ? <RegisterContent /> : <LoginContent />}
      </div>

      {/* Bottom quote */}
      <div style={{ position: 'relative', zIndex: 2, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(42,51,82,0.9)' }} />
          <div style={{ width: 5, height: 5, background: accentColor, transform: 'rotate(45deg)', opacity: 0.4 }} />
        </div>
        <p style={{
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
          color: 'rgba(160,174,203,0.7)', letterSpacing: '0.03em', lineHeight: 1.8, margin: 0,
        }}>
          {isRegister
            ? '"El mejor momento para empezar fue ayer.\nEl segundo mejor momento es ahora."'
            : '"No perdiste el progreso.\nSolo necesitas reconectarte."'
          }
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.55)', letterSpacing: '0.14em', marginTop: 10 }}>
          — SISTEMA ASCEND v1.0
        </div>
      </div>
    </div>
  );
}
