import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import NotificationBell from './NotificationBell';
import { useLanguage } from '../../hooks/useLanguage';

function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {['en', 'es'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: '4px 10px',
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: lang === l ? 'var(--void)' : 'var(--text-muted)',
            background: lang === l ? 'var(--violet)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.18s',
            textTransform: 'uppercase',
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function AppLayout() {
  const location = useLocation();
  const { t, lang } = useLanguage();
  const title = t(`pages.${location.pathname}`) || 'ASCEND';

  const dateLocale = lang === 'es' ? 'es-ES' : 'en-US';

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

          {/* Right side: lang toggle + date + notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LangToggle />

            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text-muted)',
            }}>
              {new Date().toLocaleDateString(dateLocale, {
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
