import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
  const [navOpen, setNavOpen] = useState(false);

  const dateLocale = lang === 'es' ? 'es-ES' : 'en-US';

  // Close the drawer whenever the route changes, otherwise tapping a nav item
  // navigates but leaves the drawer covering the page you just opened.
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

  // Escape closes it — cheap keyboard affordance.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="app-layout">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {/* Only rendered (via CSS) below 768px */}
      {navOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="app-content">
        {/* Top bar */}
        <div className="app-topbar" style={{
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {/* Hamburger — mobile only. Without this the nav is unreachable
                on a phone, since the sidebar sits off-canvas. */}
            <button
              className="mobile-only"
              onClick={() => setNavOpen(v => !v)}
              aria-label="Menu"
              aria-expanded={navOpen}
              style={{
                display: 'none',            // .mobile-only flips this to flex
                alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text)',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.1em',
              color: 'var(--text)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {title}
            </div>
          </div>

          {/* Right side: lang toggle + date + notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <LangToggle />

            {/* The full written date eats the whole bar on a phone. */}
            <div className="desktop-only" style={{ width: 1, height: 20, background: 'var(--border)' }} />

            <div className="desktop-only" style={{
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
        <div className="app-page-pad" style={{ padding: '32px' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
