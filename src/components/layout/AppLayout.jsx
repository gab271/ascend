import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/missions': 'Misiones',
  '/profile': 'Perfil',
  '/ranking': 'Ranking',
  '/rewards': 'Inventario',
  '/settings': 'Configuración',
};

export default function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'ASCEND';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        {/* Top bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(10, 11, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: '0.1em',
            color: 'var(--text)',
            textTransform: 'uppercase',
          }}>
            {title}
          </div>

          {/* Right side: date + notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }).toUpperCase()}
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            <NotificationBell />
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
