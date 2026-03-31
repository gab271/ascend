import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../../components/layout/auth/AuthLayout';
import { updatePassword } from '../../lib/api/auth';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../context/LanguageContext';

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

const STRENGTH_COLORS = ['', '#FF4D6A', '#FF8A3D', '#F5C451', '#33D1FF', '#33E6A1'];

function PasswordStrength({ password, strengthLabels }) {
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
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: STRENGTH_COLORS[s], transition: 'color 0.3s' }}>
        {strengthLabels[s]}
      </span>
    </div>
  );
}

export default function ResetPassword() {
  const [ready, setReady]         = useState(false);
  const [invalid, setInvalid]     = useState(false);
  const [form, setForm]           = useState({ password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [focused, setFocused]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');
  const navigate                  = useNavigate();
  const { t, translations }       = useLanguage();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    const timeout = setTimeout(() => {
      setInvalid(prev => {
        if (!ready) return true;
        return prev;
      });
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
    return () => clearTimeout(timer);
  }, [done, navigate]);

  const mismatch = form.confirm && form.password !== form.confirm;
  const match    = form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mismatch || !form.password) return;
    setError('');
    setLoading(true);
    const { error } = await updatePassword(form.password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setDone(true);
    }
  };

  /* ── Success screen ─────────────────────────────────────── */
  if (done) {
    return (
      <AuthLayout>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(51,230,161,0.08)', border: '1px solid rgba(51,230,161,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards', boxShadow: '0 0 32px rgba(51,230,161,0.15)' }}>
          <CheckCircle size={30} color="var(--green)" strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 24, animation: 'entry-up 0.55s ease 0.08s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          <span style={{ color: 'var(--text)' }}>{t('auth.reset.restoredLine1')}</span><br />
          <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(51,230,161,0.35)' }}>{t('auth.reset.restoredLine2')}</span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 16, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          {t('auth.reset.restoredDesc')}
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', animation: 'entry-up 0.5s ease 0.18s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          // {t('auth.reset.sessionReset')}
        </div>
      </AuthLayout>
    );
  }

  /* ── Invalid / expired link screen ─────────────────────── */
  if (invalid) {
    return (
      <AuthLayout>
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
          <ShieldAlert size={30} color="#FF4D6A" strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 24, animation: 'entry-up 0.55s ease 0.08s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          <span style={{ color: 'var(--text)' }}>{t('auth.reset.invalidLine1')}</span><br />
          <span style={{ color: '#FF4D6A' }}>{t('auth.reset.invalidLine2')}</span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 40, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          {t('auth.reset.invalidDesc')}
        </p>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: '1px solid rgba(245,196,81,0.4)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'var(--gold)', cursor: 'pointer', transition: 'var(--transition)', animation: 'entry-up 0.5s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,196,81,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,196,81,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,196,81,0.4)'; }}
        >
          <ArrowRight size={14} /> {t('auth.reset.requestNew')}
        </button>
      </AuthLayout>
    );
  }

  /* ── Loading — waiting for Supabase token exchange ──────── */
  if (!ready) {
    return (
      <AuthLayout>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.2em', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          // {t('auth.reset.verifying')}
        </div>
      </AuthLayout>
    );
  }

  /* ── Reset form ─────────────────────────────────────────── */
  return (
    <AuthLayout>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 32, animation: 'entry-left 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text-muted)'}}>//</span> {t('auth.reset.heading')}
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 14, animation: 'entry-up 0.55s ease 0.06s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text)' }}>{t('auth.reset.titleLine1')}</span><br/>
        <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}>{t('auth.reset.titleLine2')}</span>
      </div>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 52, lineHeight: 1.65, maxWidth: 360, animation: 'entry-up 0.55s ease 0.1s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        {t('auth.reset.subtitle')}
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <AuthInput
          label={t('auth.reset.newPassword')}
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={v => setForm({ ...form, password: v })}
          icon={<Lock size={15} />}
          placeholder={t('auth.register.passwordPlaceholder')}
          focused={focused === 'pass'}
          onFocus={() => setFocused('pass')}
          onBlur={() => setFocused(null)}
          delay={0.15}
          suffix={
            <button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(74,90,122,0.9)', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}
            >
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />
        <PasswordStrength password={form.password} strengthLabels={translations.auth.register.strengthLabels} />

        <AuthInput
          label={mismatch ? t('auth.register.confirmMismatch') : match ? t('auth.register.confirmMatch') : t('auth.register.confirmPassword')}
          type={showConf ? 'text' : 'password'}
          value={form.confirm}
          onChange={v => setForm({ ...form, confirm: v })}
          icon={<Lock size={15} />}
          placeholder={t('auth.register.repeatPassword')}
          focused={focused === 'confirm'}
          onFocus={() => setFocused('confirm')}
          onBlur={() => setFocused(null)}
          delay={0.22}
          error={mismatch}
          suffix={
            <button type="button" onClick={() => setShowConf(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(74,90,122,0.9)', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}
            >
              {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 8, marginBottom: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: '#FF4D6A' }}>
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}

        <AuthButton loading={loading} delay={0.3}>
          {loading ? t('auth.reset.saving') : <><span>{t('auth.reset.save')}</span><ArrowRight size={16} /></>}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
