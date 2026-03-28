import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Zap, Trophy, Flame, Star, Shield, Info } from 'lucide-react';

/* ── Type config ── */
const TYPE_CONFIG = {
  mission: { icon: Zap,     color: 'var(--violet)', bg: 'rgba(124,92,255,0.12)',  border: 'rgba(124,92,255,0.25)' },
  levelup: { icon: Trophy,  color: 'var(--gold)',   bg: 'rgba(245,196,81,0.10)',  border: 'rgba(245,196,81,0.25)' },
  streak:  { icon: Flame,   color: '#FF6B35',       bg: 'rgba(255,107,53,0.10)',  border: 'rgba(255,107,53,0.25)' },
  reward:  { icon: Star,    color: 'var(--cyan)',   bg: 'rgba(51,209,255,0.10)',  border: 'rgba(51,209,255,0.25)' },
  ranking: { icon: Shield,  color: 'var(--green)',  bg: 'rgba(51,230,161,0.10)',  border: 'rgba(51,230,161,0.25)' },
  system:  { icon: Info,    color: 'var(--text-muted)', bg: 'rgba(42,51,82,0.35)', border: 'rgba(42,51,82,0.6)' },
};

const INITIAL_NOTIFICATIONS = [];

function timeAgo(minutes) {
  if (minutes < 60)   return `hace ${minutes}m`;
  if (minutes < 1440) return `hace ${Math.floor(minutes / 60)}h`;
  return `hace ${Math.floor(minutes / 1440)}d`;
}

export default function NotificationBell() {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const panelRef = useRef(null);

  const unread = notifications.filter(n => !n.read).length;

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function onDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const markRead    = id => setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>

      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Notificaciones"
        style={{
          position: 'relative',
          width: 38, height: 38,
          borderRadius: 10,
          background: open ? 'var(--violet-dim)' : 'var(--surface)',
          border: `1px solid ${open ? 'rgba(124,92,255,0.45)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s',
          boxShadow: open ? '0 0 12px rgba(124,92,255,0.15)' : 'none',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.background = 'var(--surface-2)';
            e.currentTarget.style.borderColor = 'var(--border-bright)';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = 'var(--surface)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }
        }}
      >
        <Bell
          size={16}
          color={open ? 'var(--violet)' : 'var(--text-muted)'}
          style={unread > 0 && !open ? { animation: 'bell-ring 4s ease-in-out infinite' } : undefined}
        />

        {/* Unread badge */}
        {unread > 0 && (
          <div style={{
            position: 'absolute', top: -5, right: -5,
            minWidth: 17, height: 17,
            background: 'var(--violet)',
            borderRadius: 9,
            border: '2px solid var(--void)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 9,
            color: '#fff', padding: '0 3px',
            boxShadow: '0 0 10px var(--violet-glow)',
            lineHeight: 1,
          }}>
            {unread}
          </div>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          right: 0,
          width: 340,
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,92,255,0.06)',
          overflow: 'hidden',
          zIndex: 200,
          animation: 'notif-in 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>

          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '13px 16px',
            borderBottom: '1px solid var(--border)',
            background: 'rgba(26,32,53,0.45)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={12} color="var(--violet)" />
              <span style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.12em', color: 'var(--text)', textTransform: 'uppercase',
              }}>
                Notificaciones
              </span>
              {unread > 0 && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--violet)',
                  background: 'var(--violet-dim)', border: '1px solid rgba(124,92,255,0.3)',
                  borderRadius: 3, padding: '1px 6px', letterSpacing: '0.06em',
                }}>
                  {unread} nueva{unread > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em',
                  color: 'var(--text-muted)', background: 'none', border: 'none',
                  cursor: 'pointer', transition: 'color 0.15s', padding: '2px 0',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--cyan)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <CheckCheck size={11} />
                LEER TODO
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <Bell size={20} color="var(--text-muted)" />
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Sin notificaciones
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  Completa misiones para ver tu actividad
                </div>
              </div>
            ) : (
              notifications.map((n, idx) => {
                const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                const Icon = cfg.icon;
                const isLast = idx === notifications.length - 1;

                return (
                  <div
                    key={n.id}
                    onClick={() => markRead(n.id)}
                    style={{
                      display: 'flex', gap: 12, padding: '12px 16px 12px 20px',
                      borderBottom: isLast ? 'none' : '1px solid rgba(42,51,82,0.4)',
                      background: n.read ? 'transparent' : 'rgba(124,92,255,0.04)',
                      cursor: n.read ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(42,51,82,0.28)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(124,92,255,0.04)'; }}
                  >
                    {/* Unread indicator */}
                    {!n.read && (
                      <div style={{
                        position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'var(--violet)', boxShadow: '0 0 6px var(--violet)',
                      }} />
                    )}

                    {/* Type icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      alignSelf: 'flex-start', marginTop: 1,
                    }}>
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                        color: n.read ? 'var(--text-secondary)' : 'var(--text)',
                        letterSpacing: '0.03em', marginBottom: 3,
                      }}>
                        {n.title}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 11,
                        color: 'var(--text-muted)', lineHeight: 1.45,
                      }}>
                        {n.body}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 9,
                        color: 'rgba(74,90,122,0.6)', marginTop: 4, letterSpacing: '0.06em',
                      }}>
                        {timeAgo(n.minutesAgo)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel footer */}
          <div style={{
            padding: '9px 16px',
            borderTop: '1px solid var(--border)',
            background: 'rgba(10,11,16,0.35)',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'rgba(74,90,122,0.5)', letterSpacing: '0.15em',
            }}>
              // TIEMPO REAL — PRÓXIMAMENTE
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
