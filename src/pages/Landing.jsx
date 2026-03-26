import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/api/auth';
import {
  ArrowRight, Zap, TrendingUp, Target, Trophy, Shield,
  DollarSign, Menu, X, CheckCircle2, Flame, Star,
  ChevronRight, Activity, BarChart3, Swords,
  Award, Users, RotateCcw, Crosshair, Lock, Play
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════════════ */

function GlitchText({ children, style, as: Tag = 'span' }) {
  return (
    <Tag style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0, color: '#33D1FF',
        mixBlendMode: 'screen', animation: 'chromatic-1 9s ease-in-out infinite',
        userSelect: 'none', zIndex: 2,
      }}>{children}</span>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0, color: '#FF4D6A',
        mixBlendMode: 'screen', animation: 'chromatic-2 9s ease-in-out infinite',
        userSelect: 'none', zIndex: 2,
      }}>{children}</span>
    </Tag>
  );
}

function useBreakpoint(bp = 768) {
  const [below, setBelow] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= bp
  );
  useEffect(() => {
    const fn = () => setBelow(window.innerWidth <= bp);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, [bp]);
  return below;
}

function Section({ id, children, style, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(32px)',
      transition: `opacity 0.75s ease ${delay}ms, transform 0.75s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </section>
  );
}

function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="lmA" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#33D1FF" />
        </linearGradient>
      </defs>
      <polygon points="14,2 26,14 14,26 2,14" stroke="url(#lmA)" strokeWidth="1.5" fill="rgba(124,92,255,0.1)" />
      <polyline points="9,17 14,9 19,17" stroke="url(#lmA)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="9" x2="14" y2="20" stroke="url(#lmA)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* Pill label used before section headers */
function Eyebrow({ children, color = 'var(--violet)' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      color, marginBottom: 18,
    }}>
      <span style={{ display: 'block', width: 24, height: 1, background: color, opacity: 0.5 }} />
      {children}
      <span style={{ display: 'block', width: 24, height: 1, background: color, opacity: 0.5 }} />
    </div>
  );
}

/* Divider with optional accent */
function Divider({ accent }) {
  return (
    <div style={{
      height: 1,
      background: accent
        ? `linear-gradient(90deg, transparent, ${accent}44, transparent)`
        : 'linear-gradient(90deg, transparent, rgba(42,51,82,0.8), transparent)',
    }} />
  );
}

/* ═══════════════════════════════════════════════════════════════
   LIVE TICKER
═══════════════════════════════════════════════════════════════ */
const TICKER = [
  'DARKSTAR completó Entrenamiento de Fuerza · +150 XP',
  'RYUU_ALPHA sube al Nivel 29',
  'NOVA_PRIME supera los 58K de XP acumulados',
  'RACHA RÉCORD: 62 días consecutivos sin fallo',
  '+2.400 operadores activos esta semana',
  'Misión legendaria completada: Mes sin azúcar · +800 XP',
  'ÉLITE_X termina el mes en el Top 3 Global',
  'SALUD · DINERO · DISCIPLINA — El sistema que funciona',
];

function LiveTicker() {
  const text = TICKER.map(t => `▸  ${t}`).join('     ');
  return (
    <div style={{
      overflow: 'hidden', whiteSpace: 'nowrap',
      background: 'linear-gradient(90deg, rgba(124,92,255,0.07), rgba(51,209,255,0.04))',
      borderTop: '1px solid rgba(124,92,255,0.18)',
      borderBottom: '1px solid rgba(51,209,255,0.12)',
      padding: '11px 0',
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'ticker-scroll 44s linear infinite',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.09em',
        color: 'rgba(160,174,203,0.85)',
      }}>
        {(text + '     ').repeat(5)}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PRODUCT MOCKUP — Dashboard card
═══════════════════════════════════════════════════════════════ */
function ProductMockup({ isMobile }) {
  const MISSIONS = [
    { name: 'Entrenamiento de fuerza', xp: 150, color: '#33D1FF', badge: 'RARA', done: false },
    { name: 'Lectura 30 min · Finanzas', xp: 100, color: '#8B9AB3', badge: 'COMÚN', done: true },
    { name: 'Sin azúcar todo el día', xp: 200, color: '#7C5CFF', badge: 'ÉPICA', done: false },
  ];
  const ATTRS = [
    { label: 'SALUD', val: 78, color: '#33E6A1', grad: 'linear-gradient(90deg, #1aad78, #33E6A1)' },
    { label: 'DINERO', val: 62, color: '#F5C451', grad: 'linear-gradient(90deg, #c49a30, #F5C451)' },
    { label: 'DISCIPLINA', val: 91, color: '#7C5CFF', grad: 'linear-gradient(90deg, #5a3fd4, #7C5CFF)' },
  ];

  return (
    <div style={{
      width: '100%',
      maxWidth: isMobile ? '100%' : 448,
      background: '#131722',
      border: '1px solid rgba(124,92,255,0.22)',
      borderRadius: 16,
      overflow: 'hidden',
      position: 'relative',
      transform: isMobile ? 'none' : 'perspective(1000px) rotateY(-6deg) rotateX(2deg)',
      boxShadow: isMobile
        ? '0 20px 60px rgba(0,0,0,0.5)'
        : '0 50px 100px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,92,255,0.08), 0 0 80px rgba(124,92,255,0.07)',
    }}>
      {/* Scan sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.65), transparent)',
        animation: 'scan-sweep 4s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 20,
      }} />

      {/* HUD corners */}
      {[
        { top: 7, left: 7, borderWidth: '1.5px 0 0 1.5px' },
        { top: 7, right: 7, borderWidth: '1.5px 1.5px 0 0' },
        { bottom: 7, left: 7, borderWidth: '0 0 1.5px 1.5px' },
        { bottom: 7, right: 7, borderWidth: '0 1.5px 1.5px 0' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', width: 14, height: 14,
          borderColor: 'rgba(124,92,255,0.45)', borderStyle: 'solid',
          pointerEvents: 'none', zIndex: 10, ...pos,
        }} />
      ))}

      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 16px',
        background: 'rgba(10,11,16,0.7)',
        borderBottom: '1px solid rgba(42,51,82,0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#33E6A1', boxShadow: '0 0 5px #33E6A1', animation: 'pulse-glow 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#33E6A1', letterSpacing: '0.18em' }}>ASCEND OS · ACTIVO</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.5)', letterSpacing: '0.08em' }}>OPERADOR: DARKSTAR</span>
      </div>

      <div style={{ padding: '18px 18px 16px' }}>
        {/* Level + Streak row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,1)', letterSpacing: '0.22em', marginBottom: 3 }}>NIVEL GLOBAL</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 68, lineHeight: 1,
              color: '#F5F7FB', textShadow: '0 0 40px rgba(124,92,255,0.45)',
            }}>24</div>
          </div>
          <div style={{ textAlign: 'right', paddingBottom: 4 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,1)', letterSpacing: '0.18em', marginBottom: 4 }}>RACHA</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 30, color: '#F5C451',
              lineHeight: 1, textShadow: '0 0 18px rgba(245,196,81,0.5)',
              animation: 'streak-pulse 2.5s ease-in-out infinite',
            }}>🔥 14</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(245,196,81,0.55)', marginTop: 3, letterSpacing: '0.1em' }}>DÍAS</div>
          </div>
        </div>

        {/* XP segmented bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#7C5CFF', letterSpacing: '0.06em' }}>▸ XP — 4,230 / 5,000</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.6)' }}>84%</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 2,
                background: i < 17
                  ? `linear-gradient(90deg, #7C5CFF, #33D1FF)`
                  : 'rgba(26,32,53,0.8)',
                border: i >= 17 ? '1px solid rgba(42,51,82,0.7)' : 'none',
                boxShadow: i === 16 ? '0 0 8px rgba(51,209,255,0.6)' : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* Attribute bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {ATTRS.map(a => (
            <div key={a.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', color: a.color }}>{a.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.7)' }}>{a.val}<span style={{ color: 'rgba(74,90,122,0.8)' }}>/100</span></span>
              </div>
              <div style={{ height: 5, background: 'rgba(26,32,53,0.9)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  height: '100%', width: `${a.val}%`,
                  background: a.grad, borderRadius: 3,
                  boxShadow: `0 0 8px ${a.color}50`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'xp-shimmer 2.2s linear infinite',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mission list */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,1)', letterSpacing: '0.22em', marginBottom: 8 }}>MISIONES DE HOY</div>
          {MISSIONS.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 10px', borderRadius: 6, marginBottom: 4,
              background: m.done ? 'rgba(51,230,161,0.04)' : 'rgba(10,11,16,0.45)',
              border: `1px solid ${m.done ? 'rgba(51,230,161,0.15)' : 'rgba(42,51,82,0.6)'}`,
              borderLeft: `2px solid ${m.done ? '#33E6A1' : m.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                {m.done
                  ? <CheckCircle2 size={11} color="#33E6A1" style={{ flexShrink: 0 }} />
                  : <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color, flexShrink: 0, boxShadow: `0 0 5px ${m.color}` }} />
                }
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11,
                  color: m.done ? 'rgba(160,174,203,0.45)' : 'rgba(245,247,251,0.9)',
                  textDecoration: m.done ? 'line-through' : 'none',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{m.name}</span>
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 9, flexShrink: 0, marginLeft: 8,
                color: m.done ? 'rgba(74,90,122,0.8)' : m.color,
              }}>+{m.xp}</span>
            </div>
          ))}
        </div>

        {/* Rank strip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(245,196,81,0.07)',
          border: '1px solid rgba(245,196,81,0.16)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Trophy size={12} color="#F5C451" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(245,196,81,0.8)', letterSpacing: '0.12em' }}>RANKING GLOBAL</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#F5C451', textShadow: '0 0 14px rgba(245,196,81,0.45)' }}>#12</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(245,196,81,0.4)' }}>/ 2.4K</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN LANDING
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [progress, setProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovNav, setHovNav] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const isMobile = useBreakpoint(768);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const fn = () => {
      const y = window.scrollY;
      setScrollY(y);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min((y / h) * 100, 100) : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const NAV = [
    { label: 'Cómo funciona', href: '#how' },
    { label: 'Sistema', href: '#pillars' },
    { label: 'Ranking', href: '#ranking' },
  ];

  // Reusable button styles
  const btnPrimary = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: '14px 28px', borderRadius: 5,
    background: 'var(--violet)', color: '#fff',
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
    boxShadow: '0 4px 24px rgba(124,92,255,0.35)',
    transition: 'all 0.2s ease',
  };
  const btnGhost = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '13px 22px', borderRadius: 5,
    background: 'transparent', color: 'rgba(160,174,203,0.9)',
    border: '1px solid rgba(61,79,122,0.8)', cursor: 'pointer', textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  const px = isMobile ? '20px' : '48px';
  const sectionPad = isMobile ? '72px 20px' : '120px 48px';

  return (
    <div style={{ background: '#0A0B10', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─────────────── NAVBAR ─────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 62,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${px}`,
        background: scrollY > 24 ? 'rgba(10,11,16,0.94)' : 'transparent',
        backdropFilter: scrollY > 24 ? 'blur(20px) saturate(1.6)' : 'none',
        borderBottom: scrollY > 24 ? '1px solid rgba(42,51,82,0.7)' : '1px solid transparent',
        transition: 'background 0.4s, border-color 0.4s',
      }}>
        {/* Accent line top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2, pointerEvents: 'none',
          background: 'linear-gradient(90deg, #7C5CFF 0%, #33D1FF 40%, transparent 70%)',
        }} />
        {/* Scroll progress */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 1, width: `${progress}%`,
          background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
          opacity: progress > 2 ? 0.6 : 0,
          transition: 'width 0.1s linear',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={26} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.32em', color: '#F5F7FB' }}>ASCEND</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.7)', letterSpacing: '0.1em', marginTop: 2 }}>v1.0</span>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {NAV.map(({ label, href }) => (
              <a key={label} href={href}
                onMouseEnter={() => setHovNav(label)}
                onMouseLeave={() => setHovNav(null)}
                style={{
                  position: 'relative', display: 'inline-block',
                  fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
                  letterSpacing: '0.01em',
                  color: hovNav === label ? '#F5F7FB' : 'rgba(160,174,203,0.7)',
                  padding: '6px 14px', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
              >
                {label}
                <span style={{
                  position: 'absolute', bottom: 1, left: 14, right: 14, height: 1,
                  background: '#7C5CFF',
                  transform: hovNav === label ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left',
                  transition: 'transform 0.22s ease',
                }} />
              </a>
            ))}
            {user && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(42,51,82,0.8)', margin: '0 6px' }} />
                <Link to="/dashboard" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                  letterSpacing: '0.02em',
                  color: '#7C5CFF', padding: '7px 14px',
                  border: '1px solid rgba(124,92,255,0.3)',
                  borderRadius: 6, textDecoration: 'none',
                  background: 'rgba(124,92,255,0.07)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.15)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.6)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(124,92,255,0.3)'; }}
                >
                  Dashboard
                </Link>
              </>
            )}
            <div style={{ width: 1, height: 16, background: 'rgba(42,51,82,0.8)', margin: '0 6px' }} />
            {user ? (
              /* ── Profile avatar + dropdown ── */
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'transparent',
                    border: `1px solid ${dropdownOpen ? 'rgba(124,92,255,0.5)' : 'rgba(42,51,82,0.8)'}`,
                    borderRadius: 20, padding: '3px 10px 3px 3px',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)'; }}
                  onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'rgba(42,51,82,0.8)'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C5CFF, #33D1FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: '#fff',
                  }}>
                    {(user.email?.[0] ?? '?').toUpperCase()}
                  </div>
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
                    style={{ transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'none' }}>
                    <path d="M1 1L5 5L9 1" stroke="rgba(160,174,203,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 180, zIndex: 300,
                    background: '#131722', border: '1px solid rgba(42,51,82,0.9)',
                    borderRadius: 6, overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.1)',
                  }}>
                    {/* Email label */}
                    <div style={{
                      padding: '10px 14px 8px',
                      borderBottom: '1px solid rgba(42,51,82,0.7)',
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      letterSpacing: '0.1em', color: 'rgba(100,115,150,0.8)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {user.email}
                    </div>
                    {[
                      { label: 'Perfil', to: '/profile' },
                      { label: 'Configuración', to: '/settings' },
                    ].map(({ label, to }) => (
                      <Link key={to} to={to} onClick={() => setDropdownOpen(false)} style={{
                        display: 'block', padding: '10px 14px',
                        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                        letterSpacing: '0.04em', color: 'rgba(160,174,203,0.85)',
                        textDecoration: 'none', transition: 'background 0.15s, color 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,92,255,0.12)'; e.currentTarget.style.color = '#F5F7FB'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(160,174,203,0.85)'; }}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'rgba(42,51,82,0.7)', margin: '4px 0' }} />
                    <button onClick={handleSignOut} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                      letterSpacing: '0.04em', color: 'rgba(255,77,106,0.75)',
                      cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,106,0.1)'; e.currentTarget.style.color = '#FF4D6A'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,77,106,0.75)'; }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
                  letterSpacing: '0.01em',
                  color: 'rgba(160,174,203,0.75)', padding: '7px 16px',
                  border: '1px solid rgba(42,51,82,0.8)', borderRadius: 6,
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)'; e.currentTarget.style.color = '#F5F7FB'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(42,51,82,0.8)'; e.currentTarget.style.color = 'rgba(160,174,203,0.75)'; }}
                >Entrar</Link>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
                  letterSpacing: '0.01em',
                  padding: '7px 18px', borderRadius: 6,
                  background: 'var(--violet)', color: '#fff',
                  border: 'none', cursor: 'pointer', textDecoration: 'none',
                  boxShadow: '0 2px 16px rgba(124,92,255,0.3)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#8f6fff'; e.currentTarget.style.boxShadow = '0 4px 22px rgba(124,92,255,0.45)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 2px 16px rgba(124,92,255,0.3)'; }}
                >Empezar gratis</Link>
              </>
            )}
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#F5F7FB', padding: 6,
          }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, zIndex: 190,
          background: 'rgba(10,11,16,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(42,51,82,0.7)',
          padding: '20px 24px 28px',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, #7C5CFF, #33D1FF, transparent)' }} />
          {NAV.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15,
              color: 'rgba(160,174,203,0.9)', textDecoration: 'none',
              padding: '14px 0', borderBottom: '1px solid rgba(42,51,82,0.5)',
            }}>
              {label} <ChevronRight size={14} color="rgba(74,90,122,0.8)" />
            </a>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user ? (
              <>
                {/* User info row */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 5,
                  border: '1px solid rgba(42,51,82,0.7)',
                  background: 'rgba(20,24,40,0.6)', marginBottom: 4,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C5CFF, #33D1FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                    color: '#fff', flexShrink: 0,
                  }}>
                    {(user.email?.[0] ?? '?').toUpperCase()}
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10,
                    letterSpacing: '0.08em', color: 'rgba(100,115,150,0.9)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ ...btnPrimary, fontSize: 13, padding: '13px', width: '100%' }}>
                  <Zap size={13} /> Dashboard
                </Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} style={{ ...btnGhost, fontSize: 13, padding: '12px', width: '100%' }}>
                  Perfil
                </Link>
                <button onClick={() => { setMenuOpen(false); handleSignOut(); }} style={{
                  ...btnGhost, fontSize: 13, padding: '12px', width: '100%',
                  color: 'rgba(255,77,106,0.8)', borderColor: 'rgba(255,77,106,0.3)',
                  cursor: 'pointer',
                }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ ...btnPrimary, fontSize: 14, padding: '14px', width: '100%' }}>
                  Empezar gratis
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ ...btnGhost, fontSize: 13, padding: '13px', width: '100%' }}>
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          HERO — RPG EDITION
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        paddingTop: 62, overflow: 'hidden',
      }}>

        {/* ── BG: Grid ── */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(42,51,82,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.1) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          animation: 'grid-flow 24s linear infinite',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 40%, black 20%, transparent 100%)',
        }} />

        {/* ── BG: Ambient orbs ── */}
        <div style={{
          position: 'absolute', top: '10%', left: '-22%', width: 960, height: 960,
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.14) 0%, transparent 55%)',
          pointerEvents: 'none', animation: 'orb-breathe 7s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '-18%', width: 800, height: 800,
          background: 'radial-gradient(ellipse, rgba(51,209,255,0.09) 0%, transparent 55%)',
          pointerEvents: 'none', animation: 'orb-breathe 10s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', bottom: '-35%', left: '30%', width: 900, height: 900,
          background: 'radial-gradient(ellipse, rgba(245,196,81,0.04) 0%, transparent 55%)',
          pointerEvents: 'none',
        }} />

        {/* ── BG: Rising particles ── */}
        {Array.from({ length: 26 }).map((_, i) => {
          const palette = ['#7C5CFF', '#33D1FF', '#F5C451', '#33E6A1'];
          const c = palette[i % 4];
          const sz = i % 5 === 0 ? 3 : 2;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${(i * 3.7 + 2) % 95}%`,
              bottom: `${(i * 11) % 40}%`,
              width: sz, height: sz,
              borderRadius: '50%',
              background: c,
              boxShadow: `0 0 ${sz * 3}px ${c}`,
              animation: `particle-rise ${7 + (i * 0.55) % 9}s ease-in ${(i * 0.38) % 7}s infinite`,
              pointerEvents: 'none', opacity: 0, zIndex: 1,
            }} />
          );
        })}

        {/* ── BG: Horizontal scan line ── */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 1, zIndex: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,92,255,0.2) 20%, rgba(51,209,255,0.55) 50%, rgba(124,92,255,0.2) 80%, transparent 100%)',
          animation: 'hero-scan 11s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* ── Corner HUD accents ── */}
        {!isMobile && [
          { top: 80, left: 24, borderWidth: '2px 0 0 2px' },
          { top: 80, right: 24, borderWidth: '2px 2px 0 0' },
          { bottom: 24, left: 24, borderWidth: '0 0 2px 2px' },
          { bottom: 24, right: 24, borderWidth: '0 2px 2px 0' },
        ].map(({ borderWidth, ...pos }, i) => (
          <div key={i} style={{
            position: 'absolute', width: 28, height: 28,
            borderColor: 'rgba(124,92,255,0.3)', borderStyle: 'solid',
            borderWidth, pointerEvents: 'none', zIndex: 3, ...pos,
          }} />
        ))}

        {/* ── Side labels ── */}
        {!isMobile && (
          <>
            <div style={{
              position: 'absolute', left: 14, top: '50%',
              transform: 'translateY(-50%) rotate(180deg)',
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'rgba(74,90,122,0.4)', letterSpacing: '0.32em',
              writingMode: 'vertical-rl', userSelect: 'none', pointerEvents: 'none', zIndex: 3,
            }}>ASCEND OS v1.0 · SISTEMA ACTIVO</div>
            <div style={{
              position: 'absolute', right: 14, top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'rgba(74,90,122,0.4)', letterSpacing: '0.32em',
              writingMode: 'vertical-rl', userSelect: 'none', pointerEvents: 'none', zIndex: 3,
            }}>SALUD · DINERO · DISCIPLINA</div>
          </>
        )}

        {/* ── Content ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1280, margin: '0 auto', width: '100%',
          padding: isMobile ? '60px 20px 80px' : '80px 56px 80px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? 52 : 80,
          justifyContent: 'space-between',
        }}>

          {/* LEFT — Copy */}
          <div style={{ maxWidth: isMobile ? '100%' : 540, flex: '0 0 auto' }}>

            {/* Season badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '6px 16px 6px 10px',
              background: 'rgba(124,92,255,0.07)',
              border: '1px solid rgba(124,92,255,0.22)',
              borderLeft: '3px solid #7C5CFF',
              marginBottom: 36,
              animation: 'hero-fade-up 0.7s ease 0.05s both',
            }}>
              <div style={{
                width: 13, height: 13, flexShrink: 0,
                background: 'rgba(124,92,255,0.18)',
                border: '1px solid rgba(124,92,255,0.5)',
                transform: 'rotate(45deg)',
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(180,160,255,0.85)', letterSpacing: '0.22em' }}>
                TEMPORADA 01 · EN VIVO
              </span>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#33E6A1', boxShadow: '0 0 7px #33E6A1', animation: 'pulse-glow 2s infinite', flexShrink: 0 }} />
            </div>

            {/* Headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 'clamp(60px, 15vw, 84px)' : 'clamp(72px, 6.5vw, 102px)',
              lineHeight: 0.93,
              letterSpacing: '0.01em',
              marginBottom: 18,
              color: '#F5F7FB',
              animation: 'hero-fade-up 0.75s ease 0.18s both',
            }}>
              <GlitchText>DEJA DE</GlitchText>
              <br />
              <span style={{
                WebkitTextStroke: isMobile ? '1px rgba(255,255,255,0.15)' : '1.5px rgba(255,255,255,0.15)',
                color: 'transparent',
              }}>INTENTARLO.</span>
              <br />
              <span style={{
                background: 'linear-gradient(95deg, #7C5CFF 0%, #33D1FF 60%, #33E6A1 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>EJECÚTALO.</span>
            </h1>

            {/* Tick-mark divider */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              marginBottom: 24, overflow: 'hidden',
              animation: 'hero-fade-up 0.7s ease 0.3s both',
            }}>
              <div style={{ width: 32, height: 2, background: '#7C5CFF', flexShrink: 0 }} />
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  width: i % 4 === 0 ? 2 : 1,
                  height: i % 4 === 0 ? 18 : i % 2 === 0 ? 11 : 6,
                  background: i % 4 === 0 ? '#7C5CFF' : i % 2 === 0 ? 'rgba(124,92,255,0.45)' : 'rgba(124,92,255,0.2)',
                  marginLeft: 4, flexShrink: 0,
                }} />
              ))}
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(124,92,255,0.35), transparent)', marginLeft: 6 }} />
            </div>

            {/* Subheadline */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 16 : 18,
              color: 'rgba(160,174,203,0.88)',
              lineHeight: 1.72, marginBottom: 32, maxWidth: 490,
              animation: 'hero-fade-up 0.7s ease 0.38s both',
            }}>
              Completa hábitos, retos y objetivos reales para ganar XP, subir de nivel y fortalecer
              {' '}<strong style={{ color: '#F5F7FB', fontWeight: 600 }}>Salud, Dinero y Disciplina</strong>.
              No es motivación. Es un sistema que te obliga a crecer.
            </p>

            {/* RPG Attribute bars */}
            <div style={{
              display: 'flex', gap: isMobile ? 6 : 8, marginBottom: 36,
              animation: 'hero-fade-up 0.7s ease 0.48s both',
            }}>
              {[
                { label: 'SALUD',      val: 78, color: '#33E6A1', glow: 'rgba(51,230,161,0.35)',  bg: 'rgba(51,230,161,0.06)',  border: 'rgba(51,230,161,0.18)'  },
                { label: 'DINERO',     val: 62, color: '#F5C451', glow: 'rgba(245,196,81,0.35)', bg: 'rgba(245,196,81,0.06)', border: 'rgba(245,196,81,0.18)' },
                { label: 'DISCIPLINA', val: 91, color: '#7C5CFF', glow: 'rgba(124,92,255,0.35)',  bg: 'rgba(124,92,255,0.06)',  border: 'rgba(124,92,255,0.18)'  },
              ].map(a => (
                <div key={a.label} style={{
                  flex: 1, padding: '10px 12px',
                  background: a.bg,
                  border: `1px solid ${a.border}`,
                  borderBottom: `2px solid ${a.color}`,
                  clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 0 100%)',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: a.color, opacity: 0.65, letterSpacing: '0.16em', marginBottom: 6 }}>{a.label}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ flex: 1, height: 3, background: 'rgba(0,0,0,0.4)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{
                        width: `${a.val}%`, height: '100%', background: a.color,
                        boxShadow: `0 0 10px ${a.glow}`,
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
                          backgroundSize: '200% 100%',
                          animation: 'xp-shimmer 2.8s linear infinite',
                        }} />
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 21, color: a.color, lineHeight: 1, textShadow: `0 0 14px ${a.glow}` }}>{a.val}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 40,
              animation: 'hero-fade-up 0.7s ease 0.58s both',
            }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.16em', textTransform: 'uppercase',
                padding: '15px 30px',
                background: 'linear-gradient(140deg, #8B6FFF 0%, #5A3FD4 100%)',
                color: '#fff', border: 'none', cursor: 'pointer', textDecoration: 'none',
                clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
                boxShadow: '0 0 0 1px rgba(124,92,255,0.35), 0 8px 36px rgba(124,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'linear-gradient(140deg, #9A80FF 0%, #7C5CFF 100%)';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,92,255,0.6), 0 14px 52px rgba(124,92,255,0.65), inset 0 1px 0 rgba(255,255,255,0.18)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'linear-gradient(140deg, #8B6FFF 0%, #5A3FD4 100%)';
                  e.currentTarget.style.boxShadow = '0 0 0 1px rgba(124,92,255,0.35), 0 8px 36px rgba(124,92,255,0.45), inset 0 1px 0 rgba(255,255,255,0.12)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <Swords size={14} /> INICIAR ASCENSO
              </Link>
              <a href="#how" style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                padding: '14px 24px',
                background: 'transparent', color: 'rgba(51,209,255,0.75)',
                border: '1px solid rgba(51,209,255,0.22)', cursor: 'pointer', textDecoration: 'none',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(51,209,255,0.55)'; e.currentTarget.style.color = '#33D1FF'; e.currentTarget.style.background = 'rgba(51,209,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(51,209,255,0.22)'; e.currentTarget.style.color = 'rgba(51,209,255,0.75)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <Play size={12} style={{ opacity: 0.7 }} /> VER CÓMO FUNCIONA
              </a>
            </div>

            {/* Social proof — HUD border style */}
            <div style={{
              display: 'flex', flexWrap: 'wrap',
              animation: 'hero-fade-up 0.7s ease 0.68s both',
            }}>
              {[
                { n: '2.4K+', label: 'OPERADORES' },
                { n: '18K+', label: 'MISIONES' },
                { n: '62D', label: 'RACHA RÉCORD' },
              ].map(({ n, label }, i) => (
                <div key={label} style={{
                  padding: '12px 22px',
                  background: 'rgba(10,11,16,0.5)',
                  borderTop: '1px solid rgba(42,51,82,0.9)',
                  borderBottom: '1px solid rgba(42,51,82,0.9)',
                  borderLeft: i === 0 ? '1px solid rgba(42,51,82,0.9)' : '1px solid rgba(42,51,82,0.35)',
                  borderRight: i === 2 ? '1px solid rgba(42,51,82,0.9)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: '#F5F7FB', lineHeight: 1, letterSpacing: '0.01em' }}>{n}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,1)', marginTop: 5, letterSpacing: '0.22em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Mockup with orbital RPG frame */}
          <div style={{ flex: '0 0 auto', width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: 'center', position: 'relative' }}>

            {/* Orbital rings — desktop only */}
            {!isMobile && (
              <>
                {/* Outer ring */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  marginTop: -275, marginLeft: -275,
                  width: 550, height: 550,
                  border: '1px solid rgba(124,92,255,0.1)',
                  borderRadius: '50%',
                  animation: 'spin-slow 38s linear infinite',
                  pointerEvents: 'none',
                }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: 0, left: '50%', marginLeft: -1,
                      width: 2,
                      height: i % 2 === 0 ? 18 : 9,
                      background: i % 2 === 0 ? '#7C5CFF' : 'rgba(124,92,255,0.28)',
                      transformOrigin: '50% 275px',
                      transform: `rotate(${i * 45}deg)`,
                      boxShadow: i % 2 === 0 ? '0 0 8px rgba(124,92,255,0.7)' : 'none',
                    }} />
                  ))}
                </div>

                {/* Inner ring */}
                <div style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  marginTop: -245, marginLeft: -245,
                  width: 490, height: 490,
                  border: '1px solid rgba(51,209,255,0.07)',
                  borderRadius: '50%',
                  animation: 'spin-slow 24s linear infinite reverse',
                  pointerEvents: 'none',
                }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{
                      position: 'absolute',
                      top: 0, left: '50%', marginLeft: -0.5,
                      width: 1,
                      height: i % 3 === 0 ? 14 : 6,
                      background: i % 3 === 0 ? 'rgba(51,209,255,0.65)' : 'rgba(51,209,255,0.18)',
                      transformOrigin: '50% 245px',
                      transform: `rotate(${i * 30}deg)`,
                      boxShadow: i % 3 === 0 ? '0 0 5px rgba(51,209,255,0.5)' : 'none',
                    }} />
                  ))}
                </div>

                {/* Glow pool beneath mockup */}
                <div style={{
                  position: 'absolute',
                  bottom: -55, left: '50%',
                  transform: 'translateX(-50%)',
                  width: 340, height: 55,
                  background: 'radial-gradient(ellipse, rgba(124,92,255,0.5) 0%, transparent 68%)',
                  filter: 'blur(20px)',
                  animation: 'orb-breathe 3.5s ease-in-out infinite',
                  pointerEvents: 'none',
                }} />

                {/* Corner targeting brackets */}
                {[
                  { top: -14, left: -14, borderWidth: '2px 0 0 2px' },
                  { top: -14, right: -14, borderWidth: '2px 2px 0 0' },
                  { bottom: -14, left: -14, borderWidth: '0 0 2px 2px' },
                  { bottom: -14, right: -14, borderWidth: '0 2px 2px 0' },
                ].map(({ borderWidth, ...pos }, i) => (
                  <div key={i} style={{
                    position: 'absolute', width: 22, height: 22,
                    borderColor: 'rgba(124,92,255,0.55)', borderStyle: 'solid',
                    borderWidth, pointerEvents: 'none', zIndex: 10, ...pos,
                  }} />
                ))}
              </>
            )}

            {/* Floating mockup */}
            <div style={{
              animation: isMobile ? 'none' : 'float 5.5s ease-in-out infinite',
              filter: isMobile ? 'none' : 'drop-shadow(0 40px 80px rgba(124,92,255,0.32)) drop-shadow(0 0 1px rgba(124,92,255,0.4))',
              position: 'relative', zIndex: 5,
            }}>
              <ProductMockup isMobile={isMobile} />
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, transparent, #0A0B10)',
          pointerEvents: 'none',
        }} />
      </section>

      <LiveTicker />

      {/* ═══════════════════════════════════════════════════════
          CÓMO FUNCIONA
      ═══════════════════════════════════════════════════════ */}
      <Section id="how" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Eyebrow color="#33D1FF">Sistema de progreso</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5vw, 60px)',
              color: '#F5F7FB', lineHeight: 1.0, letterSpacing: '0.01em',
              marginBottom: 16,
            }}>Cuatro pasos.<br />Progreso de por vida.</h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'rgba(160,174,203,0.85)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
            }}>
              El sistema de ASCEND transforma acciones reales en progreso medible. Sin ambigüedad. Sin excusas.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: 16, position: 'relative',
          }}>
            {/* Connector line */}
            {!isMobile && (
              <div style={{
                position: 'absolute', top: 46, left: '13%', right: '13%', height: 1,
                background: 'linear-gradient(90deg, #7C5CFF33, #33D1FF55, #33D1FF33)',
                zIndex: 0,
              }} />
            )}

            {[
              {
                step: '01', icon: <Crosshair size={20} color="#33D1FF" />, color: '#33D1FF',
                title: 'Elige tus misiones',
                body: 'Configura retos diarios que encajen con tus metas: entrenamiento, ahorro, lectura, descanso o lo que elijas construir.',
              },
              {
                step: '02', icon: <CheckCircle2 size={20} color="#33E6A1" />, color: '#33E6A1',
                title: 'Ejecuta en la vida real',
                body: 'Haz la acción en el mundo real. Marca el progreso en ASCEND. El sistema lo registra y lo contabiliza sin trampa.',
              },
              {
                step: '03', icon: <Zap size={20} color="#7C5CFF" />, color: '#7C5CFF',
                title: 'Gana XP, sube de nivel',
                body: 'Cada misión completada suma XP. Cuando llegas al tope, subes de nivel. El número sube porque tú subiste primero.',
              },
              {
                step: '04', icon: <TrendingUp size={20} color="#F5C451" />, color: '#F5C451',
                title: 'Fortalece tus pilares',
                body: 'Tus acciones alimentan Salud, Dinero y Disciplina. Un perfil que muestra exactamente en qué eres fuerte y qué te falta.',
              },
            ].map(({ step, icon, color, title, body }) => (
              <div key={step} style={{
                position: 'relative', zIndex: 1,
                background: '#131722',
                border: '1px solid rgba(42,51,82,0.8)',
                borderRadius: 12, padding: '28px 24px',
                transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 20px ${color}18`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(42,51,82,0.8)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Step label */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: `${color}99`, letterSpacing: '0.22em', marginBottom: 18 }}>
                  PASO {step}
                </div>
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10, marginBottom: 18,
                  background: `${color}0F`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</div>
                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16,
                  color: '#F5F7FB', letterSpacing: '0.02em', marginBottom: 10, lineHeight: 1.3,
                }}>{title}</h3>
                {/* Body */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'rgba(160,174,203,0.8)', lineHeight: 1.65,
                }}>{body}</p>
                {/* Bottom bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${color}66, transparent)`,
                  borderRadius: '0 0 12px 12px',
                }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          PILARES
      ═══════════════════════════════════════════════════════ */}
      <Section id="pillars" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Eyebrow color="#7C5CFF">Atributos del sistema</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5vw, 60px)',
              color: '#F5F7FB', lineHeight: 1.0, letterSpacing: '0.01em',
              marginBottom: 16,
            }}>Tres pilares.<br />Un solo objetivo.</h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'rgba(160,174,203,0.85)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
            }}>
              Todo lo que haces fortalece uno de los tres atributos que miden tu progreso real.
              No rastreamos intenciones. Rastreamos acciones.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 20,
          }}>
            {[
              {
                icon: <Shield size={26} color="#33E6A1" />,
                color: '#33E6A1', bg: 'rgba(51,230,161,0.06)', border: 'rgba(51,230,161,0.16)',
                label: 'SALUD', title: 'Cuerpo en forma, mente en foco',
                val: 78, grad: 'linear-gradient(90deg, #1aad78, #33E6A1)',
                desc: 'Mide tu consistencia física y mental. Cada hábito de ejercicio, descanso, nutrición o bienestar que completes refuerza este atributo.',
                missions: ['Entrenamiento de fuerza · +150 XP', 'Dormir 8 horas · +80 XP', 'Sin procesados · +120 XP'],
                why: 'Sin energía no hay rendimiento. La salud no es una meta, es la base.',
              },
              {
                icon: <DollarSign size={26} color="#F5C451" />,
                color: '#F5C451', bg: 'rgba(245,196,81,0.06)', border: 'rgba(245,196,81,0.16)',
                label: 'DINERO', title: 'Control financiero real',
                val: 62, grad: 'linear-gradient(90deg, #c49a30, #F5C451)',
                desc: 'Registra tu educación e inteligencia financiera. Completa misiones de ahorro, inversión y control de gastos para subir este atributo.',
                missions: ['Lectura financiera 30min · +100 XP', 'Sin gastos impulsivos · +80 XP', 'Revisar inversiones · +60 XP'],
                why: 'La libertad financiera no llega por accidente. Se construye día a día.',
              },
              {
                icon: <Swords size={26} color="#7C5CFF" />,
                color: '#7C5CFF', bg: 'rgba(124,92,255,0.06)', border: 'rgba(124,92,255,0.16)',
                label: 'DISCIPLINA', title: 'Constancia sin negociaciones',
                val: 91, grad: 'linear-gradient(90deg, #5a3fd4, #7C5CFF)',
                desc: 'El atributo más difícil de subir y el que más impacto tiene en tu nivel global. Mide tu capacidad de cumplir lo que prometiste.',
                missions: ['Rutina matutina completa · +90 XP', 'Sin redes sociales 2h · +70 XP', 'Tiempo de trabajo profundo · +130 XP'],
                why: 'La disciplina no es un rasgo de personalidad. Es un músculo. Entrénalo.',
              },
            ].map(({ icon, color, bg, border, label, title, val, grad, desc, missions, why }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 14, padding: isMobile ? '28px 22px' : '36px 28px',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 24px 60px ${color}14`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Top line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />

                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12, marginBottom: 20,
                  background: `${color}12`, border: `1px solid ${color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</div>

                {/* Label */}
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: `${color}CC`, letterSpacing: '0.25em', marginBottom: 8 }}>
                  PILAR · {label}
                </div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 28,
                  color: '#F5F7FB', lineHeight: 1.1, marginBottom: 14,
                }}>{title}</h3>

                {/* Desc */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'rgba(160,174,203,0.85)', lineHeight: 1.65, marginBottom: 22,
                }}>{desc}</p>

                {/* Progress */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color, letterSpacing: '0.1em' }}>NIVEL PROMEDIO</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color, lineHeight: 1 }}>{val}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(10,11,16,0.5)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${val}%`, background: grad,
                      borderRadius: 3, boxShadow: `0 0 8px ${color}44`,
                      position: 'relative', overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)',
                        backgroundSize: '200% 100%',
                        animation: 'xp-shimmer 2.5s linear infinite',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Missions */}
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.9)', letterSpacing: '0.2em', marginBottom: 8 }}>MISIONES EJEMPLO</div>
                  {missions.map(m => (
                    <div key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 3, height: 3, borderRadius: '50%', background: color, marginTop: 6, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(160,174,203,0.75)', fontWeight: 500, lineHeight: 1.4 }}>{m}</span>
                    </div>
                  ))}
                </div>

                {/* Why */}
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: 'rgba(0,0,0,0.2)',
                  borderLeft: `2px solid ${color}60`,
                }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(160,174,203,0.65)', fontStyle: 'italic', lineHeight: 1.5 }}>{why}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          BENEFICIOS
      ═══════════════════════════════════════════════════════ */}
      <Section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 48 : 80,
            alignItems: 'center',
          }}>
            {/* Left: copy */}
            <div>
              <Eyebrow color="#33E6A1">Por qué funciona</Eyebrow>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(38px, 5vw, 58px)',
                color: '#F5F7FB', lineHeight: 1.0, letterSpacing: '0.01em',
                marginBottom: 20,
              }}>No es motivación.<br />Es arquitectura<br />de comportamiento.</h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 16,
                color: 'rgba(160,174,203,0.85)', lineHeight: 1.7, marginBottom: 36,
              }}>
                La mayoría de apps te dan inspiración por 3 días. ASCEND construye el sistema operativo de tu disciplina.
                Cuando tienes el mecanismo correcto, la motivación deja de importar.
              </p>

              <Link to="/register" style={{
                ...btnPrimary,
                background: '#33E6A1', color: '#0A0B10',
                boxShadow: '0 4px 24px rgba(51,230,161,0.3)',
                clipPath: 'none', borderRadius: 6,
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(51,230,161,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(51,230,161,0.3)'; e.currentTarget.style.transform = 'none'; }}
              >
                Construir mi sistema <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right: benefit cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  icon: <RotateCcw size={18} color="#33D1FF" />,
                  color: '#33D1FF',
                  title: 'Consistencia compuesta',
                  desc: 'El sistema de rachas hace que fallar tenga un coste real. Eso convierte cada acción en un hábito sostenible.',
                },
                {
                  icon: <BarChart3 size={18} color="#33E6A1" />,
                  color: '#33E6A1',
                  title: 'Progreso que se ve',
                  desc: 'No más "creo que estoy mejorando". Tienes XP, nivel y atributos que reflejan exactamente dónde estás y hacia dónde vas.',
                },
                {
                  icon: <Users size={18} color="#7C5CFF" />,
                  color: '#7C5CFF',
                  title: 'Accountability público',
                  desc: 'Cuando tu progreso es visible para otros, la presión de cumplir se multiplica. El ranking convierte la intención en obligación.',
                },
                {
                  icon: <Award size={18} color="#F5C451" />,
                  color: '#F5C451',
                  title: 'Recompensa inmediata',
                  desc: 'XP, niveles e insignias dan satisfacción en tiempo real. Tu cerebro aprende que el esfuerzo vale la pena. Siempre.',
                },
                {
                  icon: <Target size={18} color="#33D1FF" />,
                  color: '#33D1FF',
                  title: 'Claridad de ejecución',
                  desc: 'Cada día sabes exactamente qué hacer. Sin decisiones paralizantes. Sin dudas. Solo ejecutar las misiones que ya elegiste.',
                },
                {
                  icon: <Flame size={18} color="#FF4D6A" />,
                  color: '#FF4D6A',
                  title: 'Momentum sostenido',
                  desc: 'La mayoría abandona por pérdida de impulso. Las rachas y el ranking mantienen activo el motor semana tras semana.',
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  background: '#131722',
                  border: '1px solid rgba(42,51,82,0.8)',
                  borderRadius: 10, padding: '18px 20px',
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(42,51,82,0.8)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                    background: `${color}0E`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: '#F5F7FB', marginBottom: 5, letterSpacing: '0.02em' }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(160,174,203,0.75)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          RANKING
      ═══════════════════════════════════════════════════════ */}
      <Section id="ranking" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Header centrado */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <Eyebrow color="#F5C451">Liga de operadores</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5vw, 60px)',
              color: '#F5F7FB', lineHeight: 1.0, letterSpacing: '0.01em',
              marginBottom: 16,
            }}>El ranking no es<br />un adorno. Es un espejo.</h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 17,
              color: 'rgba(160,174,203,0.85)', maxWidth: 560, margin: '0 auto', lineHeight: 1.65,
            }}>
              Tu posición refleja con exactitud cuánto trabajaste. No hay trampa. No hay atajos.
              Solo la suma de todo lo que hiciste cuando nadie te estaba mirando.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
            gap: isMobile ? 48 : 56,
            alignItems: 'flex-start',
          }}>
            {/* Left: why it matters */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  icon: <Trophy size={18} color="#F5C451" />, color: '#F5C451',
                  title: 'Estatus que se gana',
                  desc: 'Tu posición en el ranking es puro mérito. Cada XP que ves ahí fue el resultado de una acción real, no de cuánto llevas o cuánto pagas.',
                },
                {
                  icon: <Users size={18} color="#33D1FF" />, color: '#33D1FF',
                  title: 'La liga más exigente',
                  desc: 'No compites contra bots ni estadísticas vacías. Compites contra personas reales con los mismos objetivos. Si subes, lo mereciste.',
                },
                {
                  icon: <Zap size={18} color="#7C5CFF" />, color: '#7C5CFF',
                  title: 'Presión que convierte',
                  desc: 'Ver tu nombre en la tabla y que baje una posición duele más que cualquier recordatorio de app. Eso es accountability real.',
                },
                {
                  icon: <Star size={18} color="#33E6A1" />, color: '#33E6A1',
                  title: 'Recompensas de temporada',
                  desc: 'Los mejores operadores de cada temporada desbloquean insignias legendarias, misiones únicas y reconocimiento permanente.',
                },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: `${color}0E`, border: `1px solid ${color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: '#F5F7FB', marginBottom: 5 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(160,174,203,0.75)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <Link to="/register" style={{
                  ...btnPrimary,
                  background: '#F5C451', color: '#0A0B10',
                  boxShadow: '0 4px 24px rgba(245,196,81,0.3)',
                  clipPath: 'none', borderRadius: 6,
                }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(245,196,81,0.45)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 24px rgba(245,196,81,0.3)'; e.currentTarget.style.transform = 'none'; }}
                >
                  Entrar a la liga <Trophy size={14} />
                </Link>
              </div>
            </div>

            {/* Right: ranking table */}
            <div style={{
              background: '#131722',
              border: '1px solid rgba(245,196,81,0.16)',
              borderRadius: 14, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,0.45), 0 0 40px rgba(245,196,81,0.04)',
              position: 'relative',
            }}>
              {/* Glow header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'rgba(245,196,81,0.07)',
                borderBottom: '1px solid rgba(245,196,81,0.14)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={14} color="#F5C451" />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: '#F5C451', letterSpacing: '0.12em' }}>RANKING GLOBAL · TEMPORADA I</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#33E6A1', animation: 'pulse-glow 2s infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(74,90,122,0.9)', letterSpacing: '0.1em' }}>EN VIVO</span>
                </div>
              </div>

              {/* Rank rows */}
              <div>
                {[
                  { rank: 1, name: 'ÉLITE_NOVA', level: 48, xp: '89.420', streak: 92, tier: 'LEGENDARIO', color: '#F5C451' },
                  { rank: 2, name: 'PHANTOM_X', level: 44, xp: '82.100', streak: 78, tier: 'ÉPICO', color: '#7C5CFF' },
                  { rank: 3, name: 'DARKSTAR_7', level: 42, xp: '79.650', streak: 61, tier: 'ÉPICO', color: '#7C5CFF' },
                  { rank: 4, name: 'RYUU_ALPHA', level: 38, xp: '68.200', streak: 44, tier: 'RARO', color: '#33D1FF' },
                  { rank: 5, name: 'VOID_ZERO', level: 35, xp: '59.800', streak: 31, tier: 'RARO', color: '#33D1FF' },
                  { rank: null, name: null }, // separator
                  { rank: 12, name: 'TÚ', level: 24, xp: '34.980', streak: 14, tier: 'RARO', color: '#33D1FF', isUser: true },
                ].map((row, idx) => {
                  if (row.name === null) {
                    return (
                      <div key="sep" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.5)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.7)', letterSpacing: '0.15em' }}>• • •</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.5)' }} />
                      </div>
                    );
                  }
                  const rankColor = row.rank === 1 ? '#F5C451' : row.rank === 2 ? '#C0C0C0' : row.rank === 3 ? '#CD7F32' : 'rgba(74,90,122,0.8)';
                  return (
                    <div key={row.rank} style={{
                      display: 'flex', alignItems: 'center',
                      padding: '11px 20px',
                      background: row.isUser ? 'rgba(51,209,255,0.06)' : 'transparent',
                      borderLeft: `3px solid ${row.isUser ? '#33D1FF' : 'transparent'}`,
                      borderBottom: '1px solid rgba(42,51,82,0.4)',
                      gap: 12,
                      ...(row.isUser && { marginTop: 0 }),
                    }}>
                      {/* Rank */}
                      <div style={{
                        width: 30, flexShrink: 0, textAlign: 'center',
                        fontFamily: 'var(--font-display)', fontSize: row.rank <= 3 ? 20 : 15,
                        color: rankColor,
                      }}>#{row.rank}</div>

                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                        background: `${row.color}14`, border: `1px solid ${row.color}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 13, color: row.color,
                      }}>{row.name[0]}</div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                            color: row.isUser ? '#33D1FF' : '#F5F7FB', letterSpacing: '0.03em',
                          }}>{row.name}</span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 8,
                            color: row.color, padding: '2px 6px',
                            background: `${row.color}10`, border: `1px solid ${row.color}22`,
                            borderRadius: 3, letterSpacing: '0.1em',
                          }}>{row.tier}</span>
                          {row.isUser && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(51,209,255,0.55)', letterSpacing: '0.1em' }}>← ERES TÚ</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(74,90,122,0.9)' }}>Nv {row.level}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(124,92,255,0.8)' }}>{row.xp} XP</span>
                        </div>
                      </div>

                      {/* Streak */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: '#F5C451', lineHeight: 1 }}>🔥{row.streak}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.7)', marginTop: 2 }}>DÍAS</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.25)',
                borderTop: '1px solid rgba(42,51,82,0.5)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(74,90,122,0.85)', letterSpacing: '0.06em' }}>
                  2.400+ operadores · actualizado en tiempo real
                </span>
                <Link to="/register" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                  color: '#7C5CFF', letterSpacing: '0.08em', textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9370FF'}
                  onMouseLeave={e => e.currentTarget.style.color = '#7C5CFF'}
                >
                  Ver ranking completo <ChevronRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════ */}
      <Section style={{
        padding: isMobile ? '80px 20px 100px' : '130px 48px 150px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(42,51,82,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.14) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        {/* Radial glow */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '75vw', height: '70vh', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.1) 0%, transparent 70%)',
        }} />
        {/* Corner decorators */}
        <div style={{ position: 'absolute', top: 40, left: 40, width: 40, height: 40, borderTop: '1px solid rgba(124,92,255,0.25)', borderLeft: '1px solid rgba(124,92,255,0.25)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 40, right: 40, width: 40, height: 40, borderTop: '1px solid rgba(124,92,255,0.25)', borderRight: '1px solid rgba(124,92,255,0.25)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 60, left: 40, width: 40, height: 40, borderBottom: '1px solid rgba(124,92,255,0.25)', borderLeft: '1px solid rgba(124,92,255,0.25)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 60, right: 40, width: 40, height: 40, borderBottom: '1px solid rgba(124,92,255,0.25)', borderRight: '1px solid rgba(124,92,255,0.25)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>

          <Eyebrow color="#7C5CFF">El momento es ahora</Eyebrow>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 'clamp(52px, 14vw, 76px)' : 'clamp(68px, 7.5vw, 104px)',
            lineHeight: 0.92, letterSpacing: '0.01em',
            marginBottom: 24, color: '#F5F7FB',
          }}>
            <span style={{
              background: 'linear-gradient(95deg, #7C5CFF 0%, #33D1FF 55%, #33E6A1 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>DEJA DE LEER</span>
            <br />
            <GlitchText>SOBRE ESTO.</GlitchText>
            <br />
            <span style={{ WebkitTextStroke: isMobile ? '1px rgba(255,255,255,0.2)' : '1.5px rgba(255,255,255,0.18)', color: 'transparent' }}>EMPIEZA</span>
            {' '}
            <span style={{
              background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>HOY.</span>
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: isMobile ? 16 : 18,
            color: 'rgba(160,174,203,0.85)',
            lineHeight: 1.7, marginBottom: 44,
            maxWidth: 580, margin: '0 auto 44px',
          }}>
            Miles de operadores ya están completando misiones, ganando XP y construyendo la mejor versión de sí mismos.
            {' '}<strong style={{ color: '#F5F7FB' }}>Tu progreso empieza cuando tú decides empezar.</strong>
          </p>

          {/* Main CTA */}
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <Link to="/register" style={{
              ...btnPrimary,
              fontSize: 15, padding: '16px 36px',
              boxShadow: '0 8px 36px rgba(124,92,255,0.4)',
              animation: 'breathe 3s ease-in-out infinite',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#9370FF'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(124,92,255,0.55)'; e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'; e.currentTarget.style.animation = 'none'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,92,255,0.4)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.animation = 'breathe 3s ease-in-out infinite'; }}
            >
              Empezar gratis — sin excusas <ArrowRight size={15} />
            </Link>
            <Link to="/login" style={btnGhost}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(51,209,255,0.4)'; e.currentTarget.style.color = '#33D1FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(61,79,122,0.8)'; e.currentTarget.style.color = 'rgba(160,174,203,0.9)'; }}
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Microcopy */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {['Sin tarjeta de crédito', 'Gratis para siempre', 'Progreso visible desde el día 1'].map((t, i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'rgba(42,51,82,0.8)', fontSize: 10 }}>·</span>}
                <CheckCircle2 size={11} color="rgba(51,230,161,0.6)" />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'rgba(160,174,203,0.5)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════ */}
      <footer style={{
        background: '#0D0F1A',
        borderTop: '1px solid rgba(42,51,82,0.7)',
        padding: isMobile ? '48px 20px 32px' : '64px 48px 36px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
            gap: isMobile ? 36 : 48,
            marginBottom: 48,
          }}>
            {/* Brand col */}
            <div>
              <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 16 }}>
                <LogoMark size={22} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.3em', color: '#F5F7FB' }}>ASCEND</span>
              </a>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'rgba(160,174,203,0.55)', lineHeight: 1.7, maxWidth: 260, marginBottom: 20,
              }}>
                El sistema que convierte disciplina, hábitos y metas en progreso visible y medible.
              </p>
              {/* Attribute pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  ['SALUD', '#33E6A1'],
                  ['DINERO', '#F5C451'],
                  ['DISCIPLINA', '#7C5CFF'],
                ].map(([label, color]) => (
                  <span key={label} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color, padding: '3px 8px', letterSpacing: '0.15em',
                    background: `${color}0D`, border: `1px solid ${color}22`, borderRadius: 3,
                  }}>{label}</span>
                ))}
              </div>
            </div>

            {/* Nav cols */}
            {[
              { title: 'Producto', links: ['Cómo funciona', 'Ranking', 'Misiones', 'Recompensas'] },
              { title: 'Cuenta', links: ['Registrarse', 'Iniciar sesión', 'Perfil', 'Configuración'] },
              { title: 'Legal', links: ['Términos de uso', 'Privacidad', 'Cookies'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                  color: 'rgba(245,247,251,0.8)', letterSpacing: '0.15em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}>{title}</div>
                {links.map(link => (
                  <a key={link} href="#" style={{
                    display: 'block', fontFamily: 'var(--font-body)', fontSize: 13,
                    color: 'rgba(160,174,203,0.5)', textDecoration: 'none',
                    marginBottom: 10, transition: 'color 0.2s', lineHeight: 1.4,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,174,203,0.5)'}
                  >{link}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: 20, borderTop: '1px solid rgba(42,51,82,0.5)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(74,90,122,0.7)', letterSpacing: '0.06em' }}>
              © 2026 ASCEND — Todos los derechos reservados
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#33E6A1', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(74,90,122,0.7)', letterSpacing: '0.06em' }}>
                Build <span style={{ color: '#7C5CFF' }}>v1.0.0</span> · Sistema operativo de progreso humano
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
