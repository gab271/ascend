import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Target, User, Trophy, Gift, Settings, LogOut, Zap } from 'lucide-react';
import { currentUser } from '../../data/mockData';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/missions', icon: Target, label: 'Misiones' },
  { to: '/ranking', icon: Trophy, label: 'Ranking' },
  { to: '/profile', icon: User, label: 'Perfil' },
  { to: '/rewards', icon: Gift, label: 'Inventario' },
];

// Mini avatar with initials
function Avatar({ username, size = 40 }) {
  const initials = username.slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: size * 0.35,
      color: 'white',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const xpPercent = (currentUser.xp / currentUser.xpNext) * 100;

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--panel)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      overflow: 'hidden',
    }}>

      {/* Logo */}
      <div style={{
        padding: '24px 24px 18px',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle animated background line */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0,
          height: '1px',
          width: '100%',
          background: 'linear-gradient(90deg, transparent, var(--violet), transparent)',
          animation: 'xp-shimmer 3s linear infinite',
          backgroundSize: '200% 100%',
        }} />

        {/* Glitch logo */}
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{
            width: 6,
            height: 26,
            background: 'linear-gradient(180deg, var(--violet), var(--cyan))',
            borderRadius: 2,
            flexShrink: 0,
          }} />
          {/* Base text */}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            letterSpacing: '0.22em',
            color: 'var(--text)',
            lineHeight: 1,
            position: 'relative',
            zIndex: 1,
          }}>
            ASCEND
          </span>
          {/* Chromatic layer 1 */}
          <span aria-hidden="true" style={{
            position: 'absolute',
            left: 14,
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            letterSpacing: '0.22em',
            color: '#33D1FF',
            lineHeight: 1,
            mixBlendMode: 'screen',
            animation: 'chromatic-1 9s ease-in-out infinite',
            userSelect: 'none',
          }}>
            ASCEND
          </span>
          {/* Chromatic layer 2 */}
          <span aria-hidden="true" style={{
            position: 'absolute',
            left: 14,
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            letterSpacing: '0.22em',
            color: '#FF4D6A',
            lineHeight: 1,
            mixBlendMode: 'screen',
            animation: 'chromatic-2 9s ease-in-out infinite',
            userSelect: 'none',
          }}>
            ASCEND
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.22em',
          color: 'var(--text-muted)',
          paddingLeft: 14,
        }}>
          SISTEMA v1.0
        </div>
      </div>

      {/* Player info */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ position: 'relative' }}>
            <Avatar username={currentUser.username} size={44} />
            {/* Level badge */}
            <div style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              background: 'var(--violet)',
              color: 'white',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 10,
              padding: '1px 5px',
              borderRadius: 3,
              border: '2px solid var(--panel)',
            }}>
              {currentUser.level}
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text)',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {currentUser.username}
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: 'var(--gold)',
              letterSpacing: '0.08em',
            }}>
              {currentUser.title}
            </div>
          </div>
        </div>

        {/* XP mini bar */}
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--text-muted)',
            marginBottom: 5,
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Zap size={10} color="var(--violet)" />
              XP
            </span>
            <span>{currentUser.xp.toLocaleString()} / {currentUser.xpNext.toLocaleString()}</span>
          </div>
          <div className="progress-track" style={{ height: 5 }}>
            <div
              className="progress-fill xp-fill"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.2em',
          color: 'var(--text-muted)',
          padding: '0 12px',
          marginBottom: 8,
        }}>
          MENÚ
        </div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 2,
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.05em',
              color: isActive ? 'white' : 'var(--text-secondary)',
              background: isActive ? 'var(--violet-dim)' : 'transparent',
              border: isActive ? '1px solid rgba(124,92,255,0.3)' : '1px solid transparent',
              transition: 'var(--transition)',
              textDecoration: 'none',
              position: 'relative',
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    background: 'var(--violet)',
                    borderRadius: '0 2px 2px 0',
                    boxShadow: '0 0 8px var(--violet)',
                  }} />
                )}
                <Icon
                  size={18}
                  color={isActive ? 'var(--violet)' : 'var(--text-muted)'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System status ticker */}
      <div style={{
        padding: '8px 0',
        borderTop: '1px solid var(--border)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text-muted)',
          letterSpacing: '0.1em',
          whiteSpace: 'nowrap',
          display: 'inline-block',
          animation: 'ticker-scroll 18s linear infinite',
        }}>
          {'// SISTEMA ACTIVO // XP: 48,230 // RACHA: 14 DÍAS // POSICIÓN: #5 //   '.repeat(3)}
        </div>
      </div>

      {/* Bottom section */}
      <div style={{
        padding: '12px',
        borderTop: '1px solid var(--border)',
      }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          width: '100%',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition)',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--text)';
          e.currentTarget.style.background = 'var(--surface)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        >
          <Settings size={18} />
          Configuración
        </button>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          width: '100%',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 14,
          color: 'var(--text-muted)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          transition: 'var(--transition)',
          letterSpacing: '0.05em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--red)';
          e.currentTarget.style.background = 'var(--red-dim)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
