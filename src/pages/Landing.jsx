import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Zap, TrendingUp, Target, Trophy, Shield,
  DollarSign, Menu, X, CheckCircle2, Flame, Star,
  ChevronRight, Activity, BarChart3, Swords,
  Award, Users, RotateCcw, Crosshair
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   GLITCH TEXT — Aberración cromática sobre cualquier texto
───────────────────────────────────────────────────────────────── */
function GlitchText({ children, style, as: Tag = 'span' }) {
  return (
    <Tag style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        color: '#33D1FF', mixBlendMode: 'screen',
        animation: 'chromatic-1 9s ease-in-out infinite',
        userSelect: 'none', zIndex: 2,
      }}>{children}</span>
      <span aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        color: '#FF4D6A', mixBlendMode: 'screen',
        animation: 'chromatic-2 9s ease-in-out infinite',
        userSelect: 'none', zIndex: 2,
      }}>{children}</span>
    </Tag>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TICKER — Banda de datos en tiempo real
───────────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  '🔥 DARKSTAR completó Entrenamiento de Fuerza · +150 XP',
  '⚡ RYUU_ALPHA alcanzó el Nivel 29',
  '💰 NOVA_PRIME supera los 58.000 XP acumulados',
  '🏆 RACHA RÉCORD: 62 días sin fallo',
  '👤 +2.400 personas ya están compitiendo',
  '⚔ Misión legendaria: Mes sin azúcar · +800 XP completada',
  '📈 ÉLITE_X cierra el mes en el Top 3 Global',
  '✅ SALUD · DINERO · DISCIPLINA — El sistema que no falla',
];

