import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../../hooks/useLanguage';

// ⚠️ EDIT BEFORE PUBLISHING — these are legally required identifiers.
//
// Spain's LSSI-CE (Ley 34/2002) Art. 10 requires any provider of information
// society services to publish, permanently and in an easily accessible way:
// name, address, email, tax ID (NIF/NIE), and — if registered — commercial
// registry details. GDPR Art. 13 separately requires identifying the data
// controller. Placeholders here do not satisfy either.
//
// NOTE FOR THE DEVELOPER (not shown to users): these documents are drafted to
// describe ASCEND accurately, but they have not been reviewed by a lawyer.
// Get them reviewed before you take a single euro from anyone — see
// docs/legal-notes.md.
export const OPERATOR = {
  name:     '[YOUR FULL LEGAL NAME OR COMPANY NAME]',
  email:    '[YOUR CONTACT EMAIL]',
  address:  '[YOUR ADDRESS — municipality and province is normally sufficient for a sole trader]',
  taxId:    '[YOUR NIF / NIE]',
  country:  'Spain',
};

export const LAST_UPDATED = '2026-07-20';

// Shared shell: back link, title, updated date, and readable prose column.
export default function LegalLayout({ title, subtitle, sections }) {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--void)', padding: '48px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <Link
          to="/"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em',
            color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 36,
          }}
        >
          <ArrowLeft size={14} /> {isEs ? 'VOLVER' : 'BACK'}
        </Link>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(30px, 6vw, 46px)',
          lineHeight: 1.05, letterSpacing: '0.02em',
          color: 'var(--text)', margin: '0 0 12px',
        }}>
          {title}
        </h1>

        {subtitle && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.7,
            color: 'var(--text-muted)', margin: '0 0 8px',
          }}>
            {subtitle}
          </p>
        )}

        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
          color: 'rgba(139,154,179,0.5)', marginBottom: 40,
        }}>
          {isEs ? 'ÚLTIMA ACTUALIZACIÓN' : 'LAST UPDATED'}: {LAST_UPDATED}
        </div>

        {sections.map((s, i) => (
          <section key={i} style={{ marginBottom: 34 }}>
            {s.heading && (
              <h2 style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700,
                fontSize: 15, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: 'var(--text)', margin: '0 0 14px',
              }}>
                {s.heading}
              </h2>
            )}
            {s.body.map((p, j) =>
              Array.isArray(p) ? (
                <ul key={j} style={{
                  margin: '0 0 14px', paddingLeft: 20,
                  fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.8,
                  color: 'var(--text-secondary)',
                }}>
                  {p.map((li, k) => <li key={k} style={{ marginBottom: 6 }}>{li}</li>)}
                </ul>
              ) : (
                <p key={j} style={{
                  fontFamily: 'var(--font-body)', fontSize: 14.5, lineHeight: 1.8,
                  color: 'var(--text-secondary)', margin: '0 0 14px',
                }}>
                  {p}
                </p>
              )
            )}
          </section>
        ))}

        <div style={{
          borderTop: '1px solid var(--border)', paddingTop: 22, marginTop: 48,
          display: 'flex', gap: 20, flexWrap: 'wrap',
        }}>
          {[
            { to: '/legal/notice',  en: 'Legal Notice', es: 'Aviso legal' },
            { to: '/legal/terms',   en: 'Terms of Use', es: 'Términos de uso' },
            { to: '/legal/privacy', en: 'Privacy',      es: 'Privacidad' },
            { to: '/legal/cookies', en: 'Cookies',      es: 'Cookies' },
          ].map(l => (
            <Link key={l.to} to={l.to} style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
              color: 'var(--text-muted)', textDecoration: 'none',
            }}>
              {isEs ? l.es : l.en}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
