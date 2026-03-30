import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/api/auth';
import {
  ArrowRight, Zap, TrendingUp, Trophy,
  Menu, X, CheckCircle2, Star,
  ChevronRight, Users, Crosshair, Play
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

function useVisible(threshold = 0.07) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Section({ id, children, style, delay = 0 }) {
  const [ref, visible] = useVisible(0.06);
  return (
    <section id={id} ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(56px) scale(0.97)',
      filter: visible ? 'blur(0px)' : 'blur(10px)',
      transition: `opacity 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 1s cubic-bezier(0.22,1,0.36,1) ${delay}ms, filter 0.85s ease ${delay}ms`,
      ...style,
    }}>
      {children}
    </section>
  );
}

function StaggerItem({ index = 0, children, style }) {
  const [ref, visible] = useVisible(0.1);
  const d = index * 90;
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1) rotateX(0deg)' : 'translateY(44px) scale(0.95) rotateX(8deg)',
      filter: visible ? 'blur(0px)' : 'blur(6px)',
      transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${d}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${d}ms, filter 0.65s ease ${d}ms`,
      transformOrigin: 'top center',
      ...style,
    }}>
      {children}
    </div>
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

function Divider({ accent }) {
  return (
    <div style={{
      height: 1,
      background: accent
        ? `linear-gradient(90deg, transparent, ${accent}44, transparent)`
        : 'linear-gradient(90deg, transparent, rgba(42,51,82,0.6), transparent)',
    }} />
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
   FAQ ITEM
═══════════════════════════════════════════════════════════════ */
function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: '#0D0F1A',
        border: `1px solid ${open ? 'rgba(124,92,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 2, overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: 16,
        }}
      >
        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: '#F5F7FB', lineHeight: 1.4 }}>{question}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, transition: 'transform 0.22s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <line x1="7" y1="1" x2="7" y2="13" stroke="rgba(160,174,203,0.45)" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="1" y1="7" x2="13" y2="7" stroke="rgba(160,174,203,0.45)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div style={{ padding: '0 24px 20px', fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(160,174,203,0.72)', lineHeight: 1.75 }}>
          {answer}
        </div>
      )}
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
  const [videoReady, setVideoReady] = useState(false);
  const [heroEmail, setHeroEmail] = useState('');
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
    { label: 'Cómo Funciona', href: '#how' },
    { label: 'Misiones', href: '#missions' },
    { label: 'Recompensas', href: '#rewards' },
    { label: 'Ranking', href: '#ranking' },
  ];

  const BARLOW = "'Barlow', var(--font-ui), sans-serif";

  /* Barlow rectangular button — light fill */
  const bBtn = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: BARLOW, fontWeight: 500, fontSize: 14,
    letterSpacing: '0.04em',
    padding: '12px 26px', borderRadius: 2,
    background: '#f8f8f8', color: '#171717',
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    transition: 'background 0.18s ease, color 0.18s ease',
  };

  /* Barlow rectangular button — ghost/outline */
  const bBtnGhost = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: BARLOW, fontWeight: 500, fontSize: 14,
    letterSpacing: '0.04em',
    padding: '11px 24px', borderRadius: 2,
    background: 'transparent', color: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.28)', cursor: 'pointer', textDecoration: 'none',
    transition: 'all 0.18s ease',
  };

  /* Barlow button — dark variant for light sections */
  const bBtnDark = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    fontFamily: BARLOW, fontWeight: 500, fontSize: 14,
    letterSpacing: '0.04em',
    padding: '12px 26px', borderRadius: 2,
    background: '#f8f8f8', color: '#171717',
    border: 'none', cursor: 'pointer', textDecoration: 'none',
    transition: 'background 0.18s ease',
  };

  const px = isMobile ? '20px' : '48px';
  const sectionPad = isMobile ? '80px 20px' : '128px 48px';

  const scrolled = scrollY > 32;

  return (
    <div style={{ background: '#0A0B10', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─────────────── NAVBAR ─────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 ${px}`,
        background: scrolled ? 'rgba(10,11,16,0.94)' : 'transparent',
        backdropFilter: scrolled ? 'blur(24px) saturate(1.4)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition: 'background 0.35s ease, border-color 0.35s ease, backdrop-filter 0.35s ease',
      }}>
        {/* Scroll progress */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 1, width: `${progress}%`,
          background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
          opacity: progress > 2 ? 0.55 : 0,
          transition: 'width 0.1s linear, opacity 0.3s',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={24} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, letterSpacing: '0.32em', color: '#F5F7FB' }}>ASCEND</span>
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {NAV.map(({ label, href }) => (
              <a key={label} href={href}
                onMouseEnter={() => setHovNav(label)}
                onMouseLeave={() => setHovNav(null)}
                style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 14,
                  color: hovNav === label ? '#ffffff' : 'rgba(255,255,255,0.62)',
                  padding: '6px 14px', textDecoration: 'none', borderRadius: 4,
                  background: hovNav === label ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'color 0.18s, background 0.18s',
                }}
              >
                {label}
              </a>
            ))}

            {user && (
              <>
                <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
                <Link to="/dashboard"
                  style={{
                    fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 13,
                    color: '#F5F7FB', padding: '7px 16px', borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.4)', textDecoration: 'none',
                    background: 'rgba(255,255,255,0.12)', transition: 'all 0.18s',
                    display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.02em',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.65)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                >
                  Dashboard
                </Link>
              </>
            )}

            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />

            {user ? (
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'transparent',
                    border: `1px solid ${dropdownOpen ? 'rgba(124,92,255,0.5)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 20, padding: '3px 10px 3px 3px',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(124,92,255,0.45)'; }}
                  onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
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
                    <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 180, zIndex: 300,
                    background: '#131722', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 6, overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{
                      padding: '10px 14px 8px',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      letterSpacing: '0.1em', color: 'rgba(160,174,203,0.55)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {user.email}
                    </div>
                    {[{ label: 'Perfil', to: '/profile' }, { label: 'Configuración', to: '/settings' }].map(({ label, to }) => (
                      <Link key={to} to={to} onClick={() => setDropdownOpen(false)} style={{
                        display: 'block', padding: '10px 14px',
                        fontFamily: 'var(--font-body)', fontSize: 13,
                        color: 'rgba(160,174,203,0.85)', textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#F5F7FB'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(160,174,203,0.85)'; }}
                      >
                        {label}
                      </Link>
                    ))}
                    <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                    <button onClick={handleSignOut} style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '10px 14px', background: 'none', border: 'none',
                      fontFamily: 'var(--font-body)', fontSize: 13,
                      color: 'rgba(255,77,106,0.75)', cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,77,106,0.08)'; e.currentTarget.style.color = '#FF4D6A'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,77,106,0.75)'; }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login"
                  style={{
                    fontFamily: BARLOW, fontWeight: 500, fontSize: 13, letterSpacing: '0.04em',
                    color: 'rgba(255,255,255,0.7)', padding: '8px 18px', borderRadius: 2,
                    border: '1px solid rgba(255,255,255,0.18)', textDecoration: 'none',
                    transition: 'all 0.18s', background: 'transparent',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
                >Entrar</Link>
                <Link to="/register"
                  style={{ ...bBtn, fontSize: 13, padding: '8px 22px', marginLeft: 6 }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8f8f8'; }}
                >Comenzar</Link>
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
          position: 'fixed', top: 60, left: 0, right: 0, zIndex: 190,
          background: 'rgba(10,11,16,0.98)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 24px 28px',
        }}>
          {NAV.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: 15,
              color: 'rgba(255,255,255,0.75)', textDecoration: 'none',
              padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {label} <ChevronRight size={14} color="rgba(255,255,255,0.25)" />
            </a>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {user ? (
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 2,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', marginBottom: 4,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C5CFF, #33D1FF)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0,
                  }}>
                    {(user.email?.[0] ?? '?').toUpperCase()}
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: 'rgba(160,174,203,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                </div>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} style={{ ...bBtn, padding: '13px', width: '100%' }}>
                  <Zap size={13} /> Dashboard
                </Link>
                <button onClick={() => { setMenuOpen(false); handleSignOut(); }} style={{
                  ...bBtnGhost, padding: '12px', width: '100%',
                  color: 'rgba(255,77,106,0.8)', borderColor: 'rgba(255,77,106,0.3)',
                }}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/register" onClick={() => setMenuOpen(false)} style={{ ...bBtn, padding: '14px', width: '100%' }}>
                  Empezar gratis
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} style={{ ...bBtnGhost, padding: '13px', width: '100%' }}>
                  Ya tengo cuenta
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          HERO — FULL SCREEN VIDEO
      ═══════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: '100vh',
        minHeight: 600,
        overflow: 'hidden',
      }}>
        {/* GIF background — always visible, with parallax */}
        <img
          src="/heroAscend.gif"
          alt=""
          style={{
            position: 'absolute', left: 0, right: 0,
            top: '-12%', width: '100%', height: '124%',
            objectFit: 'cover', zIndex: 0,
            transform: `translateY(${scrollY * 0.32}px)`,
            willChange: 'transform',
          }}
        />

        {/* Video overlay — parallax matching gif, fades in once ready */}
        <video
          autoPlay
          loop
          muted
          playsInline
          onCanPlay={() => setVideoReady(true)}
          style={{
            position: 'absolute', left: 0, right: 0,
            top: '-12%', width: '100%', height: '124%',
            objectFit: 'cover', zIndex: 1,
            transform: `translateY(${scrollY * 0.32}px)`,
            willChange: 'transform',
            opacity: videoReady ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        >
          <source
            src="https://d8j0nticm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07IWA1P/hf_20260306_074215_04640ca7-042c-45d6-bb56-58b1e8a42489.mp4"
            type="video/mp4"
          />
        </video>

        {/* Top gradient for nav readability */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 140,
          background: 'linear-gradient(to bottom, rgba(10,11,16,0.55) 0%, transparent 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Bottom transition to page background */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 160,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(10,11,16,0.6) 55%, #0A0B10 100%)',
          pointerEvents: 'none', zIndex: 2,
        }} />

        {/* Content — flex column, no absolute overlap */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 3,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 60,
          paddingBottom: isMobile ? 52 : 110,
        }}>

          {/* Flex-1 zone: keeps content vertically centered in remaining space */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

          {/* Content container */}
          <div style={{
            textAlign: 'center',
            padding: isMobile ? '32px 24px' : '48px 40px',
            maxWidth: isMobile ? '96%' : 900,
            width: '100%',
          }}>
            {/* Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: isMobile ? 24 : 32, animation: 'hero-fade-up 0.6s ease 0.05s both' }}>
              <span className="hero-badge-glass">
                Tu vida. Tu aventura.
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              marginBottom: isMobile ? 20 : 28,
              animation: 'hero-fade-up 0.7s ease 0.15s both',
              textShadow: '0 4px 40px rgba(0,0,0,0.55)',
            }}>
              <span style={{
                display: 'block',
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: isMobile ? 'clamp(32px, 8vw, 52px)' : 'clamp(48px, 5.5vw, 76px)',
                lineHeight: 1.1,
                color: '#FFFFFF',
                letterSpacing: '-0.01em',
              }}>
                Transforma tu vida en
              </span>
              <span style={{
                display: 'block',
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: isMobile ? 'clamp(42px, 10vw, 66px)' : 'clamp(62px, 7vw, 98px)',
                lineHeight: 1.05,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}>
                la aventura más épica
              </span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 14 : 16,
              color: 'rgba(255,255,255,0.72)',
              lineHeight: 1.7,
              maxWidth: 500,
              margin: '0 auto 36px',
              textShadow: '0 1px 14px rgba(0,0,0,0.8)',
              animation: 'hero-fade-up 0.7s ease 0.28s both',
            }}>
              Misiones diarias. Puntos de experiencia. Rankings globales.<br />
              Tu mejor versión te espera al siguiente nivel.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap',
              animation: 'hero-fade-up 0.7s ease 0.4s both',
            }}>
              <Link
                to="/register"
                className="hero-btn-glass hero-btn-glass-primary"
              >
                Empezar Gratis
              </Link>
              <a
                href="#how"
                className="hero-btn-glass hero-btn-glass-secondary"
              >
                Ver Demo
              </a>
            </div>

            {/* Social proof */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: isMobile ? 14 : 24, flexWrap: 'wrap', marginTop: 32,
              animation: 'hero-fade-up 0.7s ease 0.55s both',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex' }}>
                  {['#7C5CFF','#33D1FF','#33E6A1','#F5C451','#FF4D6A'].map((c, i) => (
                    <div key={c} style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: `linear-gradient(135deg, ${c}, ${c}99)`,
                      border: '1.5px solid rgba(10,11,16,0.7)',
                      marginLeft: i > 0 ? -6 : 0,
                    }} />
                  ))}
                </div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                  <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>2.400+</strong> ya suben de nivel
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={10} color="#F5C451" fill="#F5C451" />)}
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginLeft: 4 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>4.9</strong> valoración
                </span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                Gratis para siempre
              </span>
            </div>
          </div>
          </div>{/* end flex-1 zone */}
        </div>

      </section>


      {/* ═══════════════════════════════════════════════════════
          CÓMO FUNCIONA
      ═══════════════════════════════════════════════════════ */}
      <Section id="how" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow color="#33D1FF">Sistema de progreso</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'clamp(40px, 5vw, 72px)',
              color: '#F5F7FB', lineHeight: 1.05, letterSpacing: '-0.01em',
              marginBottom: 14,
            }}>
              Cuatro pasos.{' '}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>Progreso de por vida.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 16,
              color: 'rgba(160,174,203,0.75)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65,
            }}>
              El sistema convierte acciones reales en progreso medible. Sin ambigüedad.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            {[
              {
                step: '01', icon: <Crosshair size={20} color="#33D1FF" />, color: '#33D1FF',
                title: 'Elige tus misiones',
                body: 'Configura retos diarios que encajen con tus metas: entrenamiento, ahorro, lectura, descanso.',
              },
              {
                step: '02', icon: <CheckCircle2 size={20} color="#33E6A1" />, color: '#33E6A1',
                title: 'Ejecuta en la vida real',
                body: 'Haz la acción en el mundo real. Marca el progreso en ASCEND. El sistema lo registra sin trampa.',
              },
              {
                step: '03', icon: <Zap size={20} color="#7C5CFF" />, color: '#7C5CFF',
                title: 'Gana XP, sube de nivel',
                body: 'Cada misión completada suma XP. Cuando llegas al tope, subes de nivel. El número sube porque tú subiste primero.',
              },
              {
                step: '04', icon: <TrendingUp size={20} color="#F5C451" />, color: '#F5C451',
                title: 'Fortalece tus pilares',
                body: 'Tus acciones alimentan Salud, Dinero y Disciplina. Un perfil que muestra exactamente en qué eres fuerte.',
              },
            ].map(({ step, icon, color, title, body }, i) => (
              <div key={step} style={{
                padding: isMobile ? '32px 24px' : '44px 32px',
                background: '#0D0F1A',
                borderRight: !isMobile && i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                borderBottom: isMobile && i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                transition: 'background 0.2s',
                position: 'relative',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111420'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0D0F1A'; }}
              >
                {/* Large watermark step number */}
                <div style={{
                  position: 'absolute', top: -8, right: 16,
                  fontFamily: 'var(--font-display)', fontSize: isMobile ? 96 : 112,
                  lineHeight: 1, color: `${color}09`,
                  userSelect: 'none', pointerEvents: 'none',
                  letterSpacing: '-0.02em',
                }}>{step}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: `${color}80`, letterSpacing: '0.24em', marginBottom: 24 }}>
                  — {step}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 2, marginBottom: 22,
                  background: `${color}0C`, border: `1px solid ${color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{icon}</div>
                <h3 style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15,
                  color: '#F5F7FB', letterSpacing: '0.02em', marginBottom: 10, lineHeight: 1.3,
                }}>{title}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'rgba(160,174,203,0.7)', lineHeight: 1.65,
                }}>{body}</p>
                {/* Bottom accent line on hover */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                  background: `linear-gradient(90deg, ${color}40, transparent)`,
                }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          MISIONES
      ═══════════════════════════════════════════════════════ */}
      <Section id="missions" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow color="#33E6A1">Catálogo de misiones</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 'clamp(40px, 5vw, 68px)',
              color: '#F5F7FB', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 14,
            }}>
              Retos reales.{' '}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>Recompensas reales.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 16,
              color: 'rgba(160,174,203,0.75)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
            }}>
              Más de 50 misiones en tres pilares. Cada acción que completas genera XP real que va directo a tu perfil.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden',
          }}>
            {[
              {
                attr: 'SALUD', color: '#33E6A1', gradient: 'linear-gradient(90deg, #1aad78, #33E6A1)',
                icon: '⚡', desc: 'Entrena tu cuerpo. Mejora tu descanso. Cuida lo que comes.',
                missions: [
                  { name: 'Entrenamiento de fuerza', xp: 150, rarityColor: '#33D1FF', rarity: 'RARA' },
                  { name: 'Cardio 30 minutos', xp: 100, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                  { name: 'Sin azúcar todo el día', xp: 200, rarityColor: '#7C5CFF', rarity: 'ÉPICA' },
                  { name: 'Dormir 8 horas', xp: 80, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                  { name: 'Meditación 10 min', xp: 120, rarityColor: '#33D1FF', rarity: 'RARA' },
                ],
              },
              {
                attr: 'DINERO', color: '#F5C451', gradient: 'linear-gradient(90deg, #c49a30, #F5C451)',
                icon: '💰', desc: 'Construye tu riqueza. Aprende finanzas. Sé dueño de tu tiempo.',
                missions: [
                  { name: 'Ahorro del día: $10+', xp: 120, rarityColor: '#33D1FF', rarity: 'RARA' },
                  { name: 'Lectura: libro de finanzas', xp: 150, rarityColor: '#33D1FF', rarity: 'RARA' },
                  { name: 'Revisar gastos mensuales', xp: 90, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                  { name: 'Inversión activa', xp: 250, rarityColor: '#7C5CFF', rarity: 'ÉPICA' },
                  { name: 'Sin compras impulsivas', xp: 110, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                ],
              },
              {
                attr: 'DISCIPLINA', color: '#7C5CFF', gradient: 'linear-gradient(90deg, #5a3fd4, #7C5CFF)',
                icon: '🎯', desc: 'Forja tu mente. Completa lo que empiezas. Domina tu voluntad.',
                missions: [
                  { name: 'Racha perfecta del día', xp: 300, rarityColor: '#F5C451', rarity: 'LEGENDARIA' },
                  { name: 'Lectura 30 min', xp: 100, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                  { name: 'Sin redes sociales 4h', xp: 180, rarityColor: '#7C5CFF', rarity: 'ÉPICA' },
                  { name: 'Planificación del día', xp: 70, rarityColor: '#8B9AB3', rarity: 'COMÚN' },
                  { name: 'Aprendizaje técnico 1h', xp: 160, rarityColor: '#33D1FF', rarity: 'RARA' },
                ],
              },
            ].map(({ attr, color, gradient, icon, desc, missions }, colIdx) => (
              <div key={attr} style={{
                background: '#0D0F1A',
                borderRight: !isMobile && colIdx < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                borderBottom: isMobile && colIdx < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                padding: isMobile ? '32px 24px' : '40px 32px',
                position: 'relative',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#111420'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#0D0F1A'; }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: gradient }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 2,
                    background: `${color}0F`, border: `1px solid ${color}28`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color, letterSpacing: '0.1em', lineHeight: 1 }}>{attr}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: `${color}70`, letterSpacing: '0.18em', marginTop: 3 }}>PILAR DE PROGRESO</div>
                  </div>
                </div>

                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(160,174,203,0.65)', lineHeight: 1.65, marginBottom: 24 }}>{desc}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {missions.map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '8px 12px', borderRadius: 4,
                      background: 'rgba(10,11,16,0.55)',
                      border: '1px solid rgba(42,51,82,0.7)',
                      borderLeft: `2px solid ${m.rarityColor}`,
                    }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, color: 'rgba(245,247,251,0.85)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: m.rarityColor, letterSpacing: '0.1em' }}>{m.rarity}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color, fontWeight: 700 }}>+{m.xp}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.28)', letterSpacing: '0.1em' }}>
                  +{missions.length * 8}+ MISIONES DISPONIBLES
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          APP SHOWCASE
      ═══════════════════════════════════════════════════════ */}
      <Section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 48 : 80,
            alignItems: 'center',
          }}>
            {/* Left copy */}
            <div>
              <Eyebrow color="#7C5CFF">La aplicación</Eyebrow>
              <h2 style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 300,
                fontSize: 'clamp(38px, 5vw, 62px)',
                color: '#F5F7FB', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 18,
              }}>
                Tu operación central{' '}
                <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>en tiempo real.</em>
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 15,
                color: 'rgba(160,174,203,0.78)', lineHeight: 1.7, marginBottom: 28,
              }}>
                Cada día arrancas con tus misiones asignadas. Las completas en el mundo real, las marcas aquí.
                Tu nivel, tus atributos y tu posición en el ranking se actualizan al momento.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                {[
                  'Dashboard con XP, nivel y rachas en vivo',
                  'Barras de atributo: Salud, Dinero, Disciplina',
                  'Misiones diarias personalizadas',
                  'Ranking global actualizado en tiempo real',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle2 size={14} color="#33E6A1" style={{ flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'rgba(160,174,203,0.82)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                style={bBtnDark}
                onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8f8f8'; }}
              >
                Abrir mi dashboard <ArrowRight size={14} />
              </Link>
            </div>

            {/* Right mockup */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              animation: isMobile ? 'none' : 'float 6s ease-in-out infinite',
            }}>
              <ProductMockup isMobile={isMobile} />
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          RECOMPENSAS
      ═══════════════════════════════════════════════════════ */}
      <Section id="rewards" style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow color="#F5C451">Sistema de recompensas</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 'clamp(40px, 5vw, 68px)',
              color: '#F5F7FB', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 14,
            }}>
              Cada logro tiene{' '}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>su trofeo.</em>
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 16,
              color: 'rgba(160,174,203,0.75)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
            }}>
              Desbloquea insignias, títulos y cosméticos únicos. Tu perfil es un récord de todo lo que has superado.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 16 : 24,
          }}>
            {/* Badge rarity showcase */}
            <div style={{
              border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, padding: isMobile ? 24 : 32,
              position: 'relative', overflow: 'hidden',
            }}>
              <video
                autoPlay muted loop playsInline
                style={{
                  position: 'absolute', inset: 0,
                  width: '100%', height: '100%',
                  objectFit: 'cover',
                  opacity: 0.18,
                  pointerEvents: 'none',
                }}
                src="/Animación_de_Runa_con_Loop_Bonito.mp4"
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,247,251,0.3)', letterSpacing: '0.22em', marginBottom: 28 }}>INSIGNIAS</div>
                {[
                  { rarity: 'COMÚN', color: '#8B9AB3', count: '12 insignias', desc: 'Para los primeros pasos del operador.' },
                  { rarity: 'RARO', color: '#33D1FF', count: '18 insignias', desc: 'Consistencia probada en los pilares.' },
                  { rarity: 'ÉPICO', color: '#7C5CFF', count: '14 insignias', desc: 'Dominio sostenido de los tres pilares.' },
                  { rarity: 'LEGENDARIO', color: '#F5C451', count: '6 insignias', desc: 'Solo para los operadores de élite.' },
                ].map(({ rarity, color, count, desc }) => (
                  <div key={rarity} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 2, flexShrink: 0,
                      background: `${color}0C`, border: `1px solid ${color}25`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}90` }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color, letterSpacing: '0.08em' }}>{rarity}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.3)' }}>{count}</span>
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'rgba(160,174,203,0.5)', lineHeight: 1.5 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column: titles + season */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{
                background: '#0D0F1A', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, padding: isMobile ? 24 : 28, flex: 1,
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,247,251,0.3)', letterSpacing: '0.22em', marginBottom: 20 }}>TÍTULOS DESBLOQUEABLES</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {[
                    { name: 'NOVATO', color: '#8B9AB3' },
                    { name: 'SOLDADO', color: '#33D1FF' },
                    { name: 'GUERRERO', color: '#33D1FF' },
                    { name: 'VETERANO', color: '#7C5CFF' },
                    { name: 'ÉLITE', color: '#7C5CFF' },
                    { name: 'LEYENDA', color: '#F5C451' },
                    { name: 'MAESTRO ASCEND', color: '#F5C451' },
                  ].map(({ name, color }) => (
                    <span key={name} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      color, padding: '5px 11px', letterSpacing: '0.14em',
                      background: `${color}0A`, border: `1px solid ${color}22`, borderRadius: 2,
                    }}>{name}</span>
                  ))}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.45)', lineHeight: 1.6, marginTop: 16 }}>
                  Los títulos se muestran en tu perfil y en el ranking global. Solo puedes ostentar uno a la vez.
                </p>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(245,196,81,0.07), rgba(10,11,16,0))',
                border: '1px solid rgba(245,196,81,0.22)', borderRadius: 2,
                padding: isMobile ? 24 : 28, position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 130, height: 130,
                  background: 'radial-gradient(circle, rgba(245,196,81,0.14) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(245,196,81,0.45)', letterSpacing: '0.22em', marginBottom: 12 }}>RECOMPENSAS DE TEMPORADA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: '#F5C451', letterSpacing: '0.06em', marginBottom: 10, lineHeight: 1 }}>
                  TEMPORADA I
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(160,174,203,0.65)', lineHeight: 1.6, marginBottom: 18 }}>
                  Los operadores del Top 100 al cierre de temporada desbloquean cosméticos legendarios exclusivos que no se vuelven a ofrecer.
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Marco Dorado', 'Fondo Épico', 'Insignia T-I'].map(reward => (
                    <span key={reward} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9,
                      color: '#F5C451', padding: '4px 10px', letterSpacing: '0.1em',
                      background: 'rgba(245,196,81,0.08)', border: '1px solid rgba(245,196,81,0.22)', borderRadius: 2,
                    }}>{reward}</span>
                  ))}
                </div>
              </div>
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
          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <Eyebrow color="#F5C451">Liga de operadores</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: 'clamp(40px, 5vw, 68px)',
              color: '#F5F7FB', lineHeight: 1.05, letterSpacing: '-0.01em', marginBottom: 14,
            }}>
              El ranking no es{' '}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>un adorno.</em>
              {' '}Es un espejo.
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 16,
              color: 'rgba(160,174,203,0.75)', maxWidth: 520, margin: '0 auto', lineHeight: 1.65,
            }}>
              Tu posición refleja cuánto trabajaste. No hay trampa.
              Solo la suma de todo lo que hiciste cuando nadie te estaba mirando.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr',
            gap: isMobile ? 48 : 56,
            alignItems: 'flex-start',
          }}>
            {/* Left */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { icon: <Trophy size={16} color="#F5C451" />, color: '#F5C451', title: 'Estatus que se gana', desc: 'Cada XP que ves ahí fue el resultado de una acción real, no de cuánto llevas o cuánto pagas.' },
                { icon: <Users size={16} color="#33D1FF" />, color: '#33D1FF', title: 'La liga más exigente', desc: 'No compites contra bots. Compites contra personas reales con los mismos objetivos. Si subes, lo mereciste.' },
                { icon: <Zap size={16} color="#7C5CFF" />, color: '#7C5CFF', title: 'Presión que convierte', desc: 'Ver tu nombre bajar una posición duele más que cualquier recordatorio. Eso es accountability real.' },
                { icon: <Star size={16} color="#33E6A1" />, color: '#33E6A1', title: 'Recompensas de temporada', desc: 'Los mejores operadores de cada temporada desbloquean insignias legendarias y misiones únicas.' },
              ].map(({ icon, color, title, desc }) => (
                <div key={title} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  padding: '18px 20px',
                  background: '#0D0F1A',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 2,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}30`; e.currentTarget.style.background = '#111420'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#0D0F1A'; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                    background: `${color}0A`, border: `1px solid ${color}1A`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{icon}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: '#F5F7FB', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.65)', lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 8 }}>
                <Link
                  to="/register"
                  style={bBtnDark}
                  onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f8f8f8'; }}
                >
                  Entrar a la liga <Trophy size={14} />
                </Link>
              </div>
            </div>

            {/* Right: ranking table */}
            <div style={{
              background: '#0D0F1A',
              border: '1px solid rgba(245,196,81,0.14)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 20px',
                background: 'rgba(245,196,81,0.05)',
                borderBottom: '1px solid rgba(245,196,81,0.1)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={13} color="#F5C451" />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: '#F5C451', letterSpacing: '0.12em' }}>RANKING GLOBAL · TEMPORADA I</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#33E6A1', animation: 'pulse-glow 2s infinite' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.45)', letterSpacing: '0.1em' }}>EN VIVO</span>
                </div>
              </div>

              {/* Rows */}
              <div>
                {[
                  { rank: 1, name: 'ÉLITE_NOVA', level: 48, xp: '89.420', streak: 92, tier: 'LEGENDARIO', color: '#F5C451' },
                  { rank: 2, name: 'PHANTOM_X', level: 44, xp: '82.100', streak: 78, tier: 'ÉPICO', color: '#7C5CFF' },
                  { rank: 3, name: 'DARKSTAR_7', level: 42, xp: '79.650', streak: 61, tier: 'ÉPICO', color: '#7C5CFF' },
                  { rank: 4, name: 'RYUU_ALPHA', level: 38, xp: '68.200', streak: 44, tier: 'RARO', color: '#33D1FF' },
                  { rank: 5, name: 'VOID_ZERO', level: 35, xp: '59.800', streak: 31, tier: 'RARO', color: '#33D1FF' },
                  { rank: null, name: null },
                  { rank: 12, name: 'TÚ', level: 24, xp: '34.980', streak: 14, tier: 'RARO', color: '#33D1FF', isUser: true },
                ].map((row) => {
                  if (row.name === null) {
                    return (
                      <div key="sep" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(160,174,203,0.3)', letterSpacing: '0.15em' }}>• • •</span>
                        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
                      </div>
                    );
                  }
                  const rankColor = row.rank === 1 ? '#F5C451' : row.rank === 2 ? '#C0C0C0' : row.rank === 3 ? '#CD7F32' : 'rgba(160,174,203,0.35)';
                  return (
                    <div key={row.rank} style={{
                      display: 'flex', alignItems: 'center',
                      padding: '11px 20px',
                      background: row.isUser ? 'rgba(51,209,255,0.04)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => { if (!row.isUser) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                      onMouseLeave={e => { if (!row.isUser) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Rank number */}
                      <div style={{ width: 36, flexShrink: 0 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: rankColor, lineHeight: 1 }}>{row.rank}</span>
                      </div>

                      {/* Avatar */}
                      <div style={{
                        width: 30, height: 30, borderRadius: '50%', flexShrink: 0, marginRight: 12,
                        background: `linear-gradient(135deg, ${row.color}40, ${row.color}15)`,
                        border: `1px solid ${row.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                        color: row.color,
                      }}>
                        {row.name[0]}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
                          <span style={{
                            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                            color: row.isUser ? '#33D1FF' : '#F5F7FB', letterSpacing: '0.02em',
                          }}>{row.name}</span>
                          <span style={{
                            fontFamily: 'var(--font-mono)', fontSize: 8,
                            color: row.color, padding: '2px 6px',
                            background: `${row.color}0C`, border: `1px solid ${row.color}20`,
                            borderRadius: 2, letterSpacing: '0.1em',
                          }}>{row.tier}</span>
                          {row.isUser && (
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(51,209,255,0.5)', letterSpacing: '0.1em' }}>← ERES TÚ</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.4)' }}>Nv {row.level}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(124,92,255,0.7)' }}>{row.xp} XP</span>
                        </div>
                      </div>

                      {/* Streak */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#F5C451', lineHeight: 1 }}>🔥{row.streak}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(160,174,203,0.3)', marginTop: 2 }}>DÍAS</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.2)',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.35)', letterSpacing: '0.06em' }}>
                  2.400+ operadores · actualizado en tiempo real
                </span>
                <Link to="/register" style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10,
                  color: 'rgba(124,92,255,0.7)', letterSpacing: '0.08em', textDecoration: 'none',
                  transition: 'color 0.18s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#9370FF'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(124,92,255,0.7)'}
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
          FAQ
      ═══════════════════════════════════════════════════════ */}
      <Section style={{ padding: sectionPad }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <Eyebrow color="#33D1FF">Preguntas frecuentes</Eyebrow>
            <h2 style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: 'clamp(38px, 5vw, 60px)',
              color: '#F5F7FB', lineHeight: 1.08, letterSpacing: '-0.01em',
            }}>
              Lo que todos{' '}
              <em style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', fontWeight: 400 }}>se preguntan.</em>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              {
                q: '¿Cómo se calculan los XP?',
                a: 'Cada misión tiene un valor fijo de XP según su rareza y dificultad. Común: 70–120 XP · Rara: 120–180 XP · Épica: 180–300 XP · Legendaria: 300+ XP. Al completar misiones también alimentas los atributos correspondientes (Salud, Dinero, Disciplina).',
              },
              {
                q: '¿Puedo elegir qué misiones hacer?',
                a: 'Sí. Cada día recibes un set de misiones asignadas de tu catálogo personalizado. Puedes configurar qué categorías quieres priorizar y el sistema adapta las misiones a tus objetivos.',
              },
              {
                q: '¿Qué pasa si no completo todas las misiones de un día?',
                a: 'Las misiones no completadas se resetean al día siguiente. Si rompes tu racha, el contador vuelve a 0. ASCEND no castiga — pero el ranking sí refleja tu consistencia real.',
              },
              {
                q: '¿Cómo sé que el ranking es justo?',
                a: 'El ranking se calcula en base al XP total, que solo se acumula completando misiones verificadas. No hay XP de compra ni formas de inflar el sistema. Si estás arriba, lo ganaste.',
              },
              {
                q: '¿Es completamente gratuito?',
                a: (
                  <div>
                    <p style={{ marginBottom: 18 }}>
                      Sí. El acceso completo a misiones, XP, ranking y recompensas es <strong style={{ color: '#F5F7FB' }}>100% gratuito</strong> y lo seguirá siendo.
                      ASCEND cree que el progreso no debería estar detrás de un paywall.
                    </p>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12,
                    }}>
                      {/* Free */}
                      <div style={{
                        padding: '14px 16px', borderRadius: 2,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(160,174,203,0.4)', letterSpacing: '0.2em', marginBottom: 10 }}>GRATUITO</div>
                        {['Misiones diarias esenciales', 'XP + niveles globales', 'Ranking y rachas', 'Insignias y títulos base'].map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: '#33E6A1', fontSize: 11, lineHeight: '18px', flexShrink: 0 }}>✓</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.65)', lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                      {/* Pro */}
                      <div style={{
                        padding: '14px 16px', borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(124,92,255,0.09), rgba(51,209,255,0.05))',
                        border: '1px solid rgba(124,92,255,0.28)',
                        position: 'relative', overflow: 'hidden',
                      }}>
                        <div style={{
                          position: 'absolute', top: 0, right: 0,
                          background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
                          padding: '3px 10px',
                          fontFamily: 'var(--font-mono)', fontSize: 8,
                          color: '#fff', letterSpacing: '0.16em',
                          borderBottomLeftRadius: 4,
                        }}>PRÓXIMO</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(124,92,255,0.7)', letterSpacing: '0.2em', marginBottom: 10 }}>PRO</div>
                        {['Catálogo extendido de misiones', 'Misiones personalizadas', 'Análisis avanzado de progreso', 'Cosméticos y recompensas exclusivos'].map(f => (
                          <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: '#7C5CFF', fontSize: 11, lineHeight: '18px', flexShrink: 0 }}>◈</span>
                            <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.65)', lineHeight: 1.5 }}>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.4)', fontStyle: 'italic' }}>
                      El modo Pro está en desarrollo. Los usuarios que se registren ahora tendrán acceso prioritario cuando llegue.
                    </p>
                  </div>
                ),
              },
            ].map(({ q, a }, i) => (
              <FAQItem key={i} question={q} answer={a} />
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ═══════════════════════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════════════════════ */}
      <Section style={{
        padding: isMobile ? '100px 20px 120px' : '140px 48px 160px',
        position: 'relative', overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* GIF background */}
        <img
          src="/prefooteranimationAscend.gif"
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            pointerEvents: 'none',
          }}
        />

        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(8,9,14,0.72)',
          pointerEvents: 'none',
        }} />

        {/* Radial color tint */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw', height: '80vh', pointerEvents: 'none',
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.1) 0%, transparent 65%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <Eyebrow color="#7C5CFF">El momento es ahora</Eyebrow>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 'clamp(56px, 14vw, 80px)' : 'clamp(72px, 8vw, 112px)',
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
            <span style={{ WebkitTextStroke: isMobile ? '1px rgba(255,255,255,0.2)' : '1.5px rgba(255,255,255,0.18)', color: 'transparent' }}>EMPIEZA </span>
            <span style={{
              background: 'linear-gradient(90deg, #7C5CFF, #33D1FF)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>HOY.</span>
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: isMobile ? 15 : 17,
            color: 'rgba(160,174,203,0.78)',
            lineHeight: 1.7, marginBottom: 44,
            maxWidth: 540, margin: '0 auto 44px',
          }}>
            Miles de operadores ya completan misiones y construyen la mejor versión de sí mismos.
            {' '}<strong style={{ color: '#F5F7FB' }}>Tu progreso empieza cuando tú decides empezar.</strong>
          </p>

          {/* Email form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              navigate(`/register${heroEmail ? `?email=${encodeURIComponent(heroEmail)}` : ''}`);
            }}
            style={{
              display: 'flex', gap: 8,
              justifyContent: 'center', flexWrap: 'wrap',
              marginBottom: 16, maxWidth: 560, margin: '0 auto 16px',
            }}
          >
            <input
              type="email"
              value={heroEmail}
              onChange={e => setHeroEmail(e.target.value)}
              placeholder="tu@email.com"
              style={{
                fontFamily: 'var(--font-body)', fontSize: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 2, padding: '14px 18px',
                color: '#F5F7FB', outline: 'none',
                flex: isMobile ? '1 1 100%' : '1 1 240px',
                transition: 'border-color 0.18s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,92,255,0.65)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
            <button
              type="submit"
              style={{ ...bBtnDark, fontSize: 14, padding: '14px 28px', animation: 'breathe 3s ease-in-out infinite', flex: isMobile ? '1 1 100%' : 'none' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.animationPlayState = 'paused'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8f8f8'; e.currentTarget.style.animationPlayState = 'running'; }}
            >
              Empezar gratis <ArrowRight size={14} />
            </button>
          </form>
          <div style={{ marginBottom: 28 }}>
            <Link
              to="/login"
              style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(160,174,203,0.45)', textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.8)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,174,203,0.45)'}
            >
              Ya tengo cuenta →
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {['Sin tarjeta de crédito', 'Gratis para siempre', 'Progreso visible desde el día 1'].map((t, i) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 10 }}>·</span>}
                <CheckCircle2 size={11} color="rgba(51,230,161,0.55)" />
                <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.45)', fontWeight: 400 }}>{t}</span>
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
        borderTop: '1px solid rgba(255,255,255,0.05)',
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
                color: 'rgba(160,174,203,0.45)', lineHeight: 1.7, maxWidth: 260, marginBottom: 20,
              }}>
                El sistema que convierte disciplina, hábitos y metas en progreso visible y medible.
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['SALUD', '#33E6A1'], ['DINERO', '#F5C451'], ['DISCIPLINA', '#7C5CFF']].map(([label, color]) => (
                  <span key={label} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color, padding: '3px 8px', letterSpacing: '0.15em',
                    background: `${color}08`, border: `1px solid ${color}18`, borderRadius: 2,
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
                  fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10,
                  color: 'rgba(245,247,251,0.5)', letterSpacing: '0.2em',
                  textTransform: 'uppercase', marginBottom: 16,
                }}>{title}</div>
                {links.map(link => (
                  <a key={link} href="#" style={{
                    display: 'block', fontFamily: 'var(--font-body)', fontSize: 13,
                    color: 'rgba(160,174,203,0.4)', textDecoration: 'none',
                    marginBottom: 10, transition: 'color 0.18s', lineHeight: 1.4,
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.85)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(160,174,203,0.4)'}
                  >{link}</a>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(160,174,203,0.25)', letterSpacing: '0.06em' }}>
              © 2026 ASCEND — Todos los derechos reservados
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#33E6A1', animation: 'pulse-glow 2s infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'rgba(160,174,203,0.25)', letterSpacing: '0.06em' }}>
                Build <span style={{ color: 'rgba(124,92,255,0.6)' }}>v1.0.0</span> · Sistema operativo de progreso humano
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