function DataTicker() {
  const text = TICKER_ITEMS.join('   ·   ') + '   ·   ';
  return (
    <div style={{
      overflow: 'hidden', whiteSpace: 'nowrap',
      background: 'rgba(124,92,255,0.06)',
      borderTop: '1px solid rgba(124,92,255,0.2)',
      borderBottom: '1px solid rgba(124,92,255,0.2)',
      padding: '10px 0',
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'ticker-scroll 40s linear infinite',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.1em',
        color: 'var(--text-secondary)',
      }}>
        {text.repeat(6)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   BREAKPOINT HOOK
───────────────────────────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────────────────────────
   DASHBOARD MOCKUP — UI de producto más realista
───────────────────────────────────────────────────────────────── */
function DashboardMockup({ isMobile }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid rgba(124,92,255,0.25)',
      borderRadius: 16,
      overflow: 'hidden',
      width: '100%',
      maxWidth: isMobile ? '100%' : 440,
      boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,255,0.1), 0 0 60px rgba(124,92,255,0.06)',
      transform: isMobile ? 'none' : 'perspective(900px) rotateY(-5deg) rotateX(2deg)',
      position: 'relative',
    }}>
      {/* Scan sweep */}
      <div style={{
        position: 'absolute', left: 0, right: 0,
        height: 1.5,
        background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.7), transparent)',
        animation: 'scan-sweep 4s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 10,
      }} />

      {/* Corner HUD brackets */}
      {[
        { top: 8, left: 8, borderWidth: '2px 0 0 2px' },
        { top: 8, right: 8, borderWidth: '2px 2px 0 0' },
        { bottom: 8, left: 8, borderWidth: '0 0 2px 2px' },
        { bottom: 8, right: 8, borderWidth: '0 2px 2px 0' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', width: 12, height: 12,
          borderColor: 'rgba(124,92,255,0.5)',
          borderStyle: 'solid', ...pos, pointerEvents: 'none', zIndex: 5,
        }} />
      ))}

      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px',
        background: 'rgba(10,11,16,0.6)',
        borderBottom: '1px solid rgba(42,51,82,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.15em' }}>ASCEND OS · EN LÍNEA</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>OPERADOR: DARKSTAR</span>
      </div>

      {/* Main content */}
      <div style={{ padding: '16px 18px' }}>

        {/* Level + Streak */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.2em', marginBottom: 2 }}>NIVEL GLOBAL</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 64, color: 'var(--text)',
              lineHeight: 1, textShadow: '0 0 40px rgba(124,92,255,0.5)',
            }}>24</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 4 }}>RACHA ACTIVA</div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--gold)',
              lineHeight: 1, textShadow: '0 0 20px rgba(245,196,81,0.5)',
              animation: 'streak-pulse 2.5s ease-in-out infinite',
            }}>🔥 14</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--gold)', opacity: 0.6, marginTop: 3 }}>DÍAS SIN FALLO</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--violet)' }}>XP ▸ 4,230 / 5,000</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>84%</span>
          </div>
          <div style={{ display: 'flex', gap: 2 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 6, borderRadius: 2,
                background: i < 17 ? 'linear-gradient(90deg, var(--violet), var(--cyan))' : 'var(--surface)',
                border: i >= 17 ? '1px solid var(--border)' : 'none',
                boxShadow: i < 17 && i >= 15 ? '0 0 6px rgba(51,209,255,0.5)' : 'none',
              }} />
            ))}
          </div>
        </div>

        {/* Attribute bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {[
            { label: 'SALUD', val: 78, color: 'var(--green)', grad: 'linear-gradient(90deg, #1fad78, var(--green))' },
            { label: 'DINERO', val: 62, color: 'var(--gold)', grad: 'linear-gradient(90deg, #c49a30, var(--gold))' },
            { label: 'DISCIPLINA', val: 91, color: 'var(--violet)', grad: 'linear-gradient(90deg, #5a3fd4, var(--violet))' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: s.color }}>{s.label}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-secondary)' }}>{s.val}/100</span>
              </div>
              <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${s.val}%`,
                  background: s.grad,
                  borderRadius: 3,
                  boxShadow: `0 0 8px ${s.color}55`,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'xp-shimmer 2s linear infinite',
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Daily missions */}
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)',
            letterSpacing: '0.2em', marginBottom: 7, textTransform: 'uppercase'
          }}>MISIONES DE HOY</div>
          {[
            { name: 'Entrenamiento de fuerza', xp: 150, color: 'var(--cyan)', done: false, badge: 'RARA' },
            { name: 'Lectura 30 min · Inversiones', xp: 100, color: 'var(--rarity-common)', done: true, badge: 'COMÚN' },
            { name: 'Sin azúcar todo el día', xp: 200, color: 'var(--violet)', done: false, badge: 'ÉPICA' },
          ].map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '7px 10px', borderRadius: 6, marginBottom: 4,
              background: m.done ? 'rgba(51,230,161,0.04)' : 'rgba(10,11,16,0.5)',
              border: `1px solid ${m.done ? 'rgba(51,230,161,0.18)' : 'rgba(42,51,82,0.6)'}`,
              borderLeft: `2px solid ${m.done ? 'var(--green)' : m.color}`,
            }}>
              <span style={{
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11,
                color: m.done ? 'var(--text-muted)' : 'var(--text)',
                textDecoration: m.done ? 'line-through' : 'none',
              }}>
                {m.done ? '✓ ' : ''}{m.name}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: m.done ? 'var(--text-muted)' : m.color }}>+{m.xp} XP</span>
            </div>
          ))}
        </div>

        {/* Rank badge */}
        <div style={{
          marginTop: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px',
          background: 'rgba(245,196,81,0.06)',
          border: '1px solid rgba(245,196,81,0.18)',
          borderRadius: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <Trophy size={13} color="var(--gold)" />
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--gold)' }}>RANKING GLOBAL</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--gold)', textShadow: '0 0 12px rgba(245,196,81,0.4)' }}>#12</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION WRAPPER — con reveal-on-scroll
───────────────────────────────────────────────────────────────── */
function Section({ id, children, style }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <section id={id} ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: 'opacity 0.7s ease, transform 0.7s ease',
      ...style,
    }}>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION HEADER — label + título
───────────────────────────────────────────────────────────────── */
function SectionHeader({ label, title, subtitle, accent = 'var(--violet)', align = 'center' }) {
  return (
    <div style={{ textAlign: align, marginBottom: 56 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.25em', color: accent,
        textTransform: 'uppercase', marginBottom: 16,
      }}>
        <div style={{ width: 20, height: 1, background: accent, opacity: 0.6 }} />
        {label}
        <div style={{ width: 20, height: 1, background: accent, opacity: 0.6 }} />
      </div>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(36px, 5vw, 58px)',
        color: 'var(--text)',
        lineHeight: 1.05,
        letterSpacing: '0.02em',
        marginBottom: subtitle ? 16 : 0,
      }}>{title}</h2>
      {subtitle && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 17,
          color: 'var(--text-secondary)',
          maxWidth: 580,
          margin: align === 'center' ? '0 auto' : 0,
          lineHeight: 1.65,
        }}>{subtitle}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DIVIDER LINE
