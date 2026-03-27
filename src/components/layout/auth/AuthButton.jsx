export function AuthButton({ loading, children, delay = 0, variant = 'violet' }) {
  const colors = {
    violet: { bg: 'linear-gradient(135deg, #8B6FFF 0%, #7C5CFF 50%, #6B4DFF 100%)', shadow: 'rgba(124,92,255,0.45)', hoverShadow: 'rgba(124,92,255,0.65)' },
    cyan:   { bg: 'linear-gradient(135deg, #22C5F5 0%, #33D1FF 50%, #0BB5EE 100%)', shadow: 'rgba(51,209,255,0.4)',  hoverShadow: 'rgba(51,209,255,0.6)'  },
  };
  const c = colors[variant] || colors.violet;

  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', height: 56,
        background: loading ? 'rgba(124,92,255,0.3)' : c.bg,
        border: 'none',
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
        color: '#fff',
        fontFamily: 'var(--font-display)',
        fontSize: 17, letterSpacing: '0.16em',
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: loading ? 'none' : `0 6px 28px ${c.shadow}, 0 2px 8px ${c.shadow}`,
        transition: 'box-shadow 0.3s, background 0.3s, transform 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        animation: `entry-up 0.5s ease ${delay}s forwards`,
        opacity: 0, animationFillMode: 'forwards',
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.boxShadow = `0 10px 40px ${c.hoverShadow}, 0 4px 14px ${c.shadow}`;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={e => {
        if (!loading) {
          e.currentTarget.style.boxShadow = `0 6px 28px ${c.shadow}, 0 2px 8px ${c.shadow}`;
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      {loading && (
        <span style={{ animation: 'spin-slow 0.7s linear infinite', display: 'inline-block', fontSize: 16, opacity: 0.8 }}>◌</span>
      )}
      {children}
    </button>
  );
}
