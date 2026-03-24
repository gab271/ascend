import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, TrendingUp, Target, Trophy, Gift, Shield, DollarSign, Menu, X } from 'lucide-react';

// ─── Chromatic aberration / glitch wrapper ───────────────────────
function GlitchText({ children, style, as: Tag = 'span' }) {
  return (
    <Tag style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      {/* Cyan layer */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: '#33D1FF',
          mixBlendMode: 'screen',
          animation: 'chromatic-1 8s ease-in-out infinite',
          userSelect: 'none',
          zIndex: 2,
        }}
      >
        {children}
      </span>
      {/* Red layer */}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          color: '#FF4D6A',
          mixBlendMode: 'screen',
          animation: 'chromatic-2 8s ease-in-out infinite',
          userSelect: 'none',
          zIndex: 2,
        }}
      >
        {children}
      </span>
    </Tag>
  );
}

// ─── Pixel-art floating particles ────────────────────────────────
const PARTICLES = [
  { id:0,  x:5,   y:14,  size:2, duration:7,   delay:0,   color:'#7C5CFF', type:0, opacity:0.35 },
  { id:1,  x:18,  y:72,  size:1, duration:5.5, delay:1.5, color:'#33D1FF', type:1, opacity:0.28 },
  { id:2,  x:28,  y:38,  size:3, duration:8,   delay:0.8, color:'#F5C451', type:2, opacity:0.3  },
  { id:3,  x:42,  y:85,  size:1, duration:6,   delay:2,   color:'#33E6A1', type:0, opacity:0.25 },
  { id:4,  x:55,  y:20,  size:2, duration:9,   delay:0.3, color:'#7C5CFF', type:2, opacity:0.32 },
  { id:5,  x:67,  y:60,  size:2, duration:6.5, delay:3,   color:'#33D1FF', type:1, opacity:0.22 },
  { id:6,  x:73,  y:88,  size:1, duration:7.5, delay:1,   color:'#F5C451', type:0, opacity:0.28 },
  { id:7,  x:82,  y:33,  size:3, duration:5,   delay:2.5, color:'#7C5CFF', type:2, opacity:0.25 },
  { id:8,  x:91,  y:70,  size:1, duration:8.5, delay:0.7, color:'#33E6A1', type:1, opacity:0.2  },
  { id:9,  x:12,  y:52,  size:2, duration:6,   delay:4,   color:'#33D1FF', type:0, opacity:0.3  },
  { id:10, x:35,  y:10,  size:1, duration:7,   delay:1.2, color:'#F5C451', type:2, opacity:0.26 },
  { id:11, x:48,  y:45,  size:2, duration:9,   delay:3.5, color:'#7C5CFF', type:1, opacity:0.2  },
  { id:12, x:60,  y:78,  size:3, duration:5.5, delay:0.5, color:'#33D1FF', type:0, opacity:0.22 },
  { id:13, x:78,  y:18,  size:1, duration:8,   delay:2.2, color:'#33E6A1', type:2, opacity:0.3  },
  { id:14, x:88,  y:50,  size:2, duration:6.5, delay:4.5, color:'#F5C451', type:1, opacity:0.25 },
  { id:15, x:22,  y:92,  size:1, duration:7.5, delay:1.8, color:'#7C5CFF', type:0, opacity:0.2  },
  { id:16, x:96,  y:28,  size:2, duration:5,   delay:3.2, color:'#33D1FF', type:2, opacity:0.28 },
  { id:17, x:3,   y:66,  size:3, duration:9,   delay:0.2, color:'#F5C451', type:1, opacity:0.18 },
  { id:18, x:52,  y:96,  size:1, duration:6,   delay:5,   color:'#33E6A1', type:0, opacity:0.22 },
  { id:19, x:38,  y:58,  size:2, duration:8,   delay:2.8, color:'#7C5CFF', type:2, opacity:0.2  },
  { id:20, x:70,  y:5,   size:1, duration:7,   delay:1.6, color:'#33D1FF', type:0, opacity:0.3  },
  { id:21, x:15,  y:30,  size:2, duration:6.5, delay:0.9, color:'#F5C451', type:1, opacity:0.25 },
];

function Particle({ p }) {
  const s = p.size * 3;
  // type 0: pixel cross (+)
  if (p.type === 0) return (
    <div style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, animation:`float ${p.duration}s ease-in-out infinite`, animationDelay:`${p.delay}s`, pointerEvents:'none' }}>
      <svg width={s*2+1} height={s*2+1} viewBox="0 0 5 5" shapeRendering="crispEdges" style={{ imageRendering:'pixelated', opacity:p.opacity }}>
        <rect x="2" y="0" width="1" height="5" fill={p.color} />
        <rect x="0" y="2" width="5" height="1" fill={p.color} />
      </svg>
    </div>
  );
  // type 1: pixel square (2×2)
  if (p.type === 1) return (
    <div style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, animation:`float ${p.duration}s ease-in-out infinite`, animationDelay:`${p.delay}s`, pointerEvents:'none' }}>
      <div style={{ width:p.size*4, height:p.size*4, background:p.color, opacity:p.opacity }} />
    </div>
  );
  // type 2: pixel diamond (◆)
  return (
    <div style={{ position:'absolute', left:`${p.x}%`, top:`${p.y}%`, animation:`float ${p.duration}s ease-in-out infinite`, animationDelay:`${p.delay}s`, pointerEvents:'none' }}>
      <svg width={s} height={s} viewBox="0 0 5 5" shapeRendering="crispEdges" style={{ imageRendering:'pixelated', opacity:p.opacity }}>
        <rect x="2" y="0" width="1" height="1" fill={p.color} />
        <rect x="1" y="1" width="3" height="1" fill={p.color} />
        <rect x="0" y="2" width="5" height="1" fill={p.color} />
        <rect x="1" y="3" width="3" height="1" fill={p.color} />
        <rect x="2" y="4" width="1" height="1" fill={p.color} />
      </svg>
    </div>
  );
}

