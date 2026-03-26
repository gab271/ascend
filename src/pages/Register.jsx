import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../components/layout/AuthLayout';
import { signUp } from '../lib/api/auth';

/* ═══════════════════════════════════════════════════════════════
   PASSWORD STRENGTH
═══════════════════════════════════════════════════════════════ */
function getStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 5);
}

const STRENGTH_LABELS = ['', 'MUY DÉBIL', 'DÉBIL', 'MEDIA', 'FUERTE', 'MUY FUERTE'];
const STRENGTH_COLORS = ['', '#FF4D6A', '#FF8A3D', '#F5C451', '#33D1FF', '#33E6A1'];

function PasswordStrength({ password }) {
  const s = getStrength(password);
  if (!password) return null;
  return (
    <div style={{ marginTop: -14, marginBottom: 22 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < s ? STRENGTH_COLORS[s] : 'rgba(42,51,82,0.8)',
            boxShadow: i < s ? `0 0 5px ${STRENGTH_COLORS[s]}55` : 'none',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em',
        color: STRENGTH_COLORS[s], transition: 'color 0.3s',
      }}>
        {STRENGTH_LABELS[s]}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   REGISTER PAGE
═══════════════════════════════════════════════════════════════ */
export default function Register() {
  const [form, setForm]         = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const mismatch = form.confirm && form.password !== form.confirm;
  const match    = form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mismatch) return;
    setError('');
    setLoading(true);
    const { error } = await signUp({
      email:    form.email,
      password: form.password,
      username: form.username,
    });
    if (error) {
      setError(
        error.message?.includes('already registered')
          ? 'Ese correo ya tiene una cuenta. ¿Quieres iniciar sesión?'
          : error.message
      );
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  // ── Estado: email de verificación enviado ──────────────────
  if (emailSent) {
    return (
      <AuthLayout variant="register">
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            background: 'rgba(51,230,161,0.08)',
            border: '1px solid rgba(51,230,161,0.28)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 36,
            animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards',
            boxShadow: '0 0 32px rgba(51,230,161,0.15)',
          }}>
            <CheckCircle2 size={30} color="var(--green)" strokeWidth={1.5} />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(52px,5vw,80px)',
            lineHeight: 0.88, marginBottom: 24,
            animation: 'entry-up 0.55s ease 0.08s forwards', opacity: 0, animationFillMode: 'forwards',
          }}>
            <span style={{ color: 'var(--text)' }}>VERIFICA</span><br />
            <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(51,230,161,0.35)' }}>TU CORREO</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7,
            marginBottom: 12,
            animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards',
          }}>
            Enviamos un enlace de activación a{' '}
            <strong style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              {form.email}
            </strong>.
            Haz clic en el enlace para activar tu cuenta.
          </p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none',
            textTransform: 'uppercase', transition: 'color 0.2s',
            animation: 'entry-up 0.5s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ← Ir a iniciar sesión
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="register">
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* System tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px 5px 10px',
          background: 'rgba(51,230,161,0.07)',
          border: '1px solid rgba(51,230,161,0.2)',
          borderRadius: 100, marginBottom: 28,
          animation: 'entry-left 0.5s ease forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#33E6A1', boxShadow: '0 0 6px #33E6A1',
            animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#33E6A1', letterSpacing: '0.18em' }}>
            INICIALIZACIÓN DE NUEVO OPERADOR
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(56px, 6vw, 82px)',
          lineHeight: 0.88, letterSpacing: '0.01em',
          marginBottom: 16,
          animation: 'entry-up 0.55s ease 0.07s forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          <span style={{ color: '#F5F7FB' }}>ACTIVAR</span>
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.15)' }}>MI</span>
          {' '}
          <span style={{
            background: 'linear-gradient(95deg, #33D1FF 0%, #33E6A1 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>PERFIL</span>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15,
          color: 'rgba(160,174,203,0.85)', lineHeight: 1.65, marginBottom: 8,
          animation: 'entry-up 0.55s ease 0.12s forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          Elige tu nombre de operador y configura tu acceso. Tu ascenso empieza con este paso.
        </p>

        {/* Login link */}
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: 13,
          color: 'rgba(160,174,203,0.5)', marginBottom: 40,
          animation: 'entry-up 0.55s ease 0.14s forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{
            color: '#33D1FF', fontWeight: 700, textDecoration: 'none',
            borderBottom: '1px solid rgba(51,209,255,0.25)', paddingBottom: 1,
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'rgba(51,209,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'rgba(51,209,255,0.25)'}
          >
            Retomar el ascenso →
          </Link>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Nombre de operador"
            type="text"
            value={form.username}
            onChange={v => setForm({ ...form, username: v })}
            icon={<User size={15} />}
            placeholder="AgenteSombra_99"
            focused={focused === 'username'}
            onFocus={() => setFocused('username')}
            onBlur={() => setFocused(null)}
            delay={0.16}
          />

          <AuthInput
            label="Correo electrónico"
            type="email"
            value={form.email}
            onChange={v => setForm({ ...form, email: v })}
            icon={<Mail size={15} />}
            placeholder="agente@dominio.com"
            focused={focused === 'email'}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
            delay={0.22}
          />

          <AuthInput
            label="Contraseña"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={v => setForm({ ...form, password: v })}
            icon={<Lock size={15} />}
            placeholder="Mín. 8 caracteres"
            focused={focused === 'pass'}
            onFocus={() => setFocused('pass')}
            onBlur={() => setFocused(null)}
            delay={0.28}
            suffix={
              <button type="button" onClick={() => setShowPass(s => !s)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(74,90,122,0.9)', padding: 0,
                display: 'flex', alignItems: 'center', flexShrink: 0,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          <PasswordStrength password={form.password} />

          <AuthInput
            label={
              mismatch ? 'Confirmar contraseña — ✗ no coincide'
              : match   ? 'Confirmar contraseña — ✓ coincide'
              : 'Confirmar contraseña'
            }
            type={showConf ? 'text' : 'password'}
            value={form.confirm}
            onChange={v => setForm({ ...form, confirm: v })}
            icon={<Lock size={15} />}
            placeholder="Repite la contraseña"
            focused={focused === 'confirm'}
            onFocus={() => setFocused('confirm')}
            onBlur={() => setFocused(null)}
            delay={0.34}
            error={mismatch}
            suffix={
              <button type="button" onClick={() => setShowConf(s => !s)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(74,90,122,0.9)', padding: 0,
                display: 'flex', alignItems: 'center', flexShrink: 0,
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}
              >
                {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Trust line */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            marginBottom: 28,
            animation: 'entry-up 0.5s ease 0.38s forwards',
            opacity: 0, animationFillMode: 'forwards',
          }}>
            <CheckCircle2 size={13} color="rgba(51,230,161,0.5)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 12,
              color: 'rgba(160,174,203,0.5)', lineHeight: 1.6, margin: 0,
            }}>
              Al registrarte aceptas los{' '}
              <span style={{ color: '#33D1FF', cursor: 'pointer', borderBottom: '1px solid rgba(51,209,255,0.25)' }}>Términos de Servicio</span>
              {' '}y la{' '}
              <span style={{ color: '#33D1FF', cursor: 'pointer', borderBottom: '1px solid rgba(51,209,255,0.25)' }}>Política de Privacidad</span>.
            </p>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: 'rgba(255,77,106,0.08)',
              border: '1px solid rgba(255,77,106,0.3)',
              borderRadius: 8, marginBottom: 16,
              fontFamily: 'var(--font-ui)', fontSize: 13, color: '#FF4D6A',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <AuthButton loading={loading} delay={0.43} variant="cyan">
            {loading
              ? 'INICIALIZANDO PERFIL...'
              : <><span>ACTIVAR OPERADOR</span><ArrowRight size={15} style={{ flexShrink: 0 }} /></>
            }
          </AuthButton>

          {/* Proof points */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20, flexWrap: 'wrap',
            animation: 'entry-up 0.5s ease 0.5s forwards',
            opacity: 0, animationFillMode: 'forwards',
          }}>
            {['Gratis para siempre', 'Sin tarjeta de crédito', 'Progreso visible desde el día 1'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={10} color="rgba(51,230,161,0.5)" />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(160,174,203,0.45)', fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
