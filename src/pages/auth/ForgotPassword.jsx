import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../../components/layout/auth/AuthLayout';
import { sendPasswordResetEmail } from '../../lib/api/auth';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    const { error } = await sendPasswordResetEmail(email);
    setLoading(false);
    if (error) { setError(error.message); } else { setSent(true); }
  };

  if (sent) {
    return (
      <AuthLayout>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(51,230,161,0.08)', border: '1px solid rgba(51,230,161,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards', boxShadow: '0 0 32px rgba(51,230,161,0.15)' }}>
          <CheckCircle size={30} color="var(--green)" strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 24, animation: 'entry-up 0.55s ease 0.08s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          <span style={{ color: 'var(--text)' }}>ENLACE</span><br />
          <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(51,230,161,0.35)' }}>ENVIADO</span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 16, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          Hemos enviado un enlace de recuperación a{' '}
          <strong style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600 }}>{email}</strong>.
          {' '}Revisa tu bandeja de entrada.
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 48, animation: 'entry-up 0.5s ease 0.18s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          // ENLACE VÁLIDO POR 15 MINUTOS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'entry-up 0.5s ease 0.24s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={14} /> Volver al inicio de sesión
          </Link>
          <button type="button" onClick={() => { setSent(false); setEmail(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: 0, transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ↺ Usar otro correo
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 32, animation: 'entry-left 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text-muted)' }}>//</span> PROTOCOLO DE RECUPERACIÓN
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 14, animation: 'entry-up 0.55s ease 0.06s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text)' }}>RECUPERAR</span><br />
        <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}>ACCESO</span>
      </div>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 52, lineHeight: 1.65, maxWidth: 360, animation: 'entry-up 0.55s ease 0.1s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <AuthInput label="CORREO ELECTRÓNICO" type="email" value={email} onChange={v => setEmail(v)} icon={<Mail size={15} />} placeholder="agente@dominio.com" focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} delay={0.15} />

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 8, marginBottom: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: '#FF4D6A' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <AuthButton loading={loading} delay={0.22}>
          {loading ? 'ENVIANDO...' : <><span>ENVIAR ENLACE</span><ArrowRight size={16} /></>}
        </AuthButton>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 28, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s', animation: 'entry-up 0.5s ease 0.3s forwards', opacity: 0, animationFillMode: 'forwards' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <ArrowLeft size={13} /> Volver al inicio de sesión
        </Link>
      </form>
    </AuthLayout>
  );
}