// ─── Scrolling data ticker ────────────────────────────────────────
const TICKER_TEXT =
  'DARKSTAR completa Entrenamiento de Fuerza · +150 XP · · RYUU_ALPHA sube al nivel 29 · · NOVA_PRIME supera los 58K de XP · · RACHA RÉCORD: 62 días sin fallo · · 2,400+ jugadores ya compitiendo · · Tu próxima misión te espera · · SALUD · DINERO · DISCIPLINA · · ÉLITE_X cierra el mes en el top 3 · · Misión legendaria completada: Mes sin azúcar · +800 XP · · ';

function DataTicker() {
  return (
    <div className="data-ticker">
      <div className="data-ticker__inner">
        {TICKER_TEXT.repeat(4)}
      </div>
    </div>
  );
}

// ─── Pixel Terrain Divider ───────────────────────────────────────
function PixelTerrain({ fillColor, flip = false }) {
  const ups = [40,32,40,24,16,8,16,0,8,16,8,0,8,16,8,0,8,16,32,40];
  const heights = flip ? ups.map(y => 48 - y) : ups;
  let d;
  if (!flip) {
    d = `M 0 48 L 0 ${heights[0]}`;
    heights.forEach((y, i) => {
      if (i > 0) d += ` L ${i * 8} ${y}`;
      d += ` L ${(i + 1) * 8} ${y}`;
    });
    d += ` L 160 48 Z`;
  } else {
    d = `M 0 0 L 160 0 L 160 ${heights[19]}`;
    for (let i = 19; i >= 0; i--) {
      d += ` L ${i * 8} ${heights[i]}`;
      if (i > 0) d += ` L ${i * 8} ${heights[i - 1]}`;
    }
    d += ` Z`;
  }
  return (
    <div style={{ lineHeight: 0, pointerEvents: 'none', display: 'block', overflow: 'hidden' }}>
      <svg viewBox="0 0 160 48" preserveAspectRatio="none"
           style={{ width: '100%', height: 48, display: 'block' }}
           shapeRendering="crispEdges">
        <path d={d} fill={fillColor} />
      </svg>
    </div>
  );
}

// ─── Pixel Gem ───────────────────────────────────────────────────
function PixelGem({ color = '#7C5CFF', scale = 4, opacity = 0.7, style = {} }) {
  return (
    <svg width={7 * scale} height={9 * scale} viewBox="0 0 7 9"
         shapeRendering="crispEdges"
         style={{ imageRendering: 'pixelated', opacity, display: 'block', ...style }}>
      <rect x="2" y="0" width="3" height="1" fill={color} />
      <rect x="1" y="1" width="5" height="1" fill={color} />
      <rect x="0" y="2" width="7" height="4" fill={color} opacity="0.85" />
      <rect x="1" y="6" width="5" height="1" fill={color} opacity="0.65" />
      <rect x="2" y="7" width="3" height="1" fill={color} opacity="0.45" />
      <rect x="3" y="8" width="1" height="1" fill={color} opacity="0.3" />
      <rect x="1" y="2" width="2" height="1" fill="white" opacity="0.35" />
      <rect x="1" y="3" width="1" height="1" fill="white" opacity="0.2" />
    </svg>
  );
}

// ─── Pixel Warrior ───────────────────────────────────────────────
function PixelWarrior({ scale = 5, style = {} }) {
  const C = { h:'#7C5CFF', s:'#E8B89A', e:'#1a0a30', b:'#33D1FF', a:'#F5C451', l:'#1A88BB', f:'#0A0B10' };
  const px = [
    [1,0,C.h],[2,0,C.h],[3,0,C.h],[4,0,C.h],
    [0,1,C.h],[1,1,C.h],[2,1,C.h],[3,1,C.h],[4,1,C.h],[5,1,C.h],
    [0,2,C.h],[1,2,C.s],[2,2,C.s],[3,2,C.s],[4,2,C.s],[5,2,C.h],
    [0,3,C.h],[1,3,C.e],[2,3,C.s],[3,3,C.s],[4,3,C.e],[5,3,C.h],
    [0,4,C.a],[1,4,C.b],[2,4,C.b],[3,4,C.b],[4,4,C.b],[5,4,C.a],
    [1,5,C.b],[2,5,C.b],[3,5,C.b],[4,5,C.b],
    [0,6,C.b],[1,6,C.b],[2,6,C.a],[3,6,C.a],[4,6,C.b],[5,6,C.b],
    [1,7,C.b],[2,7,C.b],[3,7,C.b],[4,7,C.b],
    [1,8,C.l],[4,8,C.l],
    [1,9,C.l],[4,9,C.l],
    [0,10,C.f],[1,10,C.f],[4,10,C.f],[5,10,C.f],
  ];
  return (
    <svg width={6 * scale} height={11 * scale} viewBox="0 0 6 11"
         shapeRendering="crispEdges"
         style={{ imageRendering: 'pixelated', display: 'block', ...style }}>
      {px.map(([x, y, color], i) => (
        <rect key={i} x={x} y={y} width="1" height="1" fill={color} />
      ))}
    </svg>
  );
}

