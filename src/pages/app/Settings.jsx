import { useState, useEffect } from 'react';
import { User, Lock, Bell, AlertTriangle, Eye, EyeOff, Check, Shield, Zap, Crown, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { signOut } from '../../lib/api/auth';
import { supabase } from '../../lib/supabase';
import Toggle from '../../components/ui/Toggle';
import SectionCard from '../../components/ui/SectionCard';

/* ═══════════════════════════════════════════════════════════════
   LOCAL PRIMITIVES (page-specific, not shared)
═══════════════════════════════════════════════════════════════ */

function CyberInput({ label, value, onChange, type = 'text', placeholder, readOnly, hint, error, rightElement }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--border)';
  const labelColor  = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: labelColor, transition: 'color 0.2s' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: readOnly ? 'rgba(26,32,53,0.4)' : 'var(--surface)',
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            padding: rightElement ? '11px 44px 11px 14px' : '11px 14px',
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
            color: readOnly ? 'var(--text-muted)' : 'var(--text)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxShadow: focused && !readOnly ? '0 0 0 3px rgba(124,92,255,0.12)' : 'none',
            cursor: readOnly ? 'default' : 'text',
          }}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.06em', lineHeight: 1.5 }}>{hint}</p>
      )}
      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--red)', letterSpacing: '0.06em' }}>⚠ {error}</p>
      )}
    </div>
  );
}

function SettingRow({ label, description, last, children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 0',
      borderBottom: last ? 'none' : '1px solid rgba(42,51,82,0.45)',
    }}>
      <div style={{ flex: 1, marginRight: 24 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 2, letterSpacing: '0.03em' }}>
          {label}
        </div>
        {description && (
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ActionBtn({ onClick, loading, success, label, successLabel, variant = 'primary', disabled, t }) {
  const colors = {
    primary: {
      bg:     success ? 'var(--green)' : 'var(--violet)',
      text:   success ? '#0A0B10' : '#fff',
      shadow: success ? '0 4px 18px rgba(51,230,161,0.3)' : '0 4px 18px rgba(124,92,255,0.3)',
    },
    danger: { bg: 'transparent', text: 'var(--red)', shadow: 'none', border: '1px solid rgba(255,77,106,0.4)' },
    ghost:  { bg: 'transparent', text: 'var(--text-secondary)', shadow: 'none', border: '1px solid var(--border-bright)' },
  };
  const c = colors[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: '10px 20px', borderRadius: 'var(--radius-md)',
        background: c.bg, color: c.text,
        border: c.border ?? 'none',
        cursor: loading || disabled ? 'not-allowed' : 'pointer',
        boxShadow: c.shadow, transition: 'all 0.2s',
        opacity: loading || disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (loading || disabled || success) return;
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 26px rgba(124,92,255,0.5)';
        if (variant === 'danger')  { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.borderColor = 'var(--red)'; }
        if (variant === 'ghost')   { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--text)'; }
      }}
      onMouseLeave={e => {
        if (loading || disabled || success) return;
        if (variant === 'primary') e.currentTarget.style.boxShadow = c.shadow;
        if (variant === 'danger')  { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,77,106,0.4)'; }
        if (variant === 'ghost')   { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }
      }}
    >
      {success ? <Check size={13} /> : loading ? <Zap size={13} style={{ animation: 'pulse-glow 0.8s infinite' }} /> : null}
      {success ? (successLabel ?? (t ? t('common.saved') : 'SAVED')) : loading ? (t ? t('common.processing') : 'PROCESSING...') : label}
    </button>
  );
}

