import { useBreakpoint } from '../../../hooks/useBreakpoint';
import LeftPanel from './LeftPanel';
import MobileHeader from './MobileHeader';

export { AuthInput } from './AuthInput';
export { AuthButton } from './AuthButton';

export default function AuthLayout({ children, variant = 'login' }) {
  const isMobile = useBreakpoint(960);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0B10' }}>
      {!isMobile && <LeftPanel variant={variant} />}

      {/* Right: form area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '32px 24px 48px' : '60px 64px',
        overflowY: 'auto', minHeight: '100vh', position: 'relative',
      }}>
        {/* Ambient glow */}
        <div style={{
          position: 'fixed', top: -100, right: -80,
          width: 440, height: 440,
          background: 'radial-gradient(circle, rgba(124,92,255,0.05) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {isMobile && <MobileHeader variant={variant} />}
        {children}
      </div>
    </div>
  );
}
