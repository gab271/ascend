import { useState } from 'react';
import { ranking } from '../data/mockData';
import { TrendingUp, TrendingDown, Minus, Crown, Zap } from 'lucide-react';

function ChangeIndicator({ change }) {
  if (change === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)' }}>
      <Minus size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>—</span>
    </div>
  );
  if (change > 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--green)' }}>
      <TrendingUp size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>+{change}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--red)' }}>
      <TrendingDown size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{change}</span>
    </div>
  );
}

// Top 3 podium display
function PodiumCard({ user, position }) {
  const config = {
    1: { color: 'var(--gold)', glow: 'var(--gold-glow)', size: 80, label: '1°', emoji: '🥇', marginTop: 0 },
    2: { color: '#C0C0C0', glow: 'rgba(192,192,192,0.3)', size: 70, label: '2°', emoji: '🥈', marginTop: 32 },
    3: { color: '#CD7F32', glow: 'rgba(205,127,50,0.3)', size: 70, label: '3°', emoji: '🥉', marginTop: 48 },
  }[position];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
      flex: position === 1 ? 1.2 : 1,
      marginTop: config.marginTop,
    }}>
      {/* Position emoji */}
      <div style={{ fontSize: 28 }}>{config.emoji}</div>

      {/* Avatar with glow */}
      <div style={{ position: 'relative' }}>
        {position === 1 && (
          <div style={{
            position: 'absolute',
            top: -18,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: 22,
          }}>
            <Crown size={22} color="var(--gold)" />
          </div>
        )}
        <div style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 20px ${config.glow}`,
          animation: position === 1 ? 'breathe 3s ease-in-out infinite' : 'none',
        }} />
        <div style={{
          width: config.size,
          height: config.size,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${config.color}44, ${config.color}22)`,
          border: `2px solid ${config.color}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-display)',
          fontSize: config.size * 0.38,
          color: config.color,
        }}>
          {user.username.slice(0, 2)}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: position === 1 ? 16 : 14,
          letterSpacing: '0.06em',
          color: user.isMe ? 'var(--violet)' : 'var(--text)',
          marginBottom: 3,
        }}>
          {user.username}
        </div>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 11,
          color: config.color,
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}>
          {user.title}
        </div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: position === 1 ? 22 : 18,
          color: config.color,
        }}>
          LVL {user.level}
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text-muted)',
        }}>
          {user.xp.toLocaleString()} XP
        </div>
      </div>

      {/* Pedestal */}
      <div style={{
        width: '80%',
        height: position === 1 ? 56 : position === 2 ? 40 : 24,
        background: `linear-gradient(180deg, ${config.color}33, ${config.color}11)`,
        border: `1px solid ${config.color}44`,
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        color: config.color,
      }}>
        {position}
      </div>
    </div>
  );
}

export default function Ranking() {
  const [period, setPeriod] = useState('week');
  const myPosition = ranking.findIndex(u => u.isMe) + 1;

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div>
      {/* My rank banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--violet-dim), rgba(51,209,255,0.08))',
        border: '1px solid rgba(124,92,255,0.4)',
        borderRadius: 14,
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        boxShadow: '0 4px 24px var(--violet-glow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            color: 'var(--violet)',
            lineHeight: 1,
          }}>
            #{myPosition}
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--text-muted)',
              marginBottom: 2,
            }}>
              TU POSICIÓN
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 16,
              color: 'var(--violet)',
              letterSpacing: '0.05em',
            }}>
              GABRIEL_X
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>NIVEL</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--cyan)' }}>24</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>XP TOTAL</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--violet)' }}>48.2K</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>CAMBIO</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green)' }}>↑3</div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
        }}>
          CLASIFICACIÓN GLOBAL
        </div>
        <div style={{
          display: 'flex',
          gap: 6,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 4,
        }}>
          {['week', 'month', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '5px 14px',
                borderRadius: 6,
                fontFamily: 'var(--font-ui)',
                fontWeight: 700,
                fontSize: 11,
                letterSpacing: '0.1em',
                color: period === p ? 'white' : 'var(--text-muted)',
                background: period === p ? 'var(--violet)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'var(--transition)',
                textTransform: 'uppercase',
              }}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Total'}
            </button>
          ))}
        </div>
      </div>

      {/* ─── PODIUM ─── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--panel), var(--void))',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '40px 40px 0',
        marginBottom: 24,
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Background rays */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(ellipse at top, rgba(245,196,81,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 11,
          letterSpacing: '0.3em',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          TOP JUGADORES
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: 24,
          position: 'relative',
        }}>
          <PodiumCard user={top3[1]} position={2} />
          <PodiumCard user={top3[0]} position={1} />
          <PodiumCard user={top3[2]} position={3} />
        </div>
      </div>

      {/* ─── REST OF RANKING ─── */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 120px 120px 80px 60px',
          gap: 8,
          padding: '12px 24px',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 10,
          letterSpacing: '0.15em',
          color: 'var(--text-muted)',
        }}>
          <span>POS</span>
          <span>JUGADOR</span>
          <span>TÍTULO</span>
          <span style={{ textAlign: 'right' }}>NIVEL</span>
          <span style={{ textAlign: 'right' }}>XP</span>
          <span style={{ textAlign: 'center' }}>CAMBIO</span>
        </div>

        {/* Rows */}
        {rest.map((user, i) => {
          const position = i + 4;
          return (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 120px 120px 80px 60px',
                gap: 8,
                padding: '14px 24px',
                borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                background: user.isMe ? 'var(--violet-dim)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => {
                if (!user.isMe) e.currentTarget.style.background = 'var(--surface)';
              }}
              onMouseLeave={e => {
                if (!user.isMe) e.currentTarget.style.background = 'transparent';
              }}
            >
              {/* Position */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                color: user.isMe ? 'var(--violet)' : 'var(--text-muted)',
              }}>
                {position}
              </div>

              {/* Player */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: user.isMe
                    ? 'linear-gradient(135deg, var(--violet), var(--cyan))'
                    : 'var(--surface)',
                  border: `2px solid ${user.isMe ? 'var(--violet)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 12,
                  color: 'white',
                  flexShrink: 0,
                }}>
                  {user.username.slice(0, 2)}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.05em',
                    color: user.isMe ? 'var(--violet)' : 'var(--text)',
                  }}>
                    {user.username}
                    {user.isMe && (
                      <span style={{
                        marginLeft: 8,
                        fontFamily: 'var(--font-ui)',
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        color: 'var(--violet)',
                        background: 'rgba(124,92,255,0.2)',
                        border: '1px solid rgba(124,92,255,0.4)',
                        borderRadius: 3,
                        padding: '1px 6px',
                      }}>
                        TÚ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: 'var(--text-secondary)',
              }}>
                {user.title}
              </div>

              {/* Level */}
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                color: 'var(--cyan)',
                textAlign: 'right',
              }}>
                {user.level}
              </div>

              {/* XP */}
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: user.isMe ? 'var(--violet)' : 'var(--text-muted)',
                textAlign: 'right',
              }}>
                {(user.xp / 1000).toFixed(1)}K
              </div>

              {/* Change */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ChangeIndicator change={user.change} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