function PasswordStrength({ password, t }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const segColors = ['var(--red)', 'var(--red)', '#F59E0B', 'var(--green)'];
  const labels    = t('settings.security.strengthLabels');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i <= score ? segColors[score - 1] : 'var(--surface-2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      {score > 0 && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: segColors[score - 1], letterSpacing: '0.14em', alignSelf: 'flex-end' }}>
          {labels[score - 1]}
        </span>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TABS
═══════════════════════════════════════════════════════════════ */

const TABS = [
  { id: 'cuenta',         tKey: 'settings.tabs.cuenta',         icon: User,   moduleId: 'SYS.01' },
  { id: 'seguridad',      tKey: 'settings.tabs.seguridad',      icon: Lock,   moduleId: 'SYS.02' },
  { id: 'notificaciones', tKey: 'settings.tabs.notificaciones', icon: Bell,   moduleId: 'SYS.03' },
  { id: 'plan',           tKey: 'settings.tabs.plan',           icon: Crown,  moduleId: 'SYS.04' },
  { id: 'salida',         tKey: 'settings.tabs.salida',         icon: LogOut, moduleId: 'SYS.05' },
];

/* ─── Tab: Cuenta ─────────────────────────────────────────────── */
function TabCuenta({ user, t }) {
  const [username,  setUsername]  = useState('');
  const [loading,   setLoading]   = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [error,     setError]     = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [privSaving, setPrivSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('username, is_private').eq('id', user.id).single()
      .then(({ data }) => {
        if (data?.username)  setUsername(data.username);
        if (data?.is_private != null) setIsPrivate(data.is_private);
      });
  }, [user]);

  const handlePrivacyToggle = async (newValue) => {
    setIsPrivate(newValue);
    setPrivSaving(true);
    await supabase.rpc('set_profile_private', { p_is_private: newValue });
    setPrivSaving(false);
  };

  const handleSave = async () => {
    const clean = username.trim().toUpperCase();
    if (!/^[A-Z0-9_]{3,20}$/.test(clean)) { setError('Solo letras, números y _. Entre 3 y 20 caracteres.'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.rpc('update_username', { p_username: clean });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.01.A" title={t('settings.account.operatorIdentity')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <CyberInput
            label="// USERNAME"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); setSuccess(false); }}
            placeholder="OPERADOR_01"
            error={error}
            hint={t('settings.account.visibleInRanking')}
          />
          <CyberInput
            label="// EMAIL"
            value={user?.email ?? ''}
            readOnly
            hint={t('settings.account.emailReadOnly')}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <ActionBtn onClick={handleSave} loading={loading} success={success} label={t('settings.account.saveChanges')} t={t} />
          </div>
        </div>
      </SectionCard>

      <SectionCard moduleId="SYS.01.B" title={t('settings.account.accountStatus')} status="VERIFICADO" statusColor="var(--cyan)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SettingRow label={t('settings.account.currentPlan')} description={t('settings.account.fullAccess')}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gold)', letterSpacing: '0.14em', background: 'var(--gold-dim)', border: '1px solid rgba(245,196,81,0.2)', padding: '4px 10px', borderRadius: 4 }}>
              OPERADOR
            </div>
          </SettingRow>
          <SettingRow label={t('settings.account.emailVerified')} description={t('settings.account.emailConfirmed')} last>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.12em' }}>
              <Check size={12} /> VERIFICADO
            </div>
          </SettingRow>
        </div>
      </SectionCard>

      <SectionCard
        moduleId="SYS.01.C"
        title={t('settings.account.privacy')}
        status={privSaving ? t('settings.account.savingStatus') : isPrivate ? t('settings.account.privateStatus') : t('settings.account.publicStatus')}
        statusColor={privSaving ? 'var(--text-muted)' : isPrivate ? 'var(--violet)' : 'var(--cyan)'}
      >
        <SettingRow
          label={t('settings.account.profilePrivate')}
          description={isPrivate ? t('settings.account.privateDesc') : t('settings.account.publicDesc')}
          last
        >
          <Toggle value={isPrivate} onChange={handlePrivacyToggle} />
        </SettingRow>
      </SectionCard>
    </div>
  );
}

