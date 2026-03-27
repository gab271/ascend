export default function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? 'var(--violet)' : 'var(--surface-2)',
        border: `1px solid ${value ? 'rgba(124,92,255,0.7)' : 'var(--border)'}`,
        position: 'relative', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: value ? '0 0 12px rgba(124,92,255,0.35)' : 'none',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: value ? '#fff' : 'var(--border-bright)',
        transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: value ? '0 0 6px rgba(124,92,255,0.5)' : 'none',
      }} />
    </div>
  );
}
