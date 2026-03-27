export default function WeeklyChart({ data }) {
  const max = Math.max(...data);
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
      {data.map((val, i) => {
        const isToday = i === todayIdx;
        const h = Math.max((val / max) * 100, 8);
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: '100%', height: 55, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: '100%', height: `${h}%`,
                background: isToday ? 'linear-gradient(180deg, var(--cyan), var(--violet))' : 'var(--surface)',
                borderRadius: '3px 3px 0 0',
                border: isToday ? '1px solid var(--cyan)' : '1px solid var(--border)',
                boxShadow: isToday ? '0 0 10px var(--cyan-glow)' : 'none',
                minHeight: 4, transition: 'height 0.8s ease',
              }} />
            </div>
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700,
              letterSpacing: '0.05em',
              color: isToday ? 'var(--cyan)' : 'var(--text-muted)',
            }}>
              {days[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
