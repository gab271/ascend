import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../components/layout/AuthLayout';

// ─── Password strength analyzer ──────────────────────────────────────────────
function getStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 5);
}

const STRENGTH_LABELS = ['', 'MUY DÉBIL', 'DÉBIL', 'MEDIA', 'FUERTE', 'MUY FUERTE'];
const STRENGTH_COLORS = ['', 'var(--red)', '#FF8A3D', 'var(--gold)', 'var(--cyan)', 'var(--green)'];

function PasswordStrength({ password }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div style={{ marginTop: -18, marginBottom: 26 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 7 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i < strength ? STRENGTH_COLORS[strength] : 'var(--surface)',
            border: i >= strength ? '1px solid var(--border)' : 'none',
            boxShadow: i < strength ? `0 0 6px ${STRENGTH_COLORS[strength]}55` : 'none',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        letterSpacing: '0.15em',
        color: STRENGTH_COLORS[strength],
        transition: 'color 0.3s',
      }}>
        {STRENGTH_LABELS[strength]}
      </span>
    </div>
  );
}

// ─── Register page ────────────────────────────────────────────────────────────
export default function Register() {
  const [form, setForm]           = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [focused, setFocused]     = useState(null);
  const [loading, setLoading]     = useState(false);

  const passwordsMismatch = form.confirm && form.password !== form.confirm;
  const passwordsMatch    = form.confirm && form.password === form.confirm;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 2400);
  };

  return (
    <AuthLayout>
      {/* ── System tag ── */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        letterSpacing: '0.2em',
        color: 'var(--cyan)',
        marginBottom: 32,
        animation: 'entry-left 0.5s ease forwards',
        opacity: 0,
        animationFillMode: 'forwards',
      }}>
        <span style={{ color: 'var(--text-muted)' }}>//</span>
        REGISTRO DE NUEVO AGENTE
      </div>

      {/* ── Title ── */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(52px, 5vw, 80px)',
        lineHeight: 0.88,
        letterSpacing: '0.02em',
        marginBottom: 14,
        animation: 'entry-up 0.55s ease 0.06s forwards',
        opacity: 0,
        animationFillMode: 'forwards',
      }}>
        <span style={{ color: 'var(--text)' }}>CREAR</span>
        <br />
        <span style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.22)',
        }}>AGENTE</span>
      </div>

      {/* ── Login link ── */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 14,
        color: 'var(--text-muted)',
        marginBottom: 44,
        animation: 'entry-up 0.55s ease 0.1s forwards',
        opacity: 0,
        animationFillMode: 'forwards',
      }}>
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" style={{
          color: 'var(--violet)',
          fontWeight: 700,
          textDecoration: 'none',
          borderBottom: '1px solid rgba(124,92,255,0.3)',
          paddingBottom: 1,
        }}>
          Inicia sesión
        </Link>
      </p>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <AuthInput
          label="NOMBRE DE AGENTE"
          type="text"
          value={form.username}
          onChange={v => setForm({ ...form, username: v })}
          icon={<User size={15} />}
          placeholder="AgenteSombra99"
          focused={focused === 'username'}
          onFocus={() => setFocused('username')}
          onBlur={() => setFocused(null)}
          delay={0.15}
        />

        <AuthInput
          label="CORREO ELECTRÓNICO"
          type="email"
          value={form.email}
          onChange={v => setForm({ ...form, email: v })}
          icon={<Mail size={15} />}
          placeholder="agente@dominio.com"
          focused={focused === 'email'}
          onFocus={() => setFocused('email')}
          onBlur={() => setFocused(null)}
          delay={0.2}
        />

        <AuthInput
          label="CONTRASEÑA"
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={v => setForm({ ...form, password: v })}
          icon={<Lock size={15} />}
          placeholder="Mín. 8 caracteres"
          focused={focused === 'pass'}
          onFocus={() => setFocused('pass')}
          onBlur={() => setFocused(null)}
          delay={0.25}
          suffix={
            <button
              type="button"
              onClick={() => setShowPass(s => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <PasswordStrength password={form.password} />

        <AuthInput
          label={
            passwordsMismatch
              ? 'CONFIRMAR CONTRASEÑA — ✗ NO COINCIDE'
              : passwordsMatch
              ? 'CONFIRMAR CONTRASEÑA — ✓ COINCIDE'
              : 'CONFIRMAR CONTRASEÑA'
          }
          type={showConf ? 'text' : 'password'}
          value={form.confirm}
          onChange={v => setForm({ ...form, confirm: v })}
          icon={<Lock size={15} />}
          placeholder="Repite la contraseña"
          focused={focused === 'confirm'}
          onFocus={() => setFocused('confirm')}
          onBlur={() => setFocused(null)}
          delay={0.3}
          error={passwordsMismatch}
          suffix={
            <button
              type="button"
              onClick={() => setShowConf(s => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0,
                display: 'flex', alignItems: 'center', flexShrink: 0,
              }}
            >
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {/* ── Terms note ── */}
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: 28,
          animation: 'entry-up 0.5s ease 0.35s forwards',
          opacity: 0,
          animationFillMode: 'forwards',
        }}>
          Al crear tu cuenta aceptas nuestros{' '}
          <span style={{ color: 'var(--violet)', borderBottom: '1px solid rgba(124,92,255,0.3)', cursor: 'pointer' }}>
            Términos de Servicio
          </span>
          {' '}y{' '}
          <span style={{ color: 'var(--violet)', borderBottom: '1px solid rgba(124,92,255,0.3)', cursor: 'pointer' }}>
            Política de Privacidad
          </span>
          .
        </p>

        <AuthButton loading={loading} delay={0.4}>
          {loading ? 'INICIALIZANDO...' : <><span>CREAR PERFIL</span><ArrowRight size={16} /></>}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
