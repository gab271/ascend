import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../components/layout/AuthLayout';
import { signIn } from '../lib/api/auth';

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
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* System tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '5px 12px 5px 10px',
          background: 'rgba(51,209,255,0.07)',
          border: '1px solid rgba(51,209,255,0.18)',
          borderRadius: 100, marginBottom: 28,
          animation: 'entry-left 0.5s ease forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          <span style={{
            display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
            background: '#33D1FF', boxShadow: '0 0 6px #33D1FF',
            animation: 'pulse-glow 2s ease-in-out infinite', flexShrink: 0,
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#33D1FF', letterSpacing: '0.18em' }}>
            PROTOCOLO DE ACCESO · SES-7C5C
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
          <span style={{ color: '#F5F7FB' }}>RETOMAR</span>
          <br />
          <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.15)' }}>EL</span>
          {' '}
          <span style={{
            background: 'linear-gradient(95deg, #7C5CFF 0%, #33D1FF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>ASCENSO</span>
        </div>

        {/* Subtitle */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 15,
          color: 'rgba(160,174,203,0.85)', lineHeight: 1.65, marginBottom: 8,
          animation: 'entry-up 0.55s ease 0.12s forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          Tu progreso te espera. Continúa exactamente donde lo dejaste.
        </p>

        {/* Register link */}
        <p style={{
          fontFamily: 'var(--font-ui)', fontSize: 13,
          color: 'rgba(160,174,203,0.5)', marginBottom: 40,
          animation: 'entry-up 0.55s ease 0.14s forwards',
          opacity: 0, animationFillMode: 'forwards',
        }}>
          ¿Primera vez?{' '}
          <Link to="/register" style={{
            color: '#7C5CFF', fontWeight: 700, textDecoration: 'none',
            borderBottom: '1px solid rgba(124,92,255,0.25)', paddingBottom: 1,
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'rgba(124,92,255,0.65)'}
            onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'rgba(124,92,255,0.25)'}
          >
            Únete al sistema →
          </Link>
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
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
            delay={0.18}
          />

          <AuthInput
            label="Contraseña"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={v => setForm({ ...form, password: v })}
            icon={<Lock size={15} />}
            placeholder="••••••••••"
            focused={focused === 'pass'}
            onFocus={() => setFocused('pass')}
            onBlur={() => setFocused(null)}
            delay={0.24}
            suffix={
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
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

          {/* Forgot password */}
          <div style={{
            textAlign: 'right', marginTop: -10, marginBottom: 32,
            animation: 'entry-up 0.5s ease 0.3s forwards',
            opacity: 0, animationFillMode: 'forwards',
          }}>
            <Link to="/forgot-password" style={{
              fontFamily: 'var(--font-mono)', fontSize: 9,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(100,120,160,0.7)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(100,120,160,0.7)'}
            >
              Recuperar acceso →
            </Link>
          </div>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px',
              background: 'rgba(255,77,106,0.08)',
              border: '1px solid rgba(255,77,106,0.3)',
              borderRadius: 8,
              marginBottom: 16,
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: '#FF4D6A',
            }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <AuthButton loading={loading} delay={0.35}>
            {loading
              ? 'AUTENTICANDO...'
              : <><Zap size={14} style={{ flexShrink: 0 }} /><span>REANUDAR ASCENSO</span><ArrowRight size={15} style={{ flexShrink: 0 }} /></>
            }
          </AuthButton>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16, margin: '28px 0',
            animation: 'entry-up 0.5s ease 0.42s forwards',
            opacity: 0, animationFillMode: 'forwards',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.9)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, letterSpacing: '0.2em', color: 'rgba(74,90,122,0.7)' }}>O CONTINÚA CON</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(42,51,82,0.9)' }} />
          </div>

          {/* Google */}
          <button
            type="button"
            style={{
              width: '100%', height: 50,
              background: 'transparent',
              border: '1px solid rgba(42,51,82,0.9)',
              color: 'rgba(160,174,203,0.8)',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
              letterSpacing: '0.06em', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'border-color 0.2s, color 0.2s, background 0.2s',
              animation: 'entry-up 0.5s ease 0.46s forwards',
              opacity: 0, animationFillMode: 'forwards',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(63,79,122,0.9)';
              e.currentTarget.style.color = '#F5F7FB';
              e.currentTarget.style.background = 'rgba(42,51,82,0.18)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(42,51,82,0.9)';
              e.currentTarget.style.color = 'rgba(160,174,203,0.8)';
              e.currentTarget.style.background = 'transparent';
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
      </div>
    </AuthLayout>
  );
}