// ─── Dashboard mockup card ────────────────────────────────────────
function DashboardMockup() {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid rgba(124,92,255,0.3)',
      borderRadius: 14,
      padding: 22,
      width: '100%',
      maxWidth: 400,
      boxShadow: '0 60px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,255,0.15), 0 0 80px rgba(124,92,255,0.08)',
      position: 'relative',
      overflow: 'hidden',
      transform: 'perspective(800px) rotateY(-6deg) rotateX(2deg)',
      transformOrigin: 'center center',
    }}>
      {/* Scan line sweep */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 2,
        background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.6), transparent)',
        animation: 'scan-sweep 4s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 10,
      }} />

      {/* Corner decorators */}
      {[
        { top: 6, left: 6, borderWidth: '2px 0 0 2px' },
        { top: 6, right: 6, borderWidth: '2px 2px 0 0' },
        { bottom: 6, left: 6, borderWidth: '0 0 2px 2px' },
        { bottom: 6, right: 6, borderWidth: '0 2px 2px 0' },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 12, height: 12,
          borderColor: 'var(--violet)',
          borderStyle: 'solid',
          opacity: 0.6,
          ...pos,
        }} />
      ))}

      {/* Level + streak row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>NIVEL GLOBAL</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, color: 'var(--text)', lineHeight: 1, textShadow: '0 0 30px rgba(124,92,255,0.5)' }}>24</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--gold)', letterSpacing: '0.15em', marginBottom: 3 }}>RACHA</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--gold)', lineHeight: 1, textShadow: '0 0 18px rgba(245,196,81,0.55)' }}>🔥14</div>
        </div>
      </div>

      {/* XP bar segmented */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', marginBottom: 5 }}>
          <span style={{ color: 'var(--violet)' }}>▸ XP</span>
          <span>4,230 / 5,000</span>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 7, borderRadius: 2,
              background: i < 17 ? 'linear-gradient(90deg, var(--violet), var(--cyan))' : 'var(--surface)',
              border: i >= 17 ? '1px solid var(--border)' : 'none',
              boxShadow: i < 17 ? '0 0 4px rgba(124,92,255,0.3)' : 'none',
            }} />
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
        {[
          { label: 'SALUD', val: 78, color: 'var(--green)' },
          { label: 'DINERO', val: 62, color: 'var(--gold)' },
          { label: 'DISCIPLINA', val: 91, color: 'var(--violet)' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--surface)',
            borderRadius: 7,
            padding: '8px 8px',
            border: `1px solid ${s.color}22`,
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission rows */}
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 6 }}>MISIONES DE HOY</div>
      {[
        { name: 'Entrenamiento de fuerza', xp: 150, rarity: 'RARA', color: 'var(--cyan)', done: false },
        { name: 'Lectura de inversiones', xp: 100, rarity: 'COMÚN', color: 'var(--rarity-common)', done: true },
      ].map((m, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '7px 10px', borderRadius: 6, marginBottom: 4,
          background: m.done ? 'rgba(51,230,161,0.05)' : 'var(--void)',
          border: `1px solid ${m.done ? 'rgba(51,230,161,0.2)' : 'var(--border)'}`,
          borderLeft: `2px solid ${m.done ? 'var(--green)' : m.color}`,
          opacity: m.done ? 0.55 : 1,
        }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, color: m.done ? 'var(--green)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none' }}>
            {m.done ? '✓ ' : ''}{m.name}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: m.color }}>+{m.xp} XP</span>
        </div>
      ))}
    </div>
  );
}

// ─── Responsive breakpoint hook ──────────────────────────────────
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

