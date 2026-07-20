// Shown while auth is resolving.
//
// The guards used to `return null` here, which renders a completely blank page.
// That made "still loading" and "something is broken" visually identical — and
// cost real debugging time when the auth context once hung forever. Always
// render something.
export default function LoadingScreen({ label = 'LOADING' }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void, #0A0B10)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
    }}>
      <div style={{
        width: 34, height: 34,
        border: '2px solid var(--border, #2A3352)',
        borderTop: '2px solid var(--violet, #7C5CFF)',
        borderRadius: '50%',
        animation: 'spin-slow 0.8s linear infinite',
      }} />
      <div style={{
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        fontSize: 10,
        letterSpacing: '0.28em',
        color: 'var(--text-muted, #8B9AB3)',
      }}>
        {label}
      </div>
    </div>
  );
}
