import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../../components/layout/auth/AuthLayout';
import { signIn } from '../../lib/api/auth';

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn({ email: form.email, password: form.password });
    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : error.message === 'Email not confirmed'
          ? 'Debes verificar tu correo antes de iniciar sesión.'
          : error.message
      );
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout variant="login">
      <div style={{ width: '100%' }}>

        {/* Form heading */}
        <div style={{
          marginBottom: 36,
          animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 50,
            lineHeight: 0.9, letterSpacing: '0.04em', color: '#F5F7FB',
            marginBottom: 10,
          }}>
            INICIAR<br />SESIÓN
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 13,
            color: 'rgba(160,174,203,0.45)', fontWeight: 500,
          }}>
            Bienvenido de vuelta.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AuthInput
            label="Correo electrónico" type="email" value={form.email}
            onChange={v => setForm({ ...form, email: v })}
            icon={<Mail size={15} />} placeholder="tu@correo.com"
            focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} delay={0.1}
          />

          <AuthInput
            label="Contraseña" type={showPass ? 'text' : 'password'} value={form.password}
            onChange={v => setForm({ ...form, password: v })}
            icon={<Lock size={15} />} placeholder="••••••••••"
            focused={focused === 'pass'} onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)} delay={0.16}
            suffix={
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(74,90,122,0.9)', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Forgot password + register link */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: -10, marginBottom: 28,
            animation: 'entry-up 0.5s ease 0.22s forwards', opacity: 0, animationFillMode: 'forwards',
          }}>
            <Link to="/register" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.1em', color: 'rgba(100,120,160,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(100,120,160,0.6)'}
            >
              ¿Sin cuenta? Regístrate
            </Link>
            <Link to="/forgot-password" style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(100,120,160,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.85)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(100,120,160,0.6)'}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 8, marginBottom: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: '#FF4D6A' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <AuthButton loading={loading} delay={0.28}>
            {loading ? 'Entrando...' : <><span>Iniciar sesión</span><ArrowRight size={15} style={{ flexShrink: 0 }} /></>}
          </AuthButton>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0', animation: 'entry-up 0.5s ease 0.34s forwards', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.9)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(74,90,122,0.6)' }}>O</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.9)' }} />
          </div>

          {/* Google — placeholder, not yet implemented */}
          <button
            type="button"
            disabled
            style={{
              width: '100%', height: 48, background: 'transparent',
              border: '1px solid rgba(42,51,82,0.8)', color: 'rgba(100,120,160,0.35)',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, letterSpacing: '0.06em',
              cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              animation: 'entry-up 0.5s ease 0.38s forwards', opacity: 0, animationFillMode: 'forwards',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24">
              <path fill="#4285F4" opacity="0.35" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" opacity="0.35" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" opacity="0.35" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" opacity="0.35" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google (próximamente)
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