// ─── Main Landing Page ────────────────────────────────────────────
export default function Landing() {
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ═══ NAVBAR ══════════════════════════════════════════════ */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 20px' : '0 48px',
        height: 68,
        background: scrollY > 40 ? 'rgba(10,11,16,0.94)' : 'transparent',
        backdropFilter: scrollY > 40 ? 'blur(24px) saturate(1.4)' : 'none',
        borderBottom: scrollY > 40 ? '1px solid rgba(42,51,82,0.8)' : '1px solid transparent',
        transition: 'background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease',
      }}>

        {/* Top accent line — siempre visible */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, var(--violet) 0%, var(--cyan) 45%, transparent 80%)',
          pointerEvents: 'none',
        }} />

        {/* Barra de progreso de scroll */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          height: 1,
          width: `${scrollProgress}%`,
          background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
          transition: 'width 0.1s linear',
          pointerEvents: 'none',
          opacity: scrollProgress > 1 ? 1 : 0,
        }} />

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <GlitchText as="div" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Emblema: diamante con chevron ascendente */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polygon
                  points="14,2 26,14 14,26 2,14"
                  stroke="url(#nLG)"
                  strokeWidth="1.5"
                  fill="rgba(124,92,255,0.08)"
                />
                <polyline
                  points="9,17 14,10 19,17"
                  stroke="url(#nLG2)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <line x1="14" y1="10" x2="14" y2="20" stroke="url(#nLG2)" strokeWidth="1.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="nLG" x1="2" y1="2" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#7C5CFF" />
                    <stop offset="100%" stopColor="#33D1FF" />
                  </linearGradient>
                  <linearGradient id="nLG2" x1="9" y1="10" x2="19" y2="20" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#33D1FF" />
                    <stop offset="100%" stopColor="#7C5CFF" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                letterSpacing: '0.28em',
                color: 'var(--text)',
              }}>
                ASCEND
              </span>
            </span>
          </GlitchText>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text-muted)',
            letterSpacing: '0.1em',
            opacity: 0.5,
            marginTop: 3,
          }}>v1.0</span>
        </div>

        {/* ── Desktop: status + links + CTAs ── */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 7,
              marginRight: 22, paddingRight: 22,
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{
                width: 5, height: 5, borderRadius: '50%',
                background: 'var(--green)', boxShadow: '0 0 6px var(--green)',
                animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0,
              }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--green)' }}>EN LÍNEA</span>
            </div>

            {[
              { label: 'CARACTERÍSTICAS', href: '#features' },
              { label: 'RANKING', href: '#ranking-preview' },
            ].map(({ label, href }) => (
              <a key={label} href={href}
                style={{
                  position: 'relative', fontFamily: 'var(--font-ui)', fontWeight: 700,
                  fontSize: 12, letterSpacing: '0.1em',
                  color: hoveredNav === label ? 'var(--text)' : 'var(--text-muted)',
                  transition: 'color 0.2s', padding: '6px 14px',
                  display: 'inline-flex', alignItems: 'center',
                }}
                onMouseEnter={() => setHoveredNav(label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <span style={{
                  position: 'absolute', left: 2, fontFamily: 'var(--font-mono)', fontSize: 14,
                  color: 'var(--violet)', opacity: hoveredNav === label ? 1 : 0,
                  transform: hoveredNav === label ? 'translateX(0)' : 'translateX(5px)',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                }}>[</span>
                {label}
                <span style={{
                  position: 'absolute', right: 2, fontFamily: 'var(--font-mono)', fontSize: 14,
                  color: 'var(--violet)', opacity: hoveredNav === label ? 1 : 0,
                  transform: hoveredNav === label ? 'translateX(0)' : 'translateX(-5px)',
                  transition: 'opacity 0.15s ease, transform 0.15s ease',
                }}>]</span>
              </a>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 10px', opacity: 0.7 }} />

            <Link to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 18px', background: 'transparent', color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                border: '1px solid var(--border-bright)', textDecoration: 'none',
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              Iniciar sesión
            </Link>

            <Link to="/register"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 22px', background: 'var(--violet)', color: 'white',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                boxShadow: '0 4px 24px var(--violet-glow)',
                transition: 'box-shadow 0.2s, background 0.2s', textDecoration: 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#8B6FFF'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(124,92,255,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--violet)'; e.currentTarget.style.boxShadow = '0 4px 24px var(--violet-glow)'; }}
            >
              Crear cuenta <ArrowRight size={13} />
            </Link>
          </div>
        )}

        {/* ── Mobile: hamburger ── */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text)', display: 'flex', alignItems: 'center', padding: 6,
          }}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </nav>

      {/* ── Mobile menu drawer ── */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: 68, left: 0, right: 0, zIndex: 190,
          background: 'rgba(10,11,16,0.97)',
          backdropFilter: 'blur(24px) saturate(1.4)',
          borderBottom: '1px solid var(--border)',
          padding: '20px 28px 28px',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, var(--violet), var(--cyan), transparent)' }} />
          {[
            { label: 'Características', href: '#features' },
            { label: 'Ranking', href: '#ranking-preview' },
          ].map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16,
                letterSpacing: '0.05em', color: 'var(--text-secondary)',
                textDecoration: 'none', padding: '14px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              {label} <ArrowRight size={14} color="var(--text-muted)" />
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <Link to="/login" onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '13px 20px', background: 'transparent',
                border: '1px solid var(--border-bright)', color: 'var(--text-secondary)',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
              }}
            >
              Iniciar sesión
            </Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 20px', background: 'var(--violet)', color: 'white',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)',
                boxShadow: '0 4px 20px var(--violet-glow)',
              }}
            >
              Crear cuenta <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse-glow 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', color: 'var(--green)' }}>EN LÍNEA — 2,400+ JUGADORES ACTIVOS</span>
          </div>
        </div>
      )}

      {/* ═══ HERO ════════════════════════════════════════════════ */}
      <section style={{
        position: 'relative',
        height: isMobile ? 'auto' : '100vh',
        minHeight: isMobile ? 'auto' : 720,
        paddingTop: isMobile ? 100 : 0,
        paddingBottom: isMobile ? 64 : 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Base radial glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 70% at 60% 50%, rgba(124,92,255,0.1) 0%, transparent 65%)',
          transform: `translateY(${scrollY * 0.04}px)`,
          pointerEvents: 'none',
        }} />

        {/* Animated grid — slowest layer */}
        <div className="hero-grid" style={{
          position: 'absolute',
          inset: '-20%',
          transform: `translateY(${scrollY * 0.1}px)`,
        }} />

        {/* Particles — medium layer */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateY(${scrollY * 0.22}px)`,
          pointerEvents: 'none',
        }}>
          {PARTICLES.map(p => <Particle key={p.id} p={p} />)}
        </div>

        {/* Side accent glows */}
        <div style={{
          position: 'absolute', right: -80, top: 0, bottom: 0, width: 500,
          background: 'radial-gradient(ellipse at right, rgba(51,209,255,0.07) 0%, transparent 70%)',
          transform: `translateY(${scrollY * 0.28}px)`,
          pointerEvents: 'none',
        }} />

        {/* ── Pixel RPG decorations ── */}
        {!isMobile && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
            {/* Warrior — bottom-right corner */}
            <div style={{
              position: 'absolute', bottom: 72, right: 56,
              animation: 'float 4.5s ease-in-out infinite',
              opacity: 0.7,
            }}>
              <PixelWarrior scale={6} />
            </div>
            {/* Gems */}
            <div style={{ position:'absolute', top:'17%', left:'44%', animation:'float 5s ease-in-out infinite', animationDelay:'0.4s' }}>
              <PixelGem color="#7C5CFF" scale={3} opacity={0.45} />
            </div>
            <div style={{ position:'absolute', top:'62%', left:'37%', animation:'float 6.5s ease-in-out infinite', animationDelay:'1.2s' }}>
              <PixelGem color="#33D1FF" scale={2} opacity={0.35} />
            </div>
            <div style={{ position:'absolute', top:'28%', right:'22%', animation:'float 5.5s ease-in-out infinite', animationDelay:'2.5s' }}>
              <PixelGem color="#F5C451" scale={2} opacity={0.4} />
            </div>
            <div style={{ position:'absolute', bottom:'25%', left:'48%', animation:'float 7s ease-in-out infinite', animationDelay:'3s' }}>
              <PixelGem color="#33E6A1" scale={2} opacity={0.3} />
            </div>
          </div>
        )}

        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          padding: isMobile ? '0 24px' : '0 60px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 420px',
          gap: isMobile ? 0 : 40,
          alignItems: 'center',
          transform: isMobile ? 'none' : `translateY(${scrollY * 0.07}px)`,
        }}>

          {/* Left: Text */}
          <div style={{ position: 'relative' }}>
            {/* Vertical side label — desktop only */}
            {!isMobile && (
              <div className="side-label" style={{
                position: 'absolute',
                left: -40,
                top: '50%',
                transform: 'translateY(-50%) rotate(180deg)',
              }}>
                TU VIDA · TU PARTIDA · SIN EXCUSAS
              </div>
            )}

            {/* Hero badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 30,
              animation: 'entry-left 0.7s ease forwards',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 10px var(--green)', animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.22em', color: 'var(--green)' }}>
                  BETA GRATUITA
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)', opacity: 0.35, lineHeight: 1 }}>╱</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.01em' }}>
                2,400+ jugando ahora
              </span>
            </div>

            {/* ─── THE HEADLINE — three distinct type treatments ─── */}
            <div style={{ marginBottom: 28, animation: 'entry-up 0.8s ease forwards', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              {/* Line 1: Huge, filled white — GLITCH target */}
              <GlitchText
                as="div"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(76px, 9.5vw, 148px)',
                  lineHeight: 0.9,
                  color: 'var(--text)',
                  letterSpacing: '-0.01em',
                }}
              >
                CONVIERTE
              </GlitchText>

              {/* Line 2: Slightly smaller, OUTLINED — the distinctive move */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(52px, 6.5vw, 100px)',
                lineHeight: 0.9,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.38)',
                letterSpacing: '0.04em',
              }}>
                TU VIDA EN
              </div>

              {/* Line 3: Gradient fill, smaller */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 5vw, 76px)',
                lineHeight: 0.95,
                background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.06em',
              }}>
                UNA PARTIDA
              </div>
            </div>

            {/* Subtitle */}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--text-secondary)',
              maxWidth: 460,
              lineHeight: 1.65,
              marginBottom: 32,
              animation: 'entry-up 0.8s ease forwards',
              animationDelay: '0.2s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              Gana XP completando misiones reales. Sube en
              <strong style={{ color: 'var(--green)' }}> Salud</strong>,{' '}
              <strong style={{ color: 'var(--gold)' }}>Dinero</strong> y{' '}
              <strong style={{ color: 'var(--violet)' }}>Disciplina</strong>.{' '}
              Tu vida es el único juego que importa.
            </p>

            {/* CTAs */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 14,
              marginBottom: 40,
              animation: 'entry-up 0.8s ease forwards',
              animationDelay: '0.3s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Empezar Gratis <ArrowRight size={17} />
              </Link>
              <a href="#features" className="btn btn-outline btn-lg">
                Cómo Funciona
              </a>
            </div>

            {/* Live stats row */}
            <div style={{
              display: 'flex',
              gap: 28,
              animation: 'entry-up 0.8s ease forwards',
              animationDelay: '0.4s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}>
              {[
                { val: '2,400+', label: 'Ya compitiendo', color: 'var(--cyan)' },
                { val: '48K', label: 'XP récord global', color: 'var(--gold)' },
                { val: '62d', label: 'Racha más larga', color: 'var(--violet)' },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28,
                    color: stat.color,
                    lineHeight: 1,
                    textShadow: `0 0 20px ${stat.color}88`,
                  }}>
                    {stat.val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.12em',
                    marginTop: 2,
                  }}>
                    {stat.label.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard mockup — desktop only */}
          {!isMobile && <div style={{
            display: 'flex',
            justifyContent: 'center',
            transform: `translateY(${-scrollY * 0.05}px)`,
            animation: 'entry-up 1s ease forwards',
            animationDelay: '0.15s',
            opacity: 0,
            animationFillMode: 'forwards',
            position: 'relative',
          }}>
            {/* Glow rings behind mockup */}
            <div style={{
              position: 'absolute',
              inset: -40,
              borderRadius: 28,
              border: '1px solid rgba(124,92,255,0.12)',
              animation: 'breathe 4s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute',
              inset: -70,
              borderRadius: 40,
              border: '1px solid rgba(51,209,255,0.06)',
              animation: 'breathe 4s ease-in-out infinite',
              animationDelay: '1.5s',
              pointerEvents: 'none',
            }} />
            <DashboardMockup />
          </div>}
        </div>

        {/* Scroll nudge */}
        <div style={{
          position: 'absolute',
          bottom: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          animation: 'float 2.5s ease-in-out infinite',
          zIndex: 10,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.25em', color: 'var(--text-muted)' }}>SCROLL</span>
          <div style={{ width: 1, height: 28, background: 'linear-gradient(180deg, var(--text-muted), transparent)' }} />
        </div>
      </section>

      {/* ═══ DATA TICKER ════════════════════════════════════════ */}
      <DataTicker />

      {/* ═══ FEATURES — editorial numbered layout ════════════════ */}
      <section id="features" style={{ padding: isMobile ? '72px 24px' : '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'flex-end', justifyContent: 'space-between', gap: isMobile ? 16 : 0, marginBottom: isMobile ? 48 : 72 }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                letterSpacing: '0.3em',
                color: 'var(--violet)',
                marginBottom: 12,
              }}>
                ¿CÓMO SE JUEGA?
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 6vw, 80px)',
                color: 'var(--text)',
                lineHeight: 0.95,
              }}>
                LA MECÁNICA<br />
                <span style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                }}>
                  DEL ASCENSO
                </span>
              </h2>
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              textAlign: 'right',
              lineHeight: 2,
            }}>
              CUATRO FASES<br />
              HACIA LA CIMA
            </div>
          </div>

          {/* Editorial feature rows — NOT uniform cards */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              {
                num: '01',
                icon: TrendingUp,
                color: 'var(--violet)',
                title: 'SUBE DE NIVEL',
                desc: 'Cada acción real suma XP. Entrenas, ahorras, lees, madrugas — el contador sube. Faltas un día — el contador también lo sabe. Sin trampa. Sin excusa.',
                wide: true,
              },
              {
                num: '02',
                icon: Target,
                color: 'var(--cyan)',
                title: 'MISIONES',
                desc: 'Comunes, raras, épicas, legendarias. Cada una tiene un precio en esfuerzo y un premio en XP. Elige las que puedes. Ejecuta las que temes.',
                wide: false,
              },
              {
                num: '03',
                icon: Gift,
                color: 'var(--gold)',
                title: 'RECOMPENSAS',
                desc: 'Títulos únicos. Marcos épicos. Insignias que nadie compra. Solo se consiguen poniendo el trabajo donde otros se rindieron.',
                wide: false,
              },
              {
                num: '04',
                icon: Trophy,
                color: 'var(--green)',
                title: 'RANKING GLOBAL',
                desc: 'Una lista. Tu nombre. Tu posición actualizada en tiempo real. Cada misión completada mueve la aguja. Cada día perdido también.',
                wide: true,
              },
            ].map((f, i, arr) => {
              return (
                <div
                  key={f.num}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '60px 1fr' : '160px 1fr',
                    gap: isMobile ? 12 : 0,
                    padding: isMobile ? '28px 0' : '36px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                    borderRadius: 8,
                    cursor: 'default',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${f.color}06`;
                    e.currentTarget.style.paddingLeft = '16px';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.paddingLeft = '0';
                  }}
                >
                  {/* Massive outlined number */}
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isMobile ? 48 : 96,
                    lineHeight: 1,
                    color: 'transparent',
                    WebkitTextStroke: `1px ${f.color}55`,
                    userSelect: 'none',
                    paddingRight: isMobile ? 0 : 24,
                  }}>
                    {f.num}
                  </div>

                  {/* Feature content */}
                  <div style={{ display: 'flex', gap: isMobile ? 14 : 28, alignItems: 'center' }}>
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      flexShrink: 0,
                    }}>
                      <f.icon size={24} color={f.color} strokeWidth={1.5} />
                      <div style={{ width: 20, height: 2, background: f.color, opacity: 0.5, borderRadius: 1 }} />
                    </div>
                    <div>
                      <div style={{
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 700,
                        fontSize: 22,
                        letterSpacing: '0.08em',
                        color: 'var(--text)',
                        marginBottom: 6,
                      }}>
                        {f.title}
                      </div>
                      <p style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 15,
                        color: 'var(--text-secondary)',
                        lineHeight: 1.6,
                        maxWidth: 560,
                      }}>
                        {f.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terrain: void → panel */}
      <div style={{ background: 'var(--void)', lineHeight: 0, marginBottom: -1 }}>
        <PixelTerrain fillColor="#131722" />
      </div>

      {/* ═══ ATTRIBUTES SPLIT SECTION ═══════════════════════════ */}
      <section style={{
        padding: isMobile ? '64px 24px' : '96px 60px',
        background: 'var(--panel)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background diagonal accent */}
        <div style={{
          position: 'absolute',
          top: -100, right: -100,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(51,209,255,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 48 : 72, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--cyan)', marginBottom: 16 }}>
              TUS ATRIBUTOS
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 5.5vw, 72px)',
              color: 'var(--text)',
              lineHeight: 0.92,
              marginBottom: 24,
            }}>
              TRES PILARES.
              <br />
              <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>
                UN JUGADOR.
              </span>
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32 }}>
              Cuerpo fuerte, mente disciplinada, finanzas sólidas.
              En ASCEND los tres crecen juntos — o se atrofian juntos.
              Tú decides.
            </p>
            <Link to="/dashboard" className="btn btn-cyan btn-lg" style={{ display: 'inline-flex' }}>
              Comenzar Ahora <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'SALUD', icon: Shield, color: 'var(--green)', val: 78, desc: 'Entrena. Aliméntate. Descansa. Tu cuerpo es tu arma principal.' },
              { label: 'DINERO', icon: DollarSign, color: 'var(--gold)', val: 62, desc: 'Ahorra, invierte, aprende. Tu riqueza es tu libertad futura.' },
              { label: 'DISCIPLINA', icon: Zap, color: 'var(--violet)', val: 91, desc: 'Mantén la racha. Sin excusas. La consistencia vence al talento.' },
            ].map(attr => (
              <div
                key={attr.label}
                className="clip-angular-tr"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 18,
                  padding: '18px 22px',
                  background: 'var(--void)',
                  border: `1px solid ${attr.color}2A`,
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${attr.color}66`;
                  e.currentTarget.style.background = `${attr.color}08`;
                  e.currentTarget.style.transform = 'translateX(6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = `${attr.color}2A`;
                  e.currentTarget.style.background = 'var(--void)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 5, flexShrink: 0, paddingRight: 4,
                }}>
                  <attr.icon size={22} color={attr.color} strokeWidth={1.5} />
                  <div style={{ width: 22, height: 2, background: attr.color, opacity: 0.45 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', color: attr.color }}>
                      {attr.label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: attr.color }}>{attr.val}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ width: `${attr.val}%`, height: '100%', background: attr.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>{attr.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Terrain: panel → void */}
      <div style={{ background: 'var(--panel)', lineHeight: 0, marginBottom: -1 }}>
        <PixelTerrain fillColor="#0A0B10" flip />
      </div>

      {/* ═══ RANKING PREVIEW ════════════════════════════════════ */}
      <section id="ranking-preview" style={{ padding: isMobile ? '72px 24px' : '120px 60px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: 16 }}>
            COMPETENCIA REAL
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(52px, 7vw, 88px)',
            color: 'var(--text)',
            lineHeight: 0.92,
            marginBottom: 16,
          }}>
            ¿DÓNDE{' '}
            <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.35)' }}>
              ESTÁS TÚ?
            </span>
          </h2>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-muted)', marginBottom: 56 }}>
            El ranking actualiza en tiempo real. Cada misión completada mueve posiciones.
          </p>

          {/* Leaderboard preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 620, margin: '0 auto 48px' }}>
            {[
              { pos: '🥇', name: 'DARKSTAR_X', level: 31, xp: '78.4K', color: 'var(--gold)', glow: 'var(--gold-glow)' },
              { pos: '🥈', name: 'RYUU_ALPHA', level: 29, xp: '65.2K', color: '#C0C0C0', glow: 'rgba(192,192,192,0.3)' },
              { pos: '🥉', name: 'NOVA_PRIME', level: 27, xp: '58.9K', color: '#CD7F32', glow: 'rgba(205,127,50,0.3)' },
              { pos: '#?', name: 'TÚ',         level: '??', xp: '???', color: 'var(--violet)', glow: 'var(--violet-glow)', isMe: true },
            ].map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '14px 22px',
                  background: entry.isMe ? 'var(--violet-dim)' : 'var(--panel)',
                  border: `1px solid ${entry.isMe ? 'rgba(124,92,255,0.4)' : 'var(--border)'}`,
                  borderLeft: `3px solid ${entry.color}`,
                  borderRadius: entry.isMe ? 10 : 8,
                  boxShadow: entry.isMe ? `0 0 24px ${entry.glow}` : 'none',
                  animation: entry.isMe ? 'breathe 3s ease-in-out infinite' : 'none',
                  transition: 'var(--transition)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, width: 40, textAlign: 'center', color: entry.color }}>
                  {entry.pos}
                </div>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: entry.isMe ? 'var(--violet)' : 'var(--surface)',
                  border: `2px solid ${entry.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'white',
                }}>
                  {entry.isMe ? '?' : entry.name.slice(0, 2)}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: entry.isMe ? 'var(--violet)' : 'var(--text)', letterSpacing: '0.05em' }}>
                    {entry.name}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}>LVL {entry.level}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: entry.color }}>
                  {entry.xp} XP
                </div>
              </div>
            ))}
          </div>

          <Link to="/dashboard" className="btn btn-gold btn-lg" style={{ display: 'inline-flex' }}>
            Tomar Mi Posición <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Terrain: void → panel */}
      <div style={{ background: 'var(--void)', lineHeight: 0, marginBottom: -1 }}>
        <PixelTerrain fillColor="#131722" />
      </div>

      {/* ═══ PRE-FOOTER CTA ═════════════════════════════════════ */}
      <section style={{
        padding: isMobile ? '72px 24px' : '110px 60px',
        background: 'var(--panel)',
        borderTop: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage:
            'linear-gradient(rgba(124,92,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.045) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }} />
        {/* Top center glow */}
        <div style={{
          position: 'absolute', top: -80, left: '15%', right: '15%', height: 220,
          background: 'radial-gradient(ellipse, rgba(124,92,255,0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        {/* Bottom-right cyan accent */}
        <div style={{
          position: 'absolute', bottom: -60, right: -40, width: 320, height: 320,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(51,209,255,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
            marginBottom: 28,
          }}>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, var(--violet))' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--violet)' }}>
              EL MOMENTO ES AHORA
            </span>
            <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, var(--cyan), transparent)' }} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(56px, 8vw, 120px)',
            lineHeight: 0.88, marginBottom: 28,
          }}>
            <div style={{ color: 'var(--text)' }}>¿LISTO PARA</div>
            <div style={{
              background: 'linear-gradient(90deg, var(--violet), var(--cyan))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              ASCENDER?
            </div>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-secondary)',
            maxWidth: 460, margin: '0 auto 36px', lineHeight: 1.75,
          }}>
            Únete a los jugadores que ya convirtieron su vida cotidiana en la partida más importante. Sin excusas.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary btn-lg">
              Empezar Gratis <ArrowRight size={17} />
            </Link>
            <a href="#features" className="btn btn-outline btn-lg">
              Ver Características
            </a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════ */}
      <footer style={{ background: 'var(--void)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>

        {/* Gradient scan line at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: 'linear-gradient(90deg, transparent 0%, var(--violet) 35%, var(--cyan) 65%, transparent 100%)',
          opacity: 0.45,
        }} />

        {/* Main columns */}
        <div style={{
          padding: isMobile ? '48px 24px 36px' : '64px 60px 52px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1.6fr 1fr 1fr 1.4fr',
          gap: isMobile ? 36 : 52,
        }}>

          {/* ── Col 1: Brand ── */}
          <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
            <div style={{ marginBottom: 18 }}>
              <GlitchText as="div" style={{
                fontFamily: 'var(--font-display)', fontSize: 26,
                letterSpacing: '0.22em', color: 'var(--text)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{
                  display: 'inline-flex', width: 5, height: 24, flexShrink: 0,
                  background: 'linear-gradient(180deg, var(--violet), var(--cyan))',
                  borderRadius: 2,
                }} />
                ASCEND
              </GlitchText>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--text-muted)', lineHeight: 1.8,
              marginBottom: 26, maxWidth: 250,
            }}>
              Convierte tu vida en una partida. Gana XP. Sube de nivel. Domina los tres atributos que definen quién eres.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { label: 'SALUD', color: 'var(--green)' },
                { label: 'DINERO', color: 'var(--gold)' },
                { label: 'DISCIPLINA', color: 'var(--violet)' },
              ].map(a => (
                <div key={a.label} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px',
                  background: `${a.color}10`,
                  border: `1px solid ${a.color}28`,
                  borderRadius: 20,
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: a.color, boxShadow: `0 0 6px ${a.color}`,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 8,
                    letterSpacing: '0.15em', color: a.color,
                  }}>
                    {a.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 2: Navigation ── */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em',
              color: 'var(--text-muted)', marginBottom: 18,
              paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              NAVEGACIÓN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { label: 'Inicio', href: '#' },
                { label: 'Características', href: '#features' },
                { label: 'Ranking', href: '#ranking-preview' },
              ].map(item => (
                <a key={item.label} href={item.href} style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                  color: 'var(--text-secondary)', textDecoration: 'none',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'color 0.2s, gap 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.gap = '12px'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.gap = '8px'; }}
                >
                  <span style={{ width: 14, height: 1, background: 'var(--border)', display: 'inline-block', flexShrink: 0 }} />
                  {item.label}
                </a>
              ))}
              <Link to="/dashboard" style={{
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                color: 'var(--text-secondary)', textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'color 0.2s, gap 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--cyan)'; e.currentTarget.style.gap = '12px'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.gap = '8px'; }}
              >
                <span style={{ width: 14, height: 1, background: 'var(--cyan)', opacity: 0.5, display: 'inline-block', flexShrink: 0 }} />
                Dashboard →
              </Link>
            </div>
          </div>

          {/* ── Col 3: Misiones ── */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em',
              color: 'var(--text-muted)', marginBottom: 18,
              paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              MISIONES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[
                { label: 'Salud', color: 'var(--green)' },
                { label: 'Dinero', color: 'var(--gold)' },
                { label: 'Disciplina', color: 'var(--violet)' },
                { label: 'Legendarias', color: 'var(--cyan)' },
              ].map(item => (
                <div key={item.label} style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                  color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{
                    width: 14, height: 1, background: item.color,
                    opacity: 0.5, display: 'inline-block', flexShrink: 0,
                  }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 4: Manifiesto ── */}
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.3em',
              color: 'var(--text-muted)', marginBottom: 18,
              paddingBottom: 10, borderBottom: '1px solid var(--border)',
            }}>
              MANIFIESTO
            </div>
            <div style={{ borderLeft: '2px solid var(--violet)', paddingLeft: 16, marginBottom: 24 }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: 'var(--text-secondary)', lineHeight: 1.9,
                fontStyle: 'italic',
              }}>
                "La diferencia entre quien eres y quien quieres ser está en lo que haces cada día."
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Salud', color: 'var(--green)', desc: 'Tu cuerpo es tu base' },
                { label: 'Dinero', color: 'var(--gold)', desc: 'Tu libertad futura' },
                { label: 'Disciplina', color: 'var(--violet)', desc: 'Tu ventaja real' },
              ].map(attr => (
                <div key={attr.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: attr.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: attr.color }}>{attr.label}</span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>— {attr.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: isMobile ? '16px 24px' : '18px 60px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: isMobile ? 8 : 0,
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
            © 2026 ASCEND. Todos los derechos reservados.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--green)', boxShadow: '0 0 8px var(--green)',
              animation: 'pulse-glow 2s ease-in-out infinite',
            }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.2em', color: 'var(--green)' }}>
              SISTEMA ACTIVO
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)' }}>
            © 2026 Hecho para los que actúan.
          </div>
        </div>
      </footer>
    </div>
  );
}
