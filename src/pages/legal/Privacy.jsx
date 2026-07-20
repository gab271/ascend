import LegalLayout, { OPERATOR } from './LegalLayout';
import { useLanguage } from '../../hooks/useLanguage';

export default function Privacy() {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  const en = [
    { heading: '1. Data controller', body: [
      `${OPERATOR.name}, based in ${OPERATOR.country}. Contact: ${OPERATOR.email}.`,
      'This policy explains what data ASCEND collects, why, and what control you have over it. It follows Regulation (EU) 2016/679 (GDPR) and Spanish Organic Law 3/2018 (LOPDGDD).',
    ]},
    { heading: '2. What we collect', body: [
      'Only what the app needs to work. Specifically:',
      [
        'Account: email address and an encrypted password. We never see your password in plain text — authentication is handled by Supabase Auth.',
        'Profile: username, optional avatar image, your timezone, and your daily cut-off hour.',
        'Preferences: which mission categories you selected, interface language, and whether your profile is private.',
        'Activity: which missions were assigned to you and when you completed them; a log of every XP and coin change; your streak history and any streak freezes used.',
        'Inventory: cosmetic items you own and which ones you have equipped.',
      ],
      'We do NOT collect: real name, postal address, phone number, payment details, precise location, contacts, or any biometric or health measurement beyond your own mission completions.',
    ]},
    { heading: '3. Why we process it', body: [
      'Providing the Service (performance of a contract, Art. 6.1.b GDPR): your account, missions, XP, levels, streaks and inventory. Without this data the app cannot function.',
      'Your timezone (performance of a contract): we need it to know when "your day" ends. Otherwise streaks would break at the wrong moment for anyone outside our server timezone.',
      'Public ranking (legitimate interest, Art. 6.1.f): your username, avatar, level, total XP and streak are visible to other signed-in users. You can hide yourself from the ranking at any time in Settings.',
      'Security and abuse prevention (legitimate interest): detecting manipulation of the XP system.',
    ]},
    { heading: '4. Who else sees it', body: [
      'We do not sell your data. We do not share it with advertisers. There is no advertising or third-party analytics in ASCEND.',
      'We rely on two service providers who process data strictly on our instructions:',
      [
        'Supabase — database, authentication and avatar storage.',
        'Vercel — application hosting.',
      ],
      'Other users can see only what appears in the public ranking: username, avatar, level, total XP and streak. Nobody can see your individual missions, your activity history or your email.',
    ]},
    { heading: '5. International transfers', body: [
      'Our providers may process data outside the European Economic Area. Where that happens it is covered by the European Commission\'s Standard Contractual Clauses. You can check the region configured for your project in each provider\'s documentation.',
    ]},
    { heading: '6. How long we keep it', body: [
      'While your account is active, we keep your data so your history, streaks and level remain intact.',
      'When you request deletion, the account is deactivated immediately and permanently erased after 30 days. That window exists so an accidental deletion can be undone.',
      'After 30 days, deletion is total and irreversible: profile, activity history, XP ledger, inventory and avatar. Nothing anonymised is retained.',
      'Encrypted backups may hold your data for up to 90 days before rotating out.',
    ]},
    { heading: '7. Your rights', body: [
      'Under GDPR you may at any time:',
      [
        'Access — obtain a copy of your data.',
        'Rectify — correct anything inaccurate (username and avatar are editable in the app).',
        'Erase — delete your account and all associated data.',
        'Restrict or object — including objecting to appearing in the public ranking.',
        'Portability — receive your data in a machine-readable format.',
        'Withdraw consent — where processing was based on consent.',
      ],
      `To exercise any of these, write to ${OPERATOR.email}. We will respond within one month.`,
      'If you believe your data has been handled improperly, you can complain to the Spanish Data Protection Agency (AEPD, www.aepd.es).',
    ]},
    { heading: '8. Security', body: [
      'Passwords are stored hashed by Supabase Auth; we never have access to them.',
      'The database enforces Row Level Security: each account can only read its own rows, and this is applied by the database itself rather than by the application. Operations that award XP or coins run exclusively on the server, so they cannot be forged from the browser.',
      'All traffic travels over HTTPS. Backups are encrypted.',
      'No system is perfectly secure. If a breach affects your data we will notify you and the AEPD within 72 hours, as the law requires.',
    ]},
    { heading: '9. Automated decisions and profiling', body: [
      'We do not carry out automated decision-making that produces legal effects concerning you or similarly significantly affects you, within the meaning of Article 22 GDPR.',
      'Missions are assigned automatically from the categories you choose, and your ranking position is calculated automatically from your total XP. Neither produces legal or similarly significant effects: they only determine what appears in a habit-tracking app.',
    ]},
    { heading: '10. Data protection officer', body: [
      'Given the nature and scale of the processing, appointing a Data Protection Officer under Article 37 GDPR is not mandatory. Any data protection query should be sent to the contact address in section 1.',
    ]},
    { heading: '11. Minors', body: [
      'ASCEND is not directed at children under 14, the minimum age for consenting to data processing in Spain (Art. 7 LOPDGDD). If we learn we have collected data from a child under 14 without parental authorisation, we will delete it.',
    ]},
    { heading: '12. Changes', body: [
      'If we make significant changes to this policy we will notify you in the app or by email before they take effect.',
      `Questions about your privacy: ${OPERATOR.email}`,
    ]},
  ];

  const es = [
    { heading: '1. Responsable del tratamiento', body: [
      `${OPERATOR.name}, con sede en España. Contacto: ${OPERATOR.email}.`,
      'Esta política explica qué datos recoge ASCEND, para qué, y qué control tienes sobre ellos. Sigue el Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).',
    ]},
    { heading: '2. Qué datos recogemos', body: [
      'Solo lo que la aplicación necesita para funcionar. En concreto:',
      [
        'Cuenta: dirección de correo y una contraseña cifrada. Nunca vemos tu contraseña en texto plano — la autenticación la gestiona Supabase Auth.',
        'Perfil: nombre de usuario, imagen de avatar opcional, tu zona horaria y tu hora de corte diaria.',
        'Preferencias: categorías de misiones seleccionadas, idioma de la interfaz y si tu perfil es privado.',
        'Actividad: qué misiones se te asignaron y cuándo las completaste; un registro de cada cambio de XP y monedas; tu historial de rachas y los congeladores usados.',
        'Inventario: objetos cosméticos que posees y cuáles llevas equipados.',
      ],
      'NO recogemos: nombre real, dirección postal, teléfono, datos de pago, ubicación precisa, contactos, ni ninguna medición biométrica o de salud más allá de las misiones que tú mismo marcas.',
    ]},
    { heading: '3. Para qué los tratamos', body: [
      'Prestación del servicio (ejecución de un contrato, art. 6.1.b RGPD): tu cuenta, misiones, XP, niveles, rachas e inventario. Sin estos datos la aplicación no puede funcionar.',
      'Tu zona horaria (ejecución de un contrato): la necesitamos para saber cuándo termina "tu día". De lo contrario las rachas se romperían en el momento equivocado para cualquiera fuera de la zona horaria del servidor.',
      'Ranking público (interés legítimo, art. 6.1.f): tu nombre de usuario, avatar, nivel, XP total y racha son visibles para otros usuarios registrados. Puedes ocultarte del ranking cuando quieras desde Configuración.',
      'Seguridad y prevención de abusos (interés legítimo): detectar manipulaciones del sistema de XP.',
    ]},
    { heading: '4. Quién más los ve', body: [
      'No vendemos tus datos. No los compartimos con anunciantes. En ASCEND no hay publicidad ni analítica de terceros.',
      'Nos apoyamos en dos proveedores que tratan datos siguiendo estrictamente nuestras instrucciones:',
      [
        'Supabase — base de datos, autenticación y almacenamiento de avatares.',
        'Vercel — alojamiento de la aplicación.',
      ],
      'Otros usuarios solo pueden ver lo que aparece en el ranking público: nombre de usuario, avatar, nivel, XP total y racha. Nadie puede ver tus misiones concretas, tu historial de actividad ni tu correo.',
    ]},
    { heading: '5. Transferencias internacionales', body: [
      'Nuestros proveedores pueden tratar datos fuera del Espacio Económico Europeo. Cuando ocurre, está amparado por las Cláusulas Contractuales Tipo de la Comisión Europea. Puedes consultar la región configurada para tu proyecto en la documentación de cada proveedor.',
    ]},
    { heading: '6. Cuánto tiempo los conservamos', body: [
      'Mientras tu cuenta esté activa, conservamos tus datos para que tu historial, rachas y nivel se mantengan intactos.',
      'Cuando solicitas la eliminación, la cuenta se desactiva de inmediato y se borra definitivamente a los 30 días. Ese plazo existe para poder deshacer un borrado accidental.',
      'Pasados los 30 días, el borrado es total e irreversible: perfil, historial de actividad, registro de XP, inventario y avatar. No conservamos nada anonimizado.',
      'Las copias de seguridad cifradas pueden contener tus datos hasta 90 días antes de rotar.',
    ]},
    { heading: '7. Tus derechos', body: [
      'Conforme al RGPD puedes en cualquier momento:',
      [
        'Acceso — obtener una copia de tus datos.',
        'Rectificación — corregir lo que sea inexacto (nombre de usuario y avatar son editables en la app).',
        'Supresión — eliminar tu cuenta y todos los datos asociados.',
        'Limitación u oposición — incluida la oposición a aparecer en el ranking público.',
        'Portabilidad — recibir tus datos en un formato legible por máquina.',
        'Retirar el consentimiento — cuando el tratamiento se base en él.',
      ],
      `Para ejercerlos, escribe a ${OPERATOR.email}. Responderemos en el plazo de un mes.`,
      'Si consideras que tus datos se han tratado indebidamente, puedes reclamar ante la Agencia Española de Protección de Datos (AEPD, www.aepd.es).',
    ]},
    { heading: '8. Seguridad', body: [
      'Las contraseñas se almacenan cifradas por Supabase Auth; nunca tenemos acceso a ellas.',
      'La base de datos aplica Row Level Security: cada cuenta solo puede leer sus propias filas, y esto lo impone la propia base de datos, no la aplicación. Las operaciones que otorgan XP o monedas se ejecutan exclusivamente en el servidor, por lo que no pueden falsificarse desde el navegador.',
      'Todo el tráfico viaja por HTTPS. Las copias de seguridad están cifradas.',
      'Ningún sistema es perfectamente seguro. Si una brecha afecta a tus datos, te lo notificaremos a ti y a la AEPD en un plazo de 72 horas, como exige la ley.',
    ]},
    { heading: '9. Decisiones automatizadas y elaboración de perfiles', body: [
      'No realizamos decisiones automatizadas que produzcan efectos jurídicos sobre ti o te afecten significativamente de modo similar, en el sentido del artículo 22 del RGPD.',
      'Las misiones se asignan automáticamente a partir de las categorías que elijas, y tu posición en el ranking se calcula automáticamente según tu XP total. Ninguna de las dos produce efectos jurídicos ni significativos: solo determinan qué aparece en una aplicación de seguimiento de hábitos.',
    ]},
    { heading: '10. Delegado de protección de datos', body: [
      'Dada la naturaleza y escala del tratamiento, no resulta obligatoria la designación de un Delegado de Protección de Datos conforme al artículo 37 del RGPD. Cualquier consulta en materia de protección de datos debe dirigirse a la dirección de contacto indicada en el apartado 1.',
    ]},
    { heading: '11. Menores', body: [
      'ASCEND no está dirigido a menores de 14 años, edad mínima para consentir el tratamiento de datos en España (art. 7 LOPDGDD). Si detectamos que hemos recogido datos de un menor de 14 sin autorización parental, los eliminaremos.',
    ]},
    { heading: '12. Cambios', body: [
      'Si realizamos cambios significativos en esta política te avisaremos en la aplicación o por correo antes de que entren en vigor.',
      `Consultas sobre tu privacidad: ${OPERATOR.email}`,
    ]},
  ];

  return (
    <LegalLayout
      title={isEs ? 'Política de privacidad' : 'Privacy Policy'}
      subtitle={isEs
        ? 'Qué datos recogemos, por qué, y cómo mantienes el control. Sin publicidad, sin rastreadores, sin venta de datos.'
        : 'What we collect, why, and how you stay in control. No ads, no trackers, no data selling.'}
      sections={isEs ? es : en}
    />
  );
}
