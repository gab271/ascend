export default function LogoMark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
      <defs>
        <linearGradient id="logo_lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="100%" stopColor="#33D1FF" />
        </linearGradient>
      </defs>
      <polygon points="14,2 26,14 14,26 2,14" stroke="url(#logo_lg)" strokeWidth="1.5" fill="rgba(124,92,255,0.1)" />
      <polyline points="9,17 14,9 19,17" stroke="url(#logo_lg)" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="14" y1="9" x2="14" y2="20" stroke="url(#logo_lg)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
