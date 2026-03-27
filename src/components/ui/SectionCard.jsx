export default function SectionCard({ moduleId, title, status = 'ACTIVO', statusColor = 'var(--green)', children, style }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        padding: '14px 22px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(26,32,53,0.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--text-muted)', letterSpacing: '0.14em',
          }}>
            {moduleId}
          </span>
          <div style={{ width: 1, height: 12, background: 'var(--border-bright)', opacity: 0.5 }} />
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: statusColor, letterSpacing: '0.16em',
          }}>
            {status}
          </span>
        </div>
      </div>
      <div style={{ padding: '22px 22px' }}>
        {children}
      </div>
    </div>
  );
}