/* ─── Tab: Seguridad ─────────────────────────────────────────── */
function TabSeguridad({ t }) {
  const [newPwd, setNewPwd]         = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConf]  = useState(false);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const handleChange = async () => {
    if (newPwd.length < 8) { setError(t('settings.security.passwordTooShort')); return; }
    if (newPwd !== confirm) { setError(t('settings.security.passwordMismatch')); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.updateUser({ password: newPwd });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setNewPwd(''); setConfirm('');
    setTimeout(() => setSuccess(false), 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.02.A" title={t('settings.security.changePassword')} status={t('settings.security.protected')} statusColor="var(--cyan)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <CyberInput
            label={t('settings.security.newPassword')}
            type={showNew ? 'text' : 'password'}
            value={newPwd}
            onChange={e => { setNewPwd(e.target.value); setError(''); }}
            placeholder="••••••••••••"
            hint={t('settings.security.minChars')}
            error={error}
            rightElement={
              <div onClick={() => setShowNew(v => !v)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </div>
            }
          />
          {newPwd.length > 0 && <PasswordStrength password={newPwd} t={t} />}
          <CyberInput
            label={t('settings.security.confirmPassword')}
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            placeholder="••••••••••••"
            error={confirm.length > 0 && confirm !== newPwd ? t('settings.security.passwordMismatch') : ''}
            rightElement={
              <div onClick={() => setShowConf(v => !v)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </div>
            }
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <ActionBtn onClick={handleChange} loading={loading} success={success} label={t('settings.security.updatePassword')} successLabel={t('settings.security.passwordUpdated')} t={t} />
          </div>
        </div>
      </SectionCard>

      <SectionCard moduleId="SYS.02.B" title={t('settings.security.activeSessions')} status={t('settings.security.oneActive')} statusColor="var(--green)">
        <SettingRow label={t('settings.security.thisDevice')} description={t('settings.security.currentSession')} last>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--green)', letterSpacing: '0.12em', display: 'flex', alignItems: 'center', gap: 5 }}>
            <Shield size={11} /> {t('settings.security.active')}
          </div>
        </SettingRow>
      </SectionCard>
    </div>
  );
}

/* ─── Tab: Notificaciones ────────────────────────────────────── */
function TabNotificaciones({ t }) {
  const [notifs, setNotifs] = useState({
    missionComplete: false,
    levelUp:         false,
    streakReminder:  false,
    xpGained:        false,
    rankingUpdate:   false,
    weeklyReport:    false,
    newReward:       false,
    systemAlerts:    false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = key => setNotifs(s => ({ ...s, [key]: !s[key] }));

  const ROWS_PROGRESO = [
    { key: 'missionComplete', label: t('settings.notifications.missionComplete'),  description: t('settings.notifications.missionCompleteDesc') },
    { key: 'xpGained',        label: t('settings.notifications.xpGained'),         description: t('settings.notifications.xpGainedDesc') },
    { key: 'levelUp',         label: t('settings.notifications.levelUp'),           description: t('settings.notifications.levelUpDesc') },
    { key: 'newReward',       label: t('settings.notifications.newReward'),         description: t('settings.notifications.newRewardDesc') },
  ];
  const ROWS_SISTEMA = [
    { key: 'streakReminder', label: t('settings.notifications.streakReminder'), description: t('settings.notifications.streakReminderDesc') },
    { key: 'rankingUpdate',  label: t('settings.notifications.rankingUpdate'),  description: t('settings.notifications.rankingUpdateDesc') },
    { key: 'weeklyReport',   label: t('settings.notifications.weeklyReport'),   description: t('settings.notifications.weeklyReportDesc') },
    { key: 'systemAlerts',   label: t('settings.notifications.systemAlerts'),   description: t('settings.notifications.systemAlertsDesc') },
  ];

  const renderRows = (rows) => rows.map(({ key, label, description }, i) => (
    <SettingRow key={key} label={label} description={description} last={i === rows.length - 1}>
      <Toggle value={notifs[key]} onChange={() => toggle(key)} />
    </SettingRow>
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.03.A" title={t('settings.notifications.progressTitle')}>{renderRows(ROWS_PROGRESO)}</SectionCard>
      <SectionCard moduleId="SYS.03.B" title={t('settings.notifications.systemTitle')}>{renderRows(ROWS_SISTEMA)}</SectionCard>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActionBtn
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          success={saved}
          label={t('settings.notifications.savePreferences')}
          successLabel={t('settings.notifications.preferencesSaved')}
          t={t}
        />
      </div>
    </div>
  );
}

/* ─── Tab: Plan ──────────────────────────────────────────────── */

function PlanCard({ name, price, priceLabel, features, current, accent, badge, disabled, t }) {
  return (
    <div style={{
      flex: 1, borderRadius: 'var(--radius-lg)',
      border: `1px solid ${current ? accent : 'var(--border)'}`,
      background: current
        ? `linear-gradient(160deg, ${accent}0D 0%, var(--panel) 100%)`
        : 'var(--panel)',
      overflow: 'hidden',
      position: 'relative',
      transition: 'border-color 0.2s',
    }}>
      {/* Top accent line */}
      <div style={{
        height: 3,
        background: current
          ? `linear-gradient(90deg, transparent, ${accent}, transparent)`
          : 'var(--border)',
      }} />

      <div style={{ padding: '24px 24px 28px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '0.08em',
              color: current ? accent : 'var(--text)', lineHeight: 1,
              textShadow: current ? `0 0 24px ${accent}44` : 'none',
            }}>
              {name}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--text-muted)', marginTop: 4,
            }}>
              {priceLabel}
            </div>
          </div>
          {badge && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em',
              color: current ? accent : 'var(--text-muted)',
              background: current ? `${accent}18` : 'var(--surface)',
              border: `1px solid ${current ? accent + '44' : 'var(--border)'}`,
              borderRadius: 4, padding: '4px 10px',
              textTransform: 'uppercase',
            }}>
              {badge}
            </div>
          )}
        </div>

        {/* Price */}
        <div style={{ marginBottom: 24 }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 48,
            color: current ? accent : 'var(--text-muted)',
            lineHeight: 1,
          }}>
            {price}
          </span>
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: current ? `${accent}22` : 'var(--surface)',
                border: `1px solid ${current ? accent + '55' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Check size={9} color={current ? accent : 'var(--text-muted)'} strokeWidth={3} />
              </div>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: current ? 'var(--text-secondary)' : 'var(--text-muted)',
                lineHeight: 1.4,
              }}>
                {f}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 28 }}>
          {current ? (
            <div style={{
              width: '100%', padding: '11px',
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: accent, background: `${accent}14`,
              border: `1px solid ${accent}44`,
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Check size={13} strokeWidth={3} /> {t('settings.plan.currentPlan')}
            </div>
          ) : (
            <button
              disabled={disabled}
              style={{
                width: '100%', padding: '11px',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: disabled ? 'var(--text-muted)' : '#0A0B10',
                background: disabled ? 'var(--surface)' : accent,
                border: `1px solid ${disabled ? 'var(--border)' : accent}`,
                borderRadius: 'var(--radius-md)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {disabled ? t('settings.plan.comingSoon') : t('settings.plan.upgradeTo')(name)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TabPlan({ t }) {
  const translations = useLanguage().translations;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Current plan banner */}
      <SectionCard moduleId="SYS.04.A" title={t('settings.plan.subscription')} status={t('settings.plan.active')} statusColor="var(--violet)">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '0.08em',
              color: 'var(--gold)', marginBottom: 4,
              textShadow: '0 0 20px rgba(245,196,81,0.3)',
            }}>
              OPERADOR
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
              {t('settings.plan.operatorDesc')}
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.16em',
            color: 'var(--gold)', background: 'var(--gold-dim)',
            border: '1px solid rgba(245,196,81,0.25)',
            borderRadius: 4, padding: '5px 12px',
          }}>
            {t('settings.plan.active')}
          </div>
        </div>
      </SectionCard>

      {/* Plan comparison */}
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.22em',
          color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase',
        }}>
          {t('settings.plan.comparePlans')}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <PlanCard
            name="OPERADOR"
            price={t('settings.plan.free')}
            priceLabel={t('settings.plan.noTimeLimit')}
            features={translations.settings.plan.operatorFeatures}
            current
            accent="var(--gold)"
            badge={t('settings.plan.yourPlan')}
            t={t}
          />
          <PlanCard
            name="PRO"
            price="—"
            priceLabel={t('settings.plan.priceTBD')}
            features={translations.settings.plan.proFeatures}
            accent="var(--violet)"
            badge={t('settings.plan.comingSoon')}
            disabled
            t={t}
          />
        </div>
      </div>

      {/* FAQ note */}
      <div style={{
        padding: '14px 18px', borderRadius: 'var(--radius-md)',
        background: 'rgba(124,92,255,0.04)',
        border: '1px solid rgba(124,92,255,0.15)',
        fontFamily: 'var(--font-body)', fontSize: 13,
        color: 'var(--text-muted)', lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--violet)', fontFamily: 'var(--font-ui)', fontSize: 12, letterSpacing: '0.08em' }}>
          ASCEND PRO
        </strong>{' '}{t('settings.plan.proNote')}
      </div>
    </div>
  );
}

/* ─── Tab: Salida ─────────────────────────────────────────────── */
function TabPeligro({ onSignOut, t }) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { user } = useAuth();

  const canDelete = confirmText === user?.email;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.05.A" title={t('settings.exit.activeSession')} status={t('settings.exit.online')} statusColor="var(--green)">
        <SettingRow label={t('settings.exit.signOutLabel')} description={t('settings.exit.signOutDesc')} last>
          <ActionBtn onClick={onSignOut} label={t('settings.exit.signOutBtn')} variant="ghost" t={t} />
        </SettingRow>
      </SectionCard>

      <SectionCard moduleId="SYS.05.B" title={t('settings.exit.resetTitle')} status={t('settings.exit.notAvailable')} statusColor="var(--text-muted)">
        <SettingRow label={t('settings.exit.resetLabel')} description={t('settings.exit.resetDesc')} last>
          <ActionBtn label={t('settings.exit.resetBtn')} variant="danger" disabled t={t} />
        </SettingRow>
      </SectionCard>

      <SectionCard moduleId="SYS.05.C" title={t('settings.exit.deleteTitle')} status={t('settings.exit.danger')} statusColor="var(--red)" style={{ border: '1px solid rgba(255,77,106,0.2)' }}>
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'rgba(255,77,106,0.05)', border: '1px solid rgba(255,77,106,0.15)',
          borderRadius: 'var(--radius-md)',
          marginBottom: showDelete ? 20 : 0,
        }}>
          <AlertTriangle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {t('settings.exit.deleteWarning')}
            <strong style={{ color: '#fff' }}>{t('settings.exit.deleteWarningBold')}</strong>
            {t('settings.exit.deleteWarningEnd')}
          </p>
        </div>

        {!showDelete ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <ActionBtn onClick={() => setShowDelete(true)} label={t('settings.exit.deleteBtn')} variant="danger" t={t} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <CyberInput
              label={t('settings.exit.confirmLabel')(user?.email ?? '')}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={user?.email ?? 'email@example.com'}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDelete(false); setConfirmText(''); }}
                style={{
                  flex: 1, padding: '10px',
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                }}
              >
                {t('settings.exit.cancel')}
              </button>
              <button
                disabled={!canDelete}
                style={{
                  flex: 1, padding: '10px',
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: canDelete ? 'var(--red)' : 'rgba(255,77,106,0.2)',
                  color: canDelete ? '#fff' : 'rgba(255,77,106,0.4)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  cursor: canDelete ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {t('settings.exit.confirmDelete')}
              </button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN SETTINGS PAGE
═══════════════════════════════════════════════════════════════ */
export default function Settings() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cuenta');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const content = {
    cuenta:         <TabCuenta user={user} t={t} />,
    seguridad:      <TabSeguridad t={t} />,
    notificaciones: <TabNotificaciones t={t} />,
    plan:           <TabPlan t={t} />,
    salida:         <TabPeligro onSignOut={handleSignOut} t={t} />,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, alignItems: 'start', maxWidth: 880 }}>

      {/* ── Left tab nav ── */}
      <div style={{
        background: 'var(--panel)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        position: 'sticky', top: 96,
      }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(26,32,53,0.35)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>
            // CONFIG_MÓDULOS
          </span>
        </div>

        {TABS.map(({ id, tKey, icon: Icon, moduleId }) => {
          const isActive     = activeTab === id;
          const isDanger     = id === 'salida';
          const accentColor  = isDanger ? 'var(--red)' : 'var(--violet)';
          const accentDim    = isDanger ? 'rgba(255,77,106,0.08)' : 'var(--violet-dim)';

          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 14px 12px 16px',
                background: isActive ? accentDim : 'transparent',
                borderLeft: `3px solid ${isActive ? accentColor : 'transparent'}`,
                borderRight: 'none', borderTop: 'none',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(42,51,82,0.35)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <Icon size={14} color={isActive ? accentColor : 'var(--text-muted)'} strokeWidth={isActive ? 2.5 : 2} />
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: isActive ? 700 : 600, fontSize: 13, color: isActive ? (isDanger ? 'var(--red)' : 'var(--text)') : 'var(--text-secondary)', letterSpacing: '0.04em' }}>
                  {t(tKey)}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: isActive ? (isDanger ? 'rgba(255,77,106,0.55)' : 'rgba(124,92,255,0.6)') : 'var(--text-muted)', letterSpacing: '0.12em', marginTop: 1 }}>
                  {moduleId}
                </div>
              </div>
            </button>
          );
        })}

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'rgba(10,11,16,0.3)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', lineHeight: 1.7 }}>
            <div>ASCEND SISTEMA v1.0</div>
            <div style={{ color: 'rgba(74,90,122,0.6)', marginTop: 2 }}>
              {user?.email?.slice(0, 22)}{user?.email?.length > 22 ? '…' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div>{content[activeTab]}</div>
    </div>
  );
}
