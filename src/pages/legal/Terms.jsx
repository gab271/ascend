import LegalLayout, { OPERATOR } from './LegalLayout';
import { useLanguage } from '../../hooks/useLanguage';

export default function Terms() {
  const { lang } = useLanguage();
  const isEs = lang === 'es';

  const en = [
    { heading: '1. Who we are', body: [
      `ASCEND ("the Service") is operated by ${OPERATOR.name}, based in ${OPERATOR.country}. You can reach us at ${OPERATOR.email}.`,
      'By creating an account or using the Service you accept these Terms. If you do not agree with them, do not use ASCEND.',
    ]},
    { heading: '2. What ASCEND is', body: [
      'ASCEND is a habit-tracking application that turns daily goals into missions, experience points, levels and cosmetic rewards. It is a motivational tool, nothing more.',
      'ASCEND is not a medical, psychological, financial or professional advisory service. Missions relating to exercise, diet, sleep or money are generic suggestions, not personalised advice. Consult a qualified professional before making decisions about your health or finances.',
    ]},
    { heading: '3. Your account', body: [
      'You need an account to use the Service. When registering you agree to:',
      [
        'Provide a valid email address you control.',
        'Be at least 14 years old (the minimum age for consenting to data processing in Spain). If you are under 18, you should have permission from a parent or guardian.',
        'Keep your password secure and not share your account.',
        'Choose a username that is not offensive and does not impersonate another person or organisation.',
      ],
      'You are responsible for everything that happens under your account. Tell us immediately if you believe it has been compromised.',
    ]},
    { heading: '4. Fair use of the game systems', body: [
      'Experience points, coins, levels, streaks and ranking positions exist to make progress visible. They have no monetary value, cannot be exchanged for money, and cannot be transferred between accounts.',
      'You agree not to:',
      [
        'Manipulate XP, coins, streaks or the ranking by any means other than normal use of the app.',
        'Access the database or the API other than through the application interface.',
        'Automate use of the Service with bots or scripts.',
        'Create multiple accounts to gain an advantage in the ranking.',
      ],
      'We may correct, reset or remove any progress obtained in breach of this section, and suspend accounts responsible for it.',
    ]},
    { heading: '5. Content you provide', body: [
      'You keep ownership of anything you upload, such as your avatar image. By uploading it you grant us the strictly necessary licence to store and display it within the Service.',
      'Do not upload content that is illegal, offensive, sexually explicit, hateful, or that infringes third-party rights. We may remove such content and suspend the account responsible.',
    ]},
    { heading: '6. Availability', body: [
      'ASCEND is offered "as is" and "as available". It is a personal project under active development: features may change, and there may be interruptions, bugs or data loss.',
      'We do not guarantee uninterrupted availability, and we may modify or discontinue the Service. If we shut it down permanently, we will give reasonable notice so you can export your data.',
    ]},
    { heading: '7. Limitation of liability', body: [
      'To the maximum extent permitted by law, we are not liable for indirect damages, loss of profit, or loss of data arising from use of the Service.',
      'Nothing in these Terms excludes liability that cannot legally be excluded, including liability for wilful misconduct or gross negligence, or the rights you hold as a consumer.',
    ]},
    { heading: '8. Deleting your account', body: [
      'You can request deletion at any time from Settings. Your account is deactivated immediately and permanently erased after 30 days, during which you may recover it by contacting us.',
      'Once erased, your data cannot be recovered. Your entries disappear from the ranking.',
    ]},
    { heading: '9. Changes to these Terms', body: [
      'We may update these Terms. If changes are significant we will notify you in the app or by email. Continuing to use the Service after they take effect means you accept them.',
    ]},
    { heading: '10. Governing law', body: [
      `These Terms are governed by Spanish law. Any dispute will be submitted to the competent courts, without prejudice to the right of a consumer to bring proceedings before the courts of their place of residence.`,
      `Questions: ${OPERATOR.email}`,
    ]},
  ];

  const es = [
    { heading: '1. Quiénes somos', body: [
      `ASCEND ("el Servicio") está operado por ${OPERATOR.name}, con sede en España. Puedes contactarnos en ${OPERATOR.email}.`,
      'Al crear una cuenta o usar el Servicio aceptas estos Términos. Si no estás de acuerdo con ellos, no uses ASCEND.',
    ]},
    { heading: '2. Qué es ASCEND', body: [
      'ASCEND es una aplicación de seguimiento de hábitos que convierte objetivos diarios en misiones, puntos de experiencia, niveles y recompensas cosméticas. Es una herramienta de motivación, nada más.',
      'ASCEND no es un servicio médico, psicológico, financiero ni de asesoramiento profesional. Las misiones relacionadas con ejercicio, dieta, sueño o dinero son sugerencias genéricas, no consejos personalizados. Consulta con un profesional cualificado antes de tomar decisiones sobre tu salud o tus finanzas.',
    ]},
    { heading: '3. Tu cuenta', body: [
      'Necesitas una cuenta para usar el Servicio. Al registrarte te comprometes a:',
      [
        'Facilitar una dirección de correo válida de la que seas titular.',
        'Tener al menos 14 años (edad mínima para consentir el tratamiento de datos en España). Si eres menor de 18, deberías contar con permiso de tu padre, madre o tutor.',
        'Mantener tu contraseña segura y no compartir tu cuenta.',
        'Elegir un nombre de usuario que no sea ofensivo ni suplante a otra persona u organización.',
      ],
      'Eres responsable de todo lo que ocurra en tu cuenta. Avísanos de inmediato si crees que ha sido comprometida.',
    ]},
    { heading: '4. Uso justo del sistema de juego', body: [
      'Los puntos de experiencia, monedas, niveles, rachas y posiciones del ranking existen para hacer visible tu progreso. No tienen valor monetario, no son canjeables por dinero y no se pueden transferir entre cuentas.',
      'Te comprometes a no:',
      [
        'Manipular XP, monedas, rachas o el ranking por medios distintos al uso normal de la aplicación.',
        'Acceder a la base de datos o a la API por vías ajenas a la interfaz de la aplicación.',
        'Automatizar el uso del Servicio mediante bots o scripts.',
        'Crear varias cuentas para obtener ventaja en el ranking.',
      ],
      'Podemos corregir, reiniciar o eliminar cualquier progreso obtenido incumpliendo esta sección, y suspender las cuentas responsables.',
    ]},
    { heading: '5. Contenido que aportas', body: [
      'Mantienes la propiedad de lo que subas, como tu imagen de perfil. Al subirla nos concedes la licencia estrictamente necesaria para almacenarla y mostrarla dentro del Servicio.',
      'No subas contenido ilegal, ofensivo, sexualmente explícito, de odio, ni que infrinja derechos de terceros. Podemos retirar dicho contenido y suspender la cuenta responsable.',
    ]},
    { heading: '6. Disponibilidad', body: [
      'ASCEND se ofrece "tal cual" y "según disponibilidad". Es un proyecto personal en desarrollo activo: las funciones pueden cambiar y pueden producirse interrupciones, errores o pérdida de datos.',
      'No garantizamos disponibilidad ininterrumpida y podemos modificar o discontinuar el Servicio. Si lo cerramos definitivamente, avisaremos con antelación razonable para que puedas exportar tus datos.',
    ]},
    { heading: '7. Limitación de responsabilidad', body: [
      'En la máxima medida permitida por la ley, no somos responsables de daños indirectos, lucro cesante ni pérdida de datos derivados del uso del Servicio.',
      'Nada en estos Términos excluye la responsabilidad que legalmente no puede excluirse, incluida la derivada de dolo o negligencia grave, ni los derechos que te correspondan como consumidor.',
    ]},
    { heading: '8. Eliminar tu cuenta', body: [
      'Puedes solicitar la eliminación en cualquier momento desde Configuración. Tu cuenta se desactiva de inmediato y se borra definitivamente a los 30 días, plazo durante el cual puedes recuperarla contactando con nosotros.',
      'Una vez borrada, tus datos no se pueden recuperar. Tus registros desaparecen del ranking.',
    ]},
    { heading: '9. Cambios en estos Términos', body: [
      'Podemos actualizar estos Términos. Si los cambios son significativos te avisaremos en la aplicación o por correo. Seguir usando el Servicio después de su entrada en vigor implica que los aceptas.',
    ]},
    { heading: '10. Legislación aplicable', body: [
      'Estos Términos se rigen por la legislación española. Cualquier conflicto se someterá a los juzgados competentes, sin perjuicio del derecho del consumidor a acudir a los tribunales de su lugar de residencia.',
      `Consultas: ${OPERATOR.email}`,
    ]},
  ];

  return (
    <LegalLayout
      title={isEs ? 'Términos de uso' : 'Terms of Use'}
      subtitle={isEs
        ? 'Las reglas para usar ASCEND. En resumen: sé honesto con tu progreso y respetuoso con los demás.'
        : 'The rules for using ASCEND. In short: be honest about your progress and respectful of others.'}
      sections={isEs ? es : en}
    />
  );
}
