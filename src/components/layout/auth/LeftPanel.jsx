import { Link } from 'react-router-dom';
import LogoMark from '../../icons/LogoMark';

const CONTENT = {
  login: {
    heading: '¿No tienes\ncuenta?',
    desc: 'Crea tu cuenta gratis y empieza a construir mejores hábitos desde hoy.',
    link: '/register',
    linkText: 'Crear cuenta →',
  },
  register: {
    heading: '¿Ya tienes\ncuenta?',
    desc: 'Tu progreso sigue ahí. Entra y retoma donde lo dejaste.',
    link: '/login',
    linkText: 'Iniciar sesión →',
  },
  forgot: {
    heading: 'Recupera\ntu acceso',
    desc: 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
    link: '/login',
    linkText: '← Volver al login',
  },
};

export default function LeftPanel({ variant = 'login' }) {
  const c = CONTENT[variant] || CONTENT.login;
  const accent =
    variant === 'register' ? '#33D1FF' :
    variant === 'forgot'   ? '#F5C451' :
    '#7C5CFF';

  return (
    <div style={{
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── GIF background ───────────────────────────────────────── */}
      <img
        src="/loginvideoascend.gif"
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
        background: 'rgba(8,9,14,0.55)',
        pointerEvents: 'none',
      }} />

      {/* Bottom + top gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 25%, transparent 50%, rgba(0,0,0,0.65) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Right-edge fade into form panel */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '22%',
        background: 'linear-gradient(to left, #0E0F17, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Subtle accent glow at bottom */}
      <div style={{
        position: 'absolute', bottom: '-5%', left: '5%',
        width: 600, height: 400,
        background: `radial-gradient(circle, ${accent}18 0%, transparent 60%)`,
        pointerEvents: 'none',
        transition: 'background 0.7s',
        mixBlendMode: 'screen',
      }} />


{/* Scan sweep line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${accent}22, transparent)`,
        animation: 'scan-sweep 9s ease-in-out infinite',
        pointerEvents: 'none', zIndex: 3,
      }} />

      {/* ── Content ──────────────────────────────────────────────── */}
      <div style={{
        position: 'relative', zIndex: 4,
        height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '44px 52px 48px',
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={26} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, letterSpacing: '0.32em', color: '#F5F7FB' }}>ASCEND</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'rgba(74,90,122,0.55)', letterSpacing: '0.1em', marginTop: 2 }}>v1.0</span>
        </Link>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Bottom marketing copy */}
        <div style={{ animation: 'entry-up 0.7s ease 0.15s forwards', opacity: 0, animationFillMode: 'forwards' }}>

          {/* Accent mark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 36, height: 2, background: accent, boxShadow: `0 0 10px ${accent}70` }} />
            <div style={{ width: 6, height: 6, background: accent, transform: 'rotate(45deg)', opacity: 0.6 }} />
          </div>

          {/* Heading */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(50px, 4.6vw, 72px)',
            lineHeight: 0.92,
            letterSpacing: '0.01em',
            color: '#F5F7FB',
            marginBottom: 18,
            textShadow: '0 2px 40px rgba(0,0,0,0.7)',
            whiteSpace: 'pre-line',
          }}>
            {c.heading}
          </div>

          {/* Description */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'rgba(190,202,225,0.65)',
            lineHeight: 1.72,
            maxWidth: 340,
            marginBottom: 30,
          }}>
            {c.desc}
          </p>

          {/* CTA link */}
          <Link
            to={c.link}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: accent, textDecoration: 'none',
              textShadow: `0 0 14px ${accent}45`,
              borderBottom: `1px solid ${accent}28`,
              paddingBottom: 2,
              transition: 'gap 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderBottomColor = `${accent}70`;
              e.currentTarget.style.gap = '14px';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderBottomColor = `${accent}28`;
              e.currentTarget.style.gap = '8px';
            }}
          >
            {c.linkText}
          </Link>
        </div>
      </div>
    </div>
  );
}
