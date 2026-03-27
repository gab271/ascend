import { Crown } from 'lucide-react';

export default function PodiumCard({ user, position }) {
  const config = {
    1: { color: 'var(--gold)', glow: 'var(--gold-glow)', size: 80, emoji: '🥇', marginTop: 0 },
    2: { color: '#C0C0C0',    glow: 'rgba(192,192,192,0.3)', size: 70, emoji: '🥈', marginTop: 32 },
    3: { color: '#CD7F32',    glow: 'rgba(205,127,50,0.3)',  size: 70, emoji: '🥉', marginTop: 48 },
  }[position];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      flex: position === 1 ? 1.2 : 1,
      marginTop: config.marginTop,
    }}>
      <div style={{ fontSize: 28 }}>{config.emoji}</div>

      <div style={{ position: 'relative' }}>
        {position === 1 && (
          <div style={{
            position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 22,
          }}>
            <Crown size={22} color="var(--gold)" />
          </div>
        )}
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 20px ${config.glow}`,
          animation: position === 1 ? 'breathe 3s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          width: config.size, height: config.size, borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.color}44, ${config.color}22)`,
          border: `2px solid ${config.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: config.size * 0.38, color: config.color,
        }}>
          {user.username.slice(0, 2)}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700,
          fontSize: position === 1 ? 16 : 14,
          letterSpacing: '0.06em',
          color: user.isMe ? 'var(--violet)' : 'var(--text)',
          marginBottom: 3,
        }}>
          {user.username}
        </div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: config.color, letterSpacing: '0.08em', marginBottom: 4 }}>
          {user.title}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: position === 1 ? 22 : 18, color: config.color }}>
          LVL {user.level}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {user.xp.toLocaleString()} XP
        </div>
      </div>

      <div style={{
        width: '80%',
        height: position === 1 ? 56 : position === 2 ? 40 : 24,
        background: `linear-gradient(180deg, ${config.color}33, ${config.color}11)`,
        border: `1px solid ${config.color}44`,
        borderRadius: '8px 8px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontSize: 20, color: config.color,
      }}>
        {position}
      </div>
    </div>
  );
}