───────────────────────────────────────────────────────────────── */
function Divider({ color = 'var(--border)' }) {
  return (
    <div style={{
      height: 1,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      margin: '0 auto',
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────────
   LOGO ICON
───────────────────────────────────────────────────────────────── */
function LogoIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="lgA" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#33D1FF" />
        </linearGradient>
        <linearGradient id="lgB" x1="9" y1="10" x2="19" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#33D1FF" />
          <stop offset="100%" stopColor="#7C5CFF" />
        </linearGradient>
      </defs>
      <polygon points="14,2 26,14 14,26 2,14" stroke="url(#lgA)" strokeWidth="1.5" fill="rgba(124,92,255,0.08)" />
      <polyline points="9,17 14,10 19,17" stroke="url(#lgB)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="10" x2="14" y2="20" stroke="url(#lgB)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN LANDING COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const isMobile = useBreakpoint(768);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docH > 0 ? Math.min((y / docH) * 100, 100) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { label: 'Cómo funciona', href: '#how-it-works' },
    { label: 'Pilares', href: '#pillars' },
    { label: 'Ranking', href: '#ranking' },
  ];

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-ui)', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    cursor: 'pointer', border: 'none', textDecoration: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─────────────────────── NAVBAR ────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '0 20px' : '0 48px',
        height: 64,
        background: scrollY > 30 ? 'rgba(10,11,16,0.92)' : 'transparent',
        backdropFilter: scrollY > 30 ? 'blur(24px) saturate(1.5)' : 'none',
        borderBottom: scrollY > 30 ? '1px solid rgba(42,51,82,0.7)' : '1px solid transparent',
        transition: 'background 0.4s ease, border-color 0.4s ease',
      }}>
        {/* Top accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2, pointerEvents: 'none',
          background: 'linear-gradient(90deg, var(--violet) 0%, var(--cyan) 45%, transparent 75%)',
        }} />
        {/* Scroll progress */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0,
          height: 1, width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
          transition: 'width 0.1s linear', pointerEvents: 'none',
          opacity: scrollProgress > 2 ? 0.7 : 0,
        }} />

        {/* Logo */}
        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoIcon size={26} />
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 21,
            letterSpacing: '0.3em', color: 'var(--text)',
          }}>ASCEND</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', opacity: 0.45, letterSpacing: '0.1em' }}>v1.0</span>
        </a>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Online dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 20, paddingRight: 20, borderRight: '1px solid var(--border)' }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.18em', color: 'var(--green)' }}>EN LÍNEA</span>
            </div>

            {navItems.map(({ label, href }) => (
              <a key={label} href={href}
                onMouseEnter={() => setHoveredNav(label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: hoveredNav === label ? 'var(--text)' : 'var(--text-muted)',
                  padding: '6px 14px', textDecoration: 'none',
                  transition: 'color 0.2s',
                  position: 'relative',
                }}
              >
                {label}
                <span style={{
                  position: 'absolute', bottom: 2, left: 14, right: 14, height: 1,
                  background: 'var(--violet)',
                  opacity: hoveredNav === label ? 0.8 : 0,
                  transition: 'opacity 0.2s',
                }} />
              </a>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

            <Link to="/login" style={{
              ...btnBase, fontSize: 12, padding: '8px 18px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-bright)', borderRadius: 4,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Iniciar sesión
            </Link>

            <Link to="/register" style={{
              ...btnBase, fontSize: 12, padding: '9px 22px',
              background: 'var(--violet)', color: 'white',
              borderRadius: 4,
              clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)',
              boxShadow: '0 4px 20px var(--violet-glow)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#8B6FFF'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,92,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--violet-glow)'; }}
            >
              Empezar gratis <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 6,
          }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </nav>

      {/* Mobile drawer */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 190,
          background: 'rgba(10,11,16,0.97)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px 28px',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--violet), var(--cyan), transparent)' }} />
          {navItems.map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 16,
              color: 'var(--text-secondary)', textDecoration: 'none',
              padding: '14px 0', borderBottom: '1px solid var(--border)',
            }}>
              {label} <ChevronRight size={14} color="var(--text-muted)" />
            </a>
          ))}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link to="/register" onClick={() => setMenuOpen(false)} style={{
              ...btnBase, fontSize: 14, padding: '14px 24px', justifyContent: 'center',
              background: 'var(--violet)', color: 'white', borderRadius: 6,
              boxShadow: '0 4px 20px var(--violet-glow)',
            }}>
              Empezar gratis
            </Link>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{
              ...btnBase, fontSize: 14, padding: '13px 24px', justifyContent: 'center',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-bright)', borderRadius: 6,
            }}>
              Iniciar sesión
            </Link>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: 64, overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(42,51,82,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.22) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          animation: 'grid-flow 10s linear infinite',
          pointerEvents: 'none',
        }} />

        {/* Radial glow center */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70vw', height: '70vh',
          background: 'radial-gradient(ellipse at center, rgba(124,92,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: '20%', left: '-5%',
          width: 500, height: 500,
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* Glow right */}
        <div style={{
          position: 'absolute', top: '30%', right: '-10%',
          width: 500, height: 500,
          background: 'radial-gradient(ellipse, rgba(51,209,255,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1280, margin: '0 auto',
          padding: isMobile ? '60px 24px 60px' : '80px 48px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 48 : 64,
          flexDirection: isMobile ? 'column' : 'row',
          width: '100%',
        }}>

          {/* ── LEFT: copy ── */}
          <div style={{ flex: '0 0 auto', maxWidth: isMobile ? '100%' : 540 }}>

            {/* Trust badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px',
              background: 'rgba(51,230,161,0.08)',
              border: '1px solid rgba(51,230,161,0.22)',
              borderRadius: 20,
              marginBottom: 28,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--green)', letterSpacing: '0.08em' }}>
                +2.400 personas ya están ascendiendo
              </span>
            </div>

            {/* Hero headline */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: isMobile ? 'clamp(56px, 14vw, 80px)' : 'clamp(64px, 6vw, 96px)',
              color: 'var(--text)',
              lineHeight: 0.95,
              letterSpacing: '0.01em',
              marginBottom: 10,
            }}>
              <GlitchText>TU MEJOR</GlitchText>
              <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.18)' }}>VERSIÓN</span>
              <br />
              <span style={{
                background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>SE GANA.</span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: isMobile ? 17 : 19,
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: 12,
              maxWidth: 480,
            }}>
              ASCEND convierte tus hábitos, retos y objetivos diarios en
              <strong style={{ color: 'var(--text)', fontWeight: 600 }}> XP, niveles y progreso real</strong>.
              Fortalece tu Salud, Dinero y Disciplina — y compite por escalar el ranking.
            </p>

            {/* Value prop pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 36 }}>
              {[
                { icon: <Activity size={11} />, text: 'Hábitos que se miden', color: 'var(--green)' },
                { icon: <Zap size={11} />, text: 'XP real por acciones reales', color: 'var(--violet)' },
                { icon: <Trophy size={11} />, text: 'Ranking competitivo', color: 'var(--gold)' },
              ].map(({ icon, text, color }) => (
                <div key={text} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px',
                  background: 'var(--surface)',
                  border: `1px solid rgba(${color === 'var(--green)' ? '51,230,161' : color === 'var(--gold)' ? '245,196,81' : '124,92,255'},0.2)`,
                  borderRadius: 20,
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11,
                  color,
                  letterSpacing: '0.05em',
                }}>
                  {icon} {text}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                ...btnBase, fontSize: 14, padding: '14px 28px',
                background: 'var(--violet)', color: 'white',
                borderRadius: 6,
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                boxShadow: '0 6px 28px var(--violet-glow)',
                minWidth: 180, justifyContent: 'center',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#9370FF'; e.currentTarget.style.boxShadow = '0 8px 36px rgba(124,92,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 6px 28px var(--violet-glow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                Empezar gratis <ArrowRight size={14} />
              </Link>

              <a href="#how-it-works" style={{
                ...btnBase, fontSize: 13, padding: '13px 22px',
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border-bright)', borderRadius: 6,
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                Ver cómo funciona
              </a>
            </div>

            {/* Social proof stats */}
            <div style={{
              display: 'flex', gap: 28, marginTop: 40,
              paddingTop: 32, borderTop: '1px solid var(--border)',
            }}>
              {[
                { value: '2.4K+', label: 'Operadores activos' },
                { value: '18K+', label: 'Misiones completadas' },
                { value: '62', label: 'Días de racha récord' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text)', lineHeight: 1, letterSpacing: '0.02em' }}>{value}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.05em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: mockup ── */}
          <div style={{ flex: '0 0 auto', width: isMobile ? '100%' : 'auto', display: 'flex', justifyContent: 'center' }}>
            <DashboardMockup isMobile={isMobile} />
          </div>
        </div>

        {/* Bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
          background: 'linear-gradient(to bottom, transparent, var(--void))',
          pointerEvents: 'none',
        }} />
      </section>

      {/* Data ticker */}
      <DataTicker />

      {/* ══════════════════════════════════════════════════════════
          CÓMO FUNCIONA — 4 pasos
      ══════════════════════════════════════════════════════════ */}
      <Section id="how-it-works" style={{ padding: isMobile ? '80px 24px' : '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader
            label="Sistema de progreso"
            title="Cómo funciona ASCEND"
            subtitle="Cuatro pasos para transformar acciones cotidianas en progreso medible."
            accent="var(--cyan)"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 20 : 24,
            position: 'relative',
          }}>
            {/* Connecting line (desktop) */}
            {!isMobile && (
              <div style={{
                position: 'absolute',
                top: 44, left: '12.5%', right: '12.5%',
                height: 1,
                background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                opacity: 0.25,
                zIndex: 0,
              }} />
            )}

            {[
              {
                step: '01', icon: <Crosshair size={22} color="var(--cyan)" />,
                title: 'Elige tus misiones',
                desc: 'Selecciona retos diarios alineados a tus metas: entrenar, ahorrar, leer, descansar o cualquier hábito que quieras construir.',
                color: 'var(--cyan)',
              },
              {
                step: '02', icon: <CheckCircle2 size={22} color="var(--green)" />,
                title: 'Completa acciones reales',
                desc: 'Ejecuta la misión en la vida real. Marca el progreso dentro de ASCEND para que el sistema lo registre y lo contabilice.',
                color: 'var(--green)',
              },
              {
                step: '03', icon: <Zap size={22} color="var(--violet)" />,
                title: 'Gana XP y sube de nivel',
                desc: 'Cada misión completa suma XP. Acumula suficiente y subes de nivel, desbloqueas insignias y avanzas en el ranking global.',
                color: 'var(--violet)',
              },
              {
                step: '04', icon: <TrendingUp size={22} color="var(--gold)" />,
                title: 'Fortalece tus tres pilares',
                desc: 'Tus acciones alimentan los atributos de Salud, Dinero y Disciplina — un perfil que refleja tu progreso real, no solo tus intenciones.',
                color: 'var(--gold)',
              },
            ].map(({ step, icon, title, desc, color }, idx) => (
              <div key={step} style={{
                position: 'relative', zIndex: 1,
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: isMobile ? '24px 20px' : '28px 24px',
                transition: 'border-color 0.25s, transform 0.25s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Step number */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)',
                  letterSpacing: '0.2em', marginBottom: 16,
                }}>PASO {step}</div>

                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  {icon}
                </div>

                <h3 style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700,
                  fontSize: 16, color: 'var(--text)',
                  letterSpacing: '0.03em', marginBottom: 10,
                }}>{title}</h3>

                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--text-secondary)', lineHeight: 1.65,
                }}>{desc}</p>

                {/* Bottom accent line */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 24, right: 24, height: 2,
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                  borderRadius: '0 0 12px 12px',
                  opacity: 0.5,
                }} />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════
          PILARES — Salud, Dinero, Disciplina
      ══════════════════════════════════════════════════════════ */}
      <Section id="pillars" style={{ padding: isMobile ? '80px 24px' : '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader
            label="Sistema de atributos"
            title="Tres pilares. Un solo sistema."
            subtitle="Todo lo que haces en ASCEND fortalece uno de los tres atributos que definen tu progreso real."
            accent="var(--violet)"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 24,
          }}>
            {[
              {
                icon: <Shield size={28} color="var(--green)" />,
                label: 'SALUD',
                title: 'Cuerpo y mente en forma',
                color: 'var(--green)',
                bg: 'rgba(51,230,161,0.06)',
                border: 'rgba(51,230,161,0.18)',
                val: 78,
                grad: 'linear-gradient(90deg, #1fad78, var(--green))',
                missions: ['Entrenamiento de fuerza', 'Dormir 8 horas', 'Meditación diaria', 'Sin procesados'],
                desc: 'Mide tu consistencia física y mental. Cada hábito de ejercicio, descanso o nutrición que completes suma puntos de Salud.',
                why: 'Porque sin energía no hay progreso. La base de todo lo demás.',
              },
              {
                icon: <DollarSign size={28} color="var(--gold)" />,
                label: 'DINERO',
                title: 'Libertad financiera',
                color: 'var(--gold)',
                bg: 'rgba(245,196,81,0.06)',
                border: 'rgba(245,196,81,0.18)',
                val: 62,
                grad: 'linear-gradient(90deg, #c49a30, var(--gold))',
                missions: ['Lectura financiera', 'Sin gastos innecesarios', 'Ahorro programado', 'Revisar inversiones'],
                desc: 'Registra tu educación y disciplina financiera. Completa misiones de ahorro, inversión y control de gastos.',
                why: 'Porque la libertad financiera se construye con hábitos, no con suerte.',
              },
              {
                icon: <Swords size={28} color="var(--violet)" />,
                label: 'DISCIPLINA',
                title: 'Constancia sin excusas',
                color: 'var(--violet)',
                bg: 'rgba(124,92,255,0.06)',
                border: 'rgba(124,92,255,0.18)',
                val: 91,
                grad: 'linear-gradient(90deg, #5a3fd4, var(--violet))',
                missions: ['Respetar el horario', 'Sin redes sociales 2h', 'Lectura profunda', 'Rutina matutina'],
                desc: 'El atributo más difícil de subir y el que más impacta tu nivel global. Mide tu capacidad de hacer lo que prometiste.',
                why: 'Porque la disciplina es el puente entre tus metas y tus resultados.',
              },
            ].map(({ icon, label, title, color, bg, border, val, grad, missions, desc, why }) => (
              <div key={label} style={{
                background: bg, border: `1px solid ${border}`,
                borderRadius: 14, padding: isMobile ? '24px 20px' : '32px 28px',
                position: 'relative', overflow: 'hidden',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${color}18`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Top glow bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, ${color}, transparent)`,
                }} />

                {/* Icon */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `${color}14`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  {icon}
                </div>

                {/* Label */}
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color, letterSpacing: '0.25em', marginBottom: 6,
                }}>PILAR · {label}</div>

                {/* Title */}
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 28,
                  color: 'var(--text)', lineHeight: 1.1, marginBottom: 14,
                }}>{title}</h3>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: 14,
                  color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 20,
                }}>{desc}</p>

                {/* Progress bar */}
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color, letterSpacing: '0.08em' }}>NIVEL PROMEDIO</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>{val}/100</span>
                  </div>
                  <div style={{ height: 7, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${val}%`,
                      background: grad, borderRadius: 4,
                      boxShadow: `0 0 10px ${color}44`,
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'xp-shimmer 2.5s linear infinite',
                      }} />
                    </div>
                  </div>
                </div>

                {/* Mission samples */}
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.18em', marginBottom: 8 }}>MISIONES EJEMPLO</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {missions.slice(0, 3).map(m => (
                      <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Why */}
                <div style={{
                  marginTop: 20, padding: '10px 14px',
                  background: 'rgba(0,0,0,0.2)', borderRadius: 8,
                  borderLeft: `2px solid ${color}`,
                }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>{why}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════
          BENEFICIOS REALES
      ══════════════════════════════════════════════════════════ */}
      <Section style={{ padding: isMobile ? '80px 24px' : '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionHeader
            label="Por qué funciona"
            title="Resultados reales, no solo motivación"
            subtitle="ASCEND no es otra app de productividad. Es un sistema de accountability que transforma la disciplina en hábito."
            accent="var(--green)"
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {[
              { icon: <RotateCcw size={20} color="var(--cyan)" />, title: 'Consistencia compuesta', desc: 'El sistema de rachas hace que fallar tenga un coste real. Eso convierte la acción diaria en un hábito automático.', color: 'var(--cyan)' },
              { icon: <BarChart3 size={20} color="var(--green)" />, title: 'Progreso visible', desc: 'No más "creo que estoy mejorando". Tienes números, barras y nivel que reflejan exactamente dónde estás.', color: 'var(--green)' },
              { icon: <Users size={20} color="var(--violet)" />, title: 'Competencia que motiva', desc: 'Ver que otros suben de nivel activa el instinto competitivo. No para ganar contra ellos, sino para no quedarte atrás.', color: 'var(--violet)' },
              { icon: <Award size={20} color="var(--gold)" />, title: 'Recompensa inmediata', desc: 'El XP, las insignias y las misiones épicas dan satisfacción en tiempo real. Tu cerebro aprende que el esfuerzo vale la pena.', color: 'var(--gold)' },
              { icon: <Target size={20} color="var(--green)" />, title: 'Claridad de foco', desc: 'Cada día sabes exactamente qué hacer. Sin decisiones de más. Solo ejecutar las misiones que ya elegiste.', color: 'var(--green)' },
              { icon: <Flame size={20} color="#FF4D6A" />, title: 'Motivación sostenida', desc: 'La mayoría falla por pérdida de momentum. El sistema de rachas y ranking mantiene vivo el impulso semana tras semana.', color: '#FF4D6A' },
            ].map(({ icon, title, desc, color }) => (
              <div key={title} style={{
                display: 'flex', gap: 16, alignItems: 'flex-start',
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                borderRadius: 10, padding: '20px 20px',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                  background: `${color}12`, border: `1px solid ${color}28`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6, letterSpacing: '0.03em' }}>{title}</h4>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════
          RANKING — Motivación y estatus
      ══════════════════════════════════════════════════════════ */}
      <Section id="ranking" style={{ padding: isMobile ? '80px 24px' : '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 48 : 80,
            alignItems: 'center',
          }}>
            {/* Left: copy */}
            <div>
              <SectionHeader
                label="Ranking global"
                title="Tu posición importa"
                subtitle="El ranking no es decorativo. Es accountability público. Cada semana, tu posición refleja con precisión cuánto trabajaste."
                accent="var(--gold)"
                align="left"
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                {[
                  { icon: <Trophy size={16} color="var(--gold)" />, title: 'Estatus real', desc: 'Tu posición en el ranking es un reflejo directo de tu esfuerzo acumulado, no de cuánto pagas o cuánto tiempo llevas.' },
                  { icon: <Users size={16} color="var(--cyan)" />, title: 'Competencia sana', desc: 'Competir contra personas reales que tienen los mismos objetivos que tú es el sistema de motivación más poderoso que existe.' },
                  { icon: <Star size={16} color="var(--violet)" />, title: 'Recompensas exclusivas', desc: 'Los mejores operadores de cada temporada acceden a insignias legendarias, misiones únicas y reconocimiento de la comunidad.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link to="/register" style={{
                ...btnBase, fontSize: 13, padding: '13px 24px',
                background: 'var(--gold)', color: 'var(--void)',
                borderRadius: 6, boxShadow: '0 4px 20px var(--gold-glow)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(245,196,81,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px var(--gold-glow)'; }}
              >
                Entrar al ranking <ArrowRight size={13} />
              </Link>
            </div>

            {/* Right: ranking panel */}
            <div style={{
              background: 'var(--panel)',
              border: '1px solid rgba(245,196,81,0.2)',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(245,196,81,0.04)',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px',
                background: 'rgba(245,196,81,0.06)',
                borderBottom: '1px solid rgba(245,196,81,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trophy size={14} color="var(--gold)" />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--gold)', letterSpacing: '0.1em' }}>RANKING GLOBAL</span>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-mono)', fontSize: 9,
                  color: 'var(--text-muted)',
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--green)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                  EN VIVO
                </div>
              </div>

              {/* Players */}
              <div style={{ padding: '8px 0' }}>
                {[
                  { rank: 1, name: 'ÉLITE_NOVA', level: 48, xp: '89,420', streak: 92, rarity: 'LEGENDARIO', color: 'var(--gold)' },
                  { rank: 2, name: 'PHANTOM_X', level: 44, xp: '82,100', streak: 78, rarity: 'ÉPICO', color: 'var(--violet)' },
                  { rank: 3, name: 'DARKSTAR_7', level: 42, xp: '79,650', streak: 61, rarity: 'ÉPICO', color: 'var(--violet)' },
                  { rank: 4, name: 'RYUU_ALPHA', level: 38, xp: '68,200', streak: 44, rarity: 'RARO', color: 'var(--cyan)' },
                  { rank: 12, name: 'TÚ', level: 24, xp: '34,980', streak: 14, rarity: 'RARO', color: 'var(--cyan)', isUser: true },
                ].map(({ rank, name, level, xp, streak, rarity, color, isUser }) => (
                  <div key={rank} style={{
                    display: 'flex', alignItems: 'center',
                    padding: '10px 20px',
                    background: isUser ? 'rgba(51,209,255,0.06)' : 'transparent',
                    borderLeft: isUser ? '2px solid var(--cyan)' : '2px solid transparent',
                    borderBottom: rank !== 12 ? '1px solid rgba(42,51,82,0.5)' : 'none',
                    gap: 12,
                    ...(isUser && { marginTop: 4, borderTop: '1px dashed rgba(42,51,82,0.6)' }),
                  }}>
                    {/* Rank */}
                    <div style={{
                      width: 28, textAlign: 'center',
                      fontFamily: 'var(--font-display)', fontSize: rank <= 3 ? 18 : 14,
                      color: rank === 1 ? 'var(--gold)' : rank === 2 ? '#C0C0C0' : rank === 3 ? '#CD7F32' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}>#{rank}</div>

                    {/* Avatar */}
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 12, color,
                    }}>{name[0]}</div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{
                          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                          color: isUser ? 'var(--cyan)' : 'var(--text)',
                          letterSpacing: '0.03em',
                        }}>{name}</span>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 8,
                          color, letterSpacing: '0.12em',
                          padding: '1px 6px',
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          borderRadius: 3,
                        }}>{rarity}</span>
                        {isUser && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--cyan)', opacity: 0.7 }}>← TÚ</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>Nv {level}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--violet)' }}>{xp} XP</span>
                      </div>
                    </div>

                    {/* Streak */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--gold)' }}>🔥{streak}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)' }}>DÍAS</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                padding: '12px 20px',
                background: 'rgba(0,0,0,0.2)',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)' }}>2.400+ operadores · actualizado en tiempo real</span>
                <a href="#" style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--violet)', letterSpacing: '0.08em', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                  Ver completo <ChevronRight size={11} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* ══════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════ */}
      <Section style={{ padding: isMobile ? '80px 24px 100px' : '120px 48px 140px', position: 'relative', overflow: 'hidden' }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw', height: '80vh', pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(124,92,255,0.08) 0%, transparent 70%)',
        }} />

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(42,51,82,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.15) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 720, margin: '0 auto' }}>

          {/* Label */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--violet)', letterSpacing: '0.25em', marginBottom: 28,
          }}>
            <div style={{ width: 28, height: 1, background: 'var(--violet)', opacity: 0.6 }} />
            EMPIEZA HOY
            <div style={{ width: 28, height: 1, background: 'var(--violet)', opacity: 0.6 }} />
          </div>

          {/* Headline */}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: isMobile ? 'clamp(48px, 13vw, 72px)' : 'clamp(56px, 7vw, 88px)',
            lineHeight: 0.95, letterSpacing: '0.01em',
            marginBottom: 24, color: 'var(--text)',
          }}>
            <GlitchText>PARA DE PLANEAR.</GlitchText>
            <br />
            <span style={{
              background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>EMPIEZA A ASCENDER.</span>
          </h2>

          {/* Body */}
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: isMobile ? 16 : 18,
            color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 40,
            maxWidth: 580, margin: '0 auto 40px',
          }}>
            Miles de personas ya están completando misiones, ganando XP y construyendo la mejor versión de sí mismos.
            <strong style={{ color: 'var(--text)' }}> Tu progreso empieza hoy, no mañana.</strong>
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <Link to="/register" style={{
              ...btnBase, fontSize: 15, padding: '16px 36px',
              background: 'var(--violet)', color: 'white',
              borderRadius: 6,
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
              boxShadow: '0 8px 32px var(--violet-glow)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#9370FF'; e.currentTarget.style.boxShadow = '0 12px 44px rgba(124,92,255,0.5)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 8px 32px var(--violet-glow)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Empezar gratis — es gratuito <ArrowRight size={15} />
            </Link>

            <Link to="/login" style={{
              ...btnBase, fontSize: 14, padding: '15px 28px',
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1px solid var(--border-bright)', borderRadius: 6,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--cyan)'; e.currentTarget.style.color = 'var(--cyan)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Ya tengo cuenta
            </Link>
          </div>

          {/* Microcopy */}
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 12,
            color: 'var(--text-muted)', letterSpacing: '0.05em',
          }}>
            Sin tarjeta de crédito · Sin compromisos · Progreso visible desde el día 1
          </p>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════ */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--panel)',
        padding: isMobile ? '40px 24px 32px' : '56px 48px 36px',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
            gap: isMobile ? 40 : 48,
            marginBottom: 48,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <LogoIcon size={22} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.28em', color: 'var(--text)' }}>ASCEND</span>
              </div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 260, marginBottom: 20 }}>
                El sistema que convierte disciplina, hábitos y metas en progreso visible. Compite. Mejora. Asciende.
              </p>
              {/* Attribute pills */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'SALUD', color: 'var(--green)' },
                  { label: 'DINERO', color: 'var(--gold)' },
                  { label: 'DISCIPLINA', color: 'var(--violet)' },
                ].map(({ label, color }) => (
                  <span key={label} style={{
                    fontFamily: 'var(--font-mono)', fontSize: 9,
                    color, padding: '3px 8px',
                    background: `${color}10`,
                    border: `1px solid ${color}28`,
                    borderRadius: 3, letterSpacing: '0.15em',
                  }}>{label}</span>
                ))}
              </div>
            </div>

            {/* Producto */}
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--text)', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' }}>Producto</div>
              {['Cómo funciona', 'Ranking', 'Misiones', 'Recompensas'].map(item => (
                <a key={item} href="#" style={{
                  display: 'block', fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--text-muted)', textDecoration: 'none',
                  marginBottom: 10, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item}</a>
              ))}
            </div>

            {/* Cuenta */}
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--text)', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' }}>Cuenta</div>
              {['Registrarse', 'Iniciar sesión', 'Perfil', 'Configuración'].map(item => (
                <a key={item} href="#" style={{
                  display: 'block', fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--text-muted)', textDecoration: 'none',
                  marginBottom: 10, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item}</a>
              ))}
            </div>

            {/* Legal */}
            <div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: 'var(--text)', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase' }}>Legal</div>
              {['Términos de uso', 'Privacidad', 'Cookies'].map(item => (
                <a key={item} href="#" style={{
                  display: 'block', fontFamily: 'var(--font-body)', fontSize: 13,
                  color: 'var(--text-muted)', textDecoration: 'none',
                  marginBottom: 10, transition: 'color 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item}</a>
              ))}
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            paddingTop: 24, borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              © 2026 ASCEND — Todos los derechos reservados
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
              Build <span style={{ color: 'var(--violet)' }}>v1.0.0</span> · Sistema operativo de progreso humano
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
