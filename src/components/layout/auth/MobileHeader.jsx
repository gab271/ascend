import { Link } from 'react-router-dom';
import LogoMark from '../../icons/LogoMark';

const VARIANT_META = {
  register: { accent: '#33D1FF', label: '// ACTIVACIÓN DE NUEVO OPERADOR', gradient: 'linear-gradient(90deg, #33D1FF, #33E6A1, transparent)' },
  forgot:   { accent: '#F5C451', label: '// PROTOCOLO DE RECUPERACIÓN',    gradient: 'linear-gradient(90deg, #F5C451, #FF8A3D, transparent)'  },
  login:    { accent: '#7C5CFF', label: '// PROTOCOLO DE RECONEXIÓN',       gradient: 'linear-gradient(90deg, #7C5CFF, #33D1FF, transparent)'  },
};

export default function MobileHeader({ variant = 'login' }) {
  const meta = VARIANT_META[variant] || VARIANT_META.login;

  return (
    <div style={{
      position: 'relative', marginBottom: 36,
      paddingBottom: 24, borderBottom: '1px solid rgba(42,51,82,0.7)',
    }}>
      <div style={{
        position: 'absolute', top: -24, left: -24, right: -24, height: 2,
        background: meta.gradient,
      }} />
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
        <LogoMark size={22} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.3em', color: '#F5F7FB' }}>ASCEND</span>
      </Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(74,90,122,0.8)', letterSpacing: '0.14em' }}>
        {meta.label}
      </div>
    </div>
  );
}
