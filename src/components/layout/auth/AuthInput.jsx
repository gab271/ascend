export function AuthInput({
  label, type = 'text', value, onChange,
  icon, placeholder, focused, onFocus, onBlur,
  suffix, delay = 0, error = false,
}) {
  const accent     = error ? '#FF4D6A' : '#7C5CFF';
  const borderCol  = error ? 'rgba(255,77,106,0.5)'
    : focused ? 'rgba(124,92,255,0.55)' : 'rgba(42,51,82,0.9)';
  const labelCol   = error ? '#FF4D6A'
    : focused ? '#7C5CFF' : 'rgba(160,174,203,0.5)';
  const iconCol    = error ? '#FF4D6A'
    : focused ? '#7C5CFF' : 'rgba(100,120,160,0.65)';
  const bgCol      = focused ? 'rgba(124,92,255,0.035)' : 'rgba(10,11,16,0.45)';
  const shadow     = focused
    ? `0 0 0 1px rgba(124,92,255,0.22), 0 8px 28px rgba(124,92,255,0.07)`
    : 'none';

  return (
    <div style={{
      marginBottom: 22,
      animation: `entry-up 0.5s ease ${delay}s forwards`,
      opacity: 0,
      animationFillMode: 'forwards',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: 'var(--font-mono)', fontSize: 9,
        letterSpacing: '0.2em', textTransform: 'uppercase',
        color: labelCol, marginBottom: 8,
        transition: 'color 0.25s', userSelect: 'none',
      }}>
        <span style={{
          display: 'inline-block', width: 4, height: 4,
          background: (focused || error) ? accent : 'rgba(74,90,122,0.5)',
          transform: 'rotate(45deg)', transition: 'background 0.25s', flexShrink: 0,
        }} />
        {label}
        {focused && !error && (
          <span style={{ animation: 'blink-cursor 1s step-end infinite', color: '#7C5CFF', marginLeft: 1 }}>_</span>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: bgCol,
        border: `1px solid ${borderCol}`,
        borderLeft: `2px solid ${(focused || error) ? accent : 'rgba(42,51,82,0.9)'}`,
        padding: '0 14px 0 14px',
        height: 54,
        transition: 'all 0.25s ease',
        boxShadow: shadow,
        position: 'relative',
      }}>
        {icon && (
          <span style={{ color: iconCol, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.25s' }}>
            {icon}
          </span>
        )}
        <input
          className="auth-input-field"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 15,
            color: '#F5F7FB', letterSpacing: '0.03em',
          }}
        />
        {suffix}
      </div>
    </div>
  );
}
