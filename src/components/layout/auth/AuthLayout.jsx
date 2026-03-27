import { useBreakpoint } from '../../../hooks/useBreakpoint';
import LeftPanel from './LeftPanel';
import MobileHeader from './MobileHeader';

export { AuthInput } from './AuthInput';
export { AuthButton } from './AuthButton';

export default function AuthLayout({ children, variant = 'login' }) {
  const isMobile = useBreakpoint(960);

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', overflow: 'hidden', background: 'var(--void)' }}>
      {!isMobile && <LeftPanel variant={variant} />}

      {/* Right: form panel */}
      <div style={{
        width: isMobile ? '100%' : 440,
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#0E0F17',
        padding: isMobile ? '40px 24px 60px' : '56px 44px',
        position: 'relative',
      }}>
        {/* Left border separator */}
        {!isMobile && (
          <div style={{
            position: 'absolute', top: 0, left: 0, bottom: 0, width: 1,
            background: 'rgba(42,51,82,0.5)',
            pointerEvents: 'none',
          }} />
        )}

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', bottom: -80, right: -60,
          width: 320, height: 320,
          background: 'radial-gradient(circle, rgba(124,92,255,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {isMobile && <MobileHeader variant={variant} />}

        <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
