export default function HexLevel({ level, title }) {
  return (
    <div style={{ position: 'relative', width: 210, height: 230, flexShrink: 0 }}>
      {/* Outer rotating dashed ring */}
      <div style={{
        position: 'absolute', inset: -18, borderRadius: '50%',
        border: '1px dashed rgba(124,92,255,0.32)',
        animation: 'spin-slow 22s linear infinite',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: -5, left: '50%', transform: 'translateX(-50%)',
          width: 9, height: 9, borderRadius: '50%',
          background: 'var(--violet)', boxShadow: '0 0 14px var(--violet)',
        }} />
      </div>

      {/* Counter-rotating ring */}
      <div style={{
        position: 'absolute', inset: -35, borderRadius: '50%',
        border: '1px dashed rgba(51,209,255,0.14)',
        animation: 'spin-slow 38s linear infinite', animationDirection: 'reverse',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 6, borderRadius: '50%',
          background: 'var(--cyan)', boxShadow: '0 0 10px var(--cyan)',
        }} />
      </div>

      <svg width="210" height="230" viewBox="0 0 210 230" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        <defs>
          <filter id="hexglow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="numglow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="hexFill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C5CFF" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#33D1FF" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <polygon points="105,6 198,55 198,175 105,224 12,175 12,55" fill="none" stroke="rgba(124,92,255,0.7)" strokeWidth="1.5" filter="url(#hexglow)" />
        <polygon points="105,14 188,60 188,168 105,214 22,168 22,60" fill="url(#hexFill)" stroke="rgba(124,92,255,0.3)" strokeWidth="1" />
        <text x="105" y="82" textAnchor="middle" fontFamily="'Rajdhani', sans-serif" fontWeight="700" fontSize="13" fill="rgba(124,92,255,0.85)" letterSpacing="6">LVL</text>
        <text x="105" y="162" textAnchor="middle" fontFamily="'Bebas Neue', sans-serif" fontSize="100" fill="white" filter="url(#numglow)">{level}</text>
        <text x="105" y="202" textAnchor="middle" fontFamily="'Rajdhani', sans-serif" fontWeight="700" fontSize="11" fill="rgba(245,196,81,0.85)" letterSpacing="4">{title.toUpperCase()}</text>
      </svg>
    </div>
  );
}
