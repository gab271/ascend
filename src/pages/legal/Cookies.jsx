import LegalLayout, { OPERATOR } from './LegalLayout';
import { useLanguage } from '../../hooks/useLanguage';

// Accurate as of this build: ASCEND stores exactly two things in the browser,
// both strictly necessary. Verified against LanguageContext (`ascend_lang`) and
// the supabase-js session key. If you ever add analytics, this page must change
// AND you will need a consent banner.
export default function Cookies() {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  const en = [
    { heading: '1. The short version', body: [
      'ASCEND does not use advertising cookies, does not track you across other websites, and does not use third-party analytics such as Google Analytics.',
      'We store exactly two things in your browser, and both are strictly necessary for the app to work. Because of that, under Article 22.2 of Spain\'s LSSI-CE and the GDPR, no consent banner is required.',
    ]},
    { heading: '2. What we actually store', body: [
      'Technically these are not cookies but browser localStorage entries. The same rules apply, so we list them here for transparency:',
      [
        'sb-<project>-auth-token — your login session, issued by Supabase Auth. Without it you would be signed out on every page load. Removed when you sign out.',
        'ascend_lang — remembers whether you chose English or Spanish. Contains a single value: "en" or "es".',
      ],
      'That is the complete list. Neither is sent to any third party for advertising or profiling.',
    ]},
    { heading: '3. What we do NOT use', body: [
      [
        'Advertising or re-targeting cookies.',
        'Third-party analytics or heat-mapping.',
        'Social network tracking pixels (Meta, TikTok, X).',
        'Cross-site tracking identifiers of any kind.',
        'Fingerprinting.',
      ],
    ]},
    { heading: '4. Third-party services', body: [
      'ASCEND relies on Supabase (database and authentication) and Vercel (hosting). Both may set strictly technical cookies needed to deliver and secure the connection — for example load balancing and denial-of-service protection. They are not used to profile you.',
      'Videos on the landing page are served from our own hosting, not from YouTube or Vimeo, so no external player cookies are set.',
    ]},
    { heading: '5. Managing browser storage', body: [
      'You can clear this data at any time from your browser settings ("Clear browsing data" → "Cookies and other site data"), or by signing out, which removes the session token.',
      'Note that clearing the session token signs you out, and clearing the language preference resets the interface to English. Nothing else is affected: your missions, XP, streak and inventory live in the database, not in your browser.',
    ]},
    { heading: '6. If this changes', body: [
      'If we ever add analytics or any non-essential technology, we will update this page and show a proper consent banner beforehand — you will be able to refuse without losing access to the app.',
      `Questions: ${OPERATOR.email}`,
    ]},
  ];

  const es = [
    { heading: '1. Resumen', body: [
      'ASCEND no utiliza cookies publicitarias, no te rastrea en otras webs y no usa analítica de terceros como Google Analytics.',
      'Guardamos exactamente dos cosas en tu navegador, y ambas son estrictamente necesarias para que la aplicación funcione. Por ese motivo, conforme al artículo 22.2 de la LSSI-CE y al RGPD, no se requiere banner de consentimiento.',
    ]},
    { heading: '2. Qué guardamos realmente', body: [
      'Técnicamente no son cookies, sino entradas de localStorage del navegador. Se les aplican las mismas normas, así que las detallamos por transparencia:',
      [
        'sb-<proyecto>-auth-token — tu sesión de inicio, emitida por Supabase Auth. Sin ella se cerraría tu sesión en cada carga de página. Se elimina al cerrar sesión.',
        'ascend_lang — recuerda si elegiste español o inglés. Contiene un único valor: "es" o "en".',
      ],
      'Esa es la lista completa. Ninguna se envía a terceros con fines publicitarios ni de perfilado.',
    ]},
    { heading: '3. Qué NO usamos', body: [
      [
        'Cookies publicitarias o de retargeting.',
        'Analítica de terceros ni mapas de calor.',
        'Píxeles de seguimiento de redes sociales (Meta, TikTok, X).',
        'Identificadores de rastreo entre sitios de ningún tipo.',
        'Huella digital del dispositivo (fingerprinting).',
      ],
    ]},
    { heading: '4. Servicios de terceros', body: [
      'ASCEND se apoya en Supabase (base de datos y autenticación) y Vercel (alojamiento). Ambos pueden establecer cookies estrictamente técnicas necesarias para entregar y proteger la conexión — por ejemplo balanceo de carga y protección frente a ataques de denegación de servicio. No se usan para perfilarte.',
      'Los vídeos de la página de inicio se sirven desde nuestro propio alojamiento, no desde YouTube ni Vimeo, así que no se instalan cookies de reproductores externos.',
    ]},
    { heading: '5. Gestionar el almacenamiento del navegador', body: [
      'Puedes borrar estos datos cuando quieras desde la configuración de tu navegador ("Borrar datos de navegación" → "Cookies y otros datos de sitios"), o cerrando sesión, lo que elimina el token de sesión.',
      'Ten en cuenta que borrar el token cierra tu sesión, y borrar la preferencia de idioma devuelve la interfaz al inglés. Nada más se ve afectado: tus misiones, XP, racha e inventario están en la base de datos, no en tu navegador.',
    ]},
    { heading: '6. Si esto cambia', body: [
      'Si en el futuro añadimos analítica o cualquier tecnología no esencial, actualizaremos esta página y mostraremos previamente un banner de consentimiento real — podrás rechazarlo sin perder acceso a la aplicación.',
      `Consultas: ${OPERATOR.email}`,
    ]},
  ];

  return (
    <LegalLayout
      title={isEs ? 'Política de cookies' : 'Cookie Policy'}
      subtitle={isEs
        ? 'Dos entradas en tu navegador, ambas necesarias. Sin publicidad, sin rastreo, sin banner.'
        : 'Two entries in your browser, both necessary. No advertising, no tracking, no banner.'}
      sections={isEs ? es : en}
    />
  );
}
