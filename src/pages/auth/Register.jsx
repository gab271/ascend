import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../../components/layout/auth/AuthLayout';
import { signUp } from '../../lib/api/auth';
import { useLanguage } from '../../hooks/useLanguage';

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

export default function Register() {
  const [form, setForm]           = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [focused, setFocused]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { t, translations }       = useLanguage();

  const mismatch = form.confirm && form.password !== form.confirm;
  const match    = form.confirm && form.password === form.confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mismatch) return;
    setError('');
    setLoading(true);
    const { error } = await signUp({ email: form.email, password: form.password, username: form.username });
    if (error) {
      setError(error.message?.includes('already registered') ? t('auth.register.emailExists') : error.message);
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout variant="register">
        <div style={{ width: '100%' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(51,230,161,0.08)', border: '1px solid rgba(51,230,161,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36, animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards', boxShadow: '0 0 32px rgba(51,230,161,0.15)' }}>
            <CheckCircle2 size={30} color="var(--green)" strokeWidth={1.5} />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,5vw,72px)', lineHeight: 0.88, marginBottom: 24, animation: 'entry-up 0.55s ease 0.08s forwards', opacity: 0, animationFillMode: 'forwards' }}>
            <span style={{ color: 'var(--text)' }}>{t('auth.register.emailSentLine1')}</span><br />
            <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(51,230,161,0.35)' }}>{t('auth.register.emailSentLine2')}</span>
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 12, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
            {t('auth.register.emailSentDesc')}{' '}
            <strong style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>{form.email}</strong>.{' '}
            {t('auth.register.clickToActivate')}
          </p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em', color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s', animation: 'entry-up 0.5s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            {t('auth.register.backToLogin')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="register">
      <div style={{ width: '100%' }}>

        {/* Form heading */}
        <div style={{
          marginBottom: 32,
          animation: 'entry-up 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 50,
            lineHeight: 0.9, letterSpacing: '0.04em', color: '#F5F7FB',
            marginBottom: 10,
          }}>
            {t('auth.register.title')[0]}<br />{t('auth.register.title')[1]}
          </div>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 13,
            color: 'rgba(160,174,203,0.45)', fontWeight: 500,
          }}>
            {t('auth.register.subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <AuthInput label={t('auth.register.username')} type="text" value={form.username} onChange={v => setForm({ ...form, username: v })} icon={<User size={15} />} placeholder={t('auth.register.usernamePlaceholder')} focused={focused === 'username'} onFocus={() => setFocused('username')} onBlur={() => setFocused(null)} delay={0.1} />
          <AuthInput label={t('auth.login.email')} type="email" value={form.email} onChange={v => setForm({ ...form, email: v })} icon={<Mail size={15} />} placeholder={t('auth.register.emailPlaceholder')} focused={focused === 'email'} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} delay={0.16} />
          <AuthInput label={t('settings.security.newPassword')} type={showPass ? 'text' : 'password'} value={form.password} onChange={v => setForm({ ...form, password: v })} icon={<Lock size={15} />} placeholder={t('auth.register.passwordPlaceholder')} focused={focused === 'pass'} onFocus={() => setFocused('pass')} onBlur={() => setFocused(null)} delay={0.22}
            suffix={<button type="button" onClick={() => setShowPass(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(74,90,122,0.9)', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
          />
          <PasswordStrength password={form.password} strengthLabels={translations.auth.register.strengthLabels} />
          <AuthInput
            label={mismatch ? t('auth.register.confirmMismatch') : match ? t('auth.register.confirmMatch') : t('auth.register.confirmPassword')}
            type={showConf ? 'text' : 'password'} value={form.confirm} onChange={v => setForm({ ...form, confirm: v })} icon={<Lock size={15} />} placeholder={t('auth.register.repeatPassword')} focused={focused === 'confirm'} onFocus={() => setFocused('confirm')} onBlur={() => setFocused(null)} delay={0.28} error={mismatch}
            suffix={<button type="button" onClick={() => setShowConf(s => !s)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(74,90,122,0.9)', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(160,174,203,0.9)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(74,90,122,0.9)'}>{showConf ? <EyeOff size={15} /> : <Eye size={15} />}</button>}
          />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 24, animation: 'entry-up 0.5s ease 0.32s forwards', opacity: 0, animationFillMode: 'forwards' }}>
            <CheckCircle2 size={13} color="rgba(51,230,161,0.5)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'rgba(160,174,203,0.5)', lineHeight: 1.6, margin: 0 }}>
              {t('auth.register.terms')}{' '}
              <span style={{ color: '#33D1FF', cursor: 'pointer', borderBottom: '1px solid rgba(51,209,255,0.25)' }}>{t('auth.register.termsLink')}</span>
              {' '}{t('auth.register.and')}{' '}
              <span style={{ color: '#33D1FF', cursor: 'pointer', borderBottom: '1px solid rgba(51,209,255,0.25)' }}>{t('auth.register.privacyLink')}</span>.
            </p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,77,106,0.08)', border: '1px solid rgba(255,77,106,0.3)', borderRadius: 8, marginBottom: 16, fontFamily: 'var(--font-ui)', fontSize: 13, color: '#FF4D6A' }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <AuthButton loading={loading} delay={0.38} variant="cyan">
            {loading ? t('auth.register.creating') : <><span>{t('auth.register.createAccount')}</span><ArrowRight size={15} style={{ flexShrink: 0 }} /></>}
          </AuthButton>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 18, flexWrap: 'wrap', animation: 'entry-up 0.5s ease 0.44s forwards', opacity: 0, animationFillMode: 'forwards' }}>
            {[t('auth.register.free'), t('auth.register.noCard'), t('auth.register.dayOneProgress')].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <CheckCircle2 size={10} color="rgba(51,230,161,0.45)" />
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'rgba(160,174,203,0.4)', fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
