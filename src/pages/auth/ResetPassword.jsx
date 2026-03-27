import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import AuthLayout, { AuthInput, AuthButton } from '../../components/layout/auth/AuthLayout';
import { updatePassword } from '../../lib/api/auth';
import { supabase } from '../../lib/supabase';

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
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.14em', color: STRENGTH_COLORS[s], transition: 'color 0.3s' }}>
        {STRENGTH_LABELS[s]}
      </span>
    </div>
  );
}

export default function ResetPassword() {
  const [ready, setReady]         = useState(false); // recovery session confirmed
  const [invalid, setInvalid]     = useState(false); // link expired / already used
  const [form, setForm]           = useState({ password: '', confirm: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [focused, setFocused]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');
  const navigate                  = useNavigate();

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when it processes the link's token.
    // We wait for it before showing the form — if it never fires the link is bad.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });

    // Give Supabase ~3 s to process the token; if nothing happens, flag invalid.
    const timeout = setTimeout(() => {
      setInvalid(prev => {
        // Only mark invalid if we haven't gone ready yet
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

  // Redirect to dashboard 3 s after success
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
    return () => clearTimeout(t);
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
          <span style={{ color: 'var(--text)' }}>ACCESO</span><br />
          <span style={{ color: 'var(--green)', textShadow: '0 0 30px rgba(51,230,161,0.35)' }}>RESTAURADO</span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 16, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          Tu contraseña ha sido actualizada. Redirigiendo al dashboard...
        </p>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.15em', animation: 'entry-up 0.5s ease 0.18s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          // SESIÓN REINICIADA
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
          <span style={{ color: 'var(--text)' }}>ENLACE</span><br />
          <span style={{ color: '#FF4D6A' }}>INVÁLIDO</span>
        </div>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 380, marginBottom: 40, animation: 'entry-up 0.55s ease 0.14s forwards', opacity: 0, animationFillMode: 'forwards' }}>
          El enlace expiró o ya fue utilizado. Solicita uno nuevo desde la pantalla de recuperación.
        </p>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: 'transparent', border: '1px solid rgba(245,196,81,0.4)', borderRadius: 8, fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', color: 'var(--gold)', cursor: 'pointer', transition: 'var(--transition)', animation: 'entry-up 0.5s ease 0.2s forwards', opacity: 0, animationFillMode: 'forwards' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,196,81,0.08)'; e.currentTarget.style.borderColor = 'rgba(245,196,81,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(245,196,81,0.4)'; }}
        >
          <ArrowRight size={14} /> Solicitar nuevo enlace
        </button>
      </AuthLayout>
    );
  }

  /* ── Loading — waiting for Supabase token exchange ──────── */
  if (!ready) {
    return (
      <AuthLayout>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.2em', animation: 'pulse-glow 2s ease-in-out infinite' }}>
          // VERIFICANDO ENLACE...
        </div>
      </AuthLayout>
    );
  }

  /* ── Reset form ─────────────────────────────────────────── */
  return (
    <AuthLayout>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold)', marginBottom: 32, animation: 'entry-left 0.5s ease forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text-muted)'}}>//</span> NUEVA CONTRASEÑA
      </div>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(52px, 5vw, 80px)', lineHeight: 0.88, letterSpacing: '0.02em', marginBottom: 14, animation: 'entry-up 0.55s ease 0.06s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        <span style={{ color: 'var(--text)' }}>RESTABLECER</span><br />
        <span style={{ color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.22)' }}>ACCESO</span>
      </div>

      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 52, lineHeight: 1.65, maxWidth: 360, animation: 'entry-up 0.55s ease 0.1s forwards', opacity: 0, animationFillMode: 'forwards' }}>
        Elige una contraseña nueva y segura para tu cuenta.
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 420 }}>
        <AuthInput
          label="Nueva contraseña"
          type={showPass ? 'text' : 'password'}
          value={form.password}
          onChange={v => setForm({ ...form, password: v })}
          icon={<Lock size={15} />}
          placeholder="Mín. 8 caracteres"
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
        <PasswordStrength password={form.password} />

        <AuthInput
          label={mismatch ? 'Confirmar contraseña — ✗ no coincide' : match ? 'Confirmar contraseña — ✓ coincide' : 'Confirmar contraseña'}
          type={showConf ? 'text' : 'password'}
          value={form.confirm}
          onChange={v => setForm({ ...form, confirm: v })}
          icon={<Lock size={15} />}
          placeholder="Repite la contraseña"
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
          {loading ? 'GUARDANDO...' : <><span>GUARDAR CONTRASEÑA</span><ArrowRight size={16} /></>}
        </AuthButton>
      </form>
    </AuthLayout>
  );
}
