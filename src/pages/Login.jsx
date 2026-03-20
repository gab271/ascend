import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../components/layout/AuthLayout';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]  = useState(null);
  const [loading, setLoading]  = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2200);
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
        PROTOCOLO DE ACCESO
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
        <span style={{ color: 'var(--text)' }}>INICIAR</span>
        <br />
        <span style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.22)',
        }}>SESIÓN</span>
      </div>

      {/* ── Register link ── */}
      <p style={{
        fontFamily: 'var(--font-ui)',
        fontSize: 14,
        color: 'var(--text-muted)',
        marginBottom: 52,
        animation: 'entry-up 0.55s ease 0.1s forwards',
        opacity: 0,
        animationFillMode: 'forwards',
      }}>
        ¿Primera vez aquí?{' '}
        <Link to="/register" style={{
          color: 'var(--violet)',
          fontWeight: 700,
          textDecoration: 'none',
          borderBottom: '1px solid rgba(124,92,255,0.3)',
          paddingBottom: 1,
        }}>
          Crea tu cuenta
        </Link>
      </p>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
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
          delay={0.15}
        />

        <AuthInput
          label="CONTRASEÑA"
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={v => setForm({ ...form, password: v })}
          icon={<Lock size={15} />}
          placeholder="••••••••••"
          focused={focused === 'pass'}
          onFocus={() => setFocused('pass')}
          onBlur={() => setFocused(null)}
          delay={0.2}
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

        {/* ── Forgot password ── */}
        <div style={{
          textAlign: 'right',
          marginTop: -14,
          marginBottom: 36,
          animation: 'entry-up 0.5s ease 0.24s forwards',
          opacity: 0,
          animationFillMode: 'forwards',
        }}>
          <Link
            to="/forgot-password"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--text-muted)',
              letterSpacing: '0.06em',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--violet)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            ¿Olvidaste tu contraseña? →
          </Link>
        </div>

        <AuthButton loading={loading} delay={0.3}>
          {loading ? 'VERIFICANDO...' : <><span>ACCEDER AL SISTEMA</span><ArrowRight size={16} /></>}
        </AuthButton>

        {/* ── Divider + social hint ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          margin: '32px 0',
          animation: 'entry-up 0.5s ease 0.38s forwards',
          opacity: 0,
          animationFillMode: 'forwards',
        }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
          }}>O CONTINÚA CON</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Google button */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '13px 24px',
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.08em',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'border-color 0.2s, color 0.2s',
            animation: 'entry-up 0.5s ease 0.42s forwards',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-bright)';
            e.currentTarget.style.color = 'var(--text)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
      </form>
    </AuthLayout>
  );
}
