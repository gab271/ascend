import { Link } from 'react-router-dom';
import LogoMark from '../../icons/LogoMark';

export default function MobileHeader({ variant }) {
  const isRegister = variant === 'register';
  return (
    <div style={{
      position: 'relative', marginBottom: 36,
      paddingBottom: 24, borderBottom: '1px solid rgba(42,51,82,0.7)',
    }}>
      <div style={{
        position: 'absolute', top: -24, left: -24, right: -24, height: 2,
        background: isRegister
          ? 'linear-gradient(90deg, #33D1FF, #33E6A1, transparent)'
          : 'linear-gradient(90deg, #7C5CFF, #33D1FF, transparent)',
      }} />
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
        <LogoMark size={22} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, letterSpacing: '0.3em', color: '#F5F7FB' }}>ASCEND</span>
      </Link>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'rgba(74,90,122,0.8)', letterSpacing: '0.14em' }}>
        {isRegister ? '// ACTIVACIÓN DE NUEVO OPERADOR' : '// PROTOCOLO DE RECONEXIÓN'}
      </div>
    </div>
  );
}
