import { useState, useEffect } from 'react';
import { User, Lock, Bell, AlertTriangle, Eye, EyeOff, Check, Save, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../lib/api/auth';
import { supabase } from '../lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════════════ */

function Toggle({ value, onChange }) {
  return (
    <div
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: value ? 'var(--violet)' : 'var(--surface-2)',
        border: `1px solid ${value ? 'rgba(124,92,255,0.7)' : 'var(--border)'}`,
        position: 'relative', cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: value ? '0 0 12px rgba(124,92,255,0.35)' : 'none',
        flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: value ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        background: value ? '#fff' : 'var(--border-bright)',
        transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: value ? '0 0 6px rgba(124,92,255,0.5)' : 'none',
      }} />
    </div>
  );
}

function CyberInput({ label, value, onChange, type = 'text', placeholder, readOnly, hint, error, rightElement }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--border)';
  const labelColor = error ? 'var(--red)' : focused ? 'var(--violet)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: labelColor, transition: 'color 0.2s',
        }}>
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
          <div style={{
            position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
          }}>
            {rightElement}
          </div>
        )}
      </div>
      {hint && !error && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--text-muted)', letterSpacing: '0.06em', lineHeight: 1.5,
        }}>
          {hint}
        </p>
      )}
      {error && (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--red)', letterSpacing: '0.06em',
        }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({ moduleId, title, status = 'ACTIVO', statusColor = 'var(--green)', children, style }) {
  return (
    <div style={{
      background: 'var(--panel)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style,
    }}>
      <div style={{
        padding: '14px 22px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(26,32,53,0.35)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--text-muted)', letterSpacing: '0.14em',
          }}>
            {moduleId}
          </span>
          <div style={{ width: 1, height: 12, background: 'var(--border-bright)', opacity: 0.5 }} />
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-secondary)',
          }}>
            {title}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 5, height: 5, borderRadius: '50%', background: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: statusColor, letterSpacing: '0.16em',
          }}>
            {status}
          </span>
        </div>
      </div>
      <div style={{ padding: '22px 22px' }}>
        {children}
      </div>
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
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
          color: 'var(--text)', marginBottom: 2, letterSpacing: '0.03em',
        }}>
          {label}
        </div>
        {description && (
          <div style={{
            fontFamily: 'var(--font-body)', fontSize: 12,
            color: 'var(--text-muted)', lineHeight: 1.55,
          }}>
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function ActionBtn({ onClick, loading, success, label, successLabel = 'GUARDADO', variant = 'primary', disabled }) {
  const colors = {
    primary: {
      bg: success ? 'var(--green)' : 'var(--violet)',
      text: success ? '#0A0B10' : '#fff',
      shadow: success ? '0 4px 18px rgba(51,230,161,0.3)' : '0 4px 18px rgba(124,92,255,0.3)',
    },
    danger: {
      bg: 'transparent',
      text: 'var(--red)',
      shadow: 'none',
      border: '1px solid rgba(255,77,106,0.4)',
    },
    ghost: {
      bg: 'transparent',
      text: 'var(--text-secondary)',
      shadow: 'none',
      border: '1px solid var(--border-bright)',
    },
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
        boxShadow: c.shadow,
        transition: 'all 0.2s',
        opacity: loading || disabled ? 0.6 : 1,
      }}
      onMouseEnter={e => {
        if (loading || disabled || success) return;
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 26px rgba(124,92,255,0.5)';
        if (variant === 'danger') { e.currentTarget.style.background = 'var(--red-dim)'; e.currentTarget.style.borderColor = 'var(--red)'; }
        if (variant === 'ghost') { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--text)'; }
      }}
      onMouseLeave={e => {
        if (loading || disabled || success) return;
        if (variant === 'primary') e.currentTarget.style.boxShadow = c.shadow;
        if (variant === 'danger') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,77,106,0.4)'; }
        if (variant === 'ghost') { e.currentTarget.style.borderColor = 'var(--border-bright)'; e.currentTarget.style.color = 'var(--text-secondary)'; }
      }}
    >
      {success ? <Check size={13} /> : loading ? <Zap size={13} style={{ animation: 'pulse-glow 0.8s infinite' }} /> : null}
      {success ? successLabel : loading ? 'PROCESANDO...' : label}
    </button>
  );
}

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const segColors = ['var(--red)', 'var(--red)', '#F59E0B', 'var(--green)'];
  const labels = ['MUY DÉBIL', 'DÉBIL', 'MEDIA', 'FUERTE'];

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
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: segColors[score - 1], letterSpacing: '0.14em', alignSelf: 'flex-end',
        }}>
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
  { id: 'cuenta',         label: 'Cuenta',          icon: User,          moduleId: 'SYS.01' },
  { id: 'seguridad',      label: 'Seguridad',        icon: Lock,          moduleId: 'SYS.02' },
  { id: 'notificaciones', label: 'Notificaciones',   icon: Bell,          moduleId: 'SYS.03' },
  { id: 'peligro',        label: 'Zona peligrosa',   icon: AlertTriangle, moduleId: 'SYS.04' },
];

/* ─── Tab: Cuenta ─────────────────────────────────────────────── */
function TabCuenta({ user }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data?.username) setUsername(data.username); });
  }, [user]);

  const handleSave = async () => {
    const clean = username.trim().toUpperCase();
    if (!/^[A-Z0-9_]{3,20}$/.test(clean)) {
      setError('Solo letras, números y _. Entre 3 y 20 caracteres.');
      return;
    }
    setLoading(true); setError('');
    const { error: err } = await supabase.rpc('update_username', { p_username: clean });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.01.A" title="Identidad del operador">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <CyberInput
            label="// USERNAME"
            value={username}
            onChange={e => { setUsername(e.target.value); setError(''); setSuccess(false); }}
            placeholder="OPERADOR_01"
            error={error}
            hint="Visible en el ranking global y tu perfil público."
          />
          <CyberInput
            label="// EMAIL"
            value={user?.email ?? ''}
            readOnly
            hint="El email no puede cambiarse desde aquí. Contacta soporte."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <ActionBtn
              onClick={handleSave}
              loading={loading}
              success={success}
              label="GUARDAR CAMBIOS"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard moduleId="SYS.01.B" title="Estado de la cuenta" status="VERIFICADO" statusColor="var(--cyan)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <SettingRow label="Plan actual" description="Acceso completo a todas las funciones de ASCEND.">
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10,
              color: 'var(--gold)', letterSpacing: '0.14em',
              background: 'var(--gold-dim)', border: '1px solid rgba(245,196,81,0.2)',
              padding: '4px 10px', borderRadius: 4,
            }}>
              OPERADOR
            </div>
          </SettingRow>
          <SettingRow label="Email verificado" description="Tu dirección de correo ha sido confirmada." last>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontFamily: 'var(--font-mono)', fontSize: 9,
              color: 'var(--green)', letterSpacing: '0.12em',
            }}>
              <Check size={12} />
              VERIFICADO
            </div>
          </SettingRow>
        </div>
      </SectionCard>
    </div>
  );
}

/* ─── Tab: Seguridad ─────────────────────────────────────────── */
function TabSeguridad() {
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async () => {
    if (newPwd.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (newPwd !== confirm) { setError('Las contraseñas no coinciden.'); return; }
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
      <SectionCard moduleId="SYS.02.A" title="Cambiar contraseña" status="PROTEGIDO" statusColor="var(--cyan)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <CyberInput
            label="// NUEVA CONTRASEÑA"
            type={showNew ? 'text' : 'password'}
            value={newPwd}
            onChange={e => { setNewPwd(e.target.value); setError(''); }}
            placeholder="••••••••••••"
            hint="Mínimo 8 caracteres."
            error={error}
            rightElement={
              <div onClick={() => setShowNew(v => !v)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </div>
            }
          />
          {newPwd.length > 0 && <PasswordStrength password={newPwd} />}
          <CyberInput
            label="// CONFIRMAR CONTRASEÑA"
            type={showConfirm ? 'text' : 'password'}
            value={confirm}
            onChange={e => { setConfirm(e.target.value); setError(''); }}
            placeholder="••••••••••••"
            error={confirm.length > 0 && confirm !== newPwd ? 'Las contraseñas no coinciden.' : ''}
            rightElement={
              <div onClick={() => setShowConfirm(v => !v)} style={{ cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
              </div>
            }
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
            <ActionBtn
              onClick={handleChange}
              loading={loading}
              success={success}
              label="ACTUALIZAR CONTRASEÑA"
              successLabel="CONTRASEÑA ACTUALIZADA"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard moduleId="SYS.02.B" title="Sesiones activas" status="1 ACTIVA" statusColor="var(--green)">
        <SettingRow
          label="Este dispositivo"
          description="Sesión actual — iniciada con PKCE flow seguro."
          last
        >
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            color: 'var(--green)', letterSpacing: '0.12em',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <Shield size={11} />
            ACTIVA
          </div>
        </SettingRow>
      </SectionCard>
    </div>
  );
}

/* ─── Tab: Notificaciones ────────────────────────────────────── */
function TabNotificaciones() {
  const [notifs, setNotifs] = useState({
    missionComplete: true,
    levelUp: true,
    streakReminder: true,
    xpGained: false,
    rankingUpdate: false,
    weeklyReport: true,
    newReward: true,
    systemAlerts: false,
  });
  const [saved, setSaved] = useState(false);

  const toggle = key => setNotifs(s => ({ ...s, [key]: !s[key] }));

  const ROWS_PROGRESO = [
    { key: 'missionComplete', label: 'Misión completada',    description: 'Al completar una misión diaria' },
    { key: 'xpGained',        label: 'XP ganado',            description: 'Confirmación de XP recibido en cada acción' },
    { key: 'levelUp',         label: 'Subida de nivel',      description: 'Cuando alcances un nuevo nivel' },
    { key: 'newReward',       label: 'Nueva recompensa',     description: 'Al desbloquear título, frame o fondo' },
  ];
  const ROWS_SISTEMA = [
    { key: 'streakReminder',  label: 'Recordatorio de racha', description: 'Si llevas +20h sin completar misiones' },
    { key: 'rankingUpdate',   label: 'Cambio en ranking',    description: 'Cuando tu posición en el ranking cambie' },
    { key: 'weeklyReport',    label: 'Reporte semanal',      description: 'Resumen de progreso cada lunes' },
    { key: 'systemAlerts',    label: 'Alertas del sistema',  description: 'Mantenimiento y actualizaciones de ASCEND' },
  ];

  const renderRows = (rows) => rows.map(({ key, label, description }, i) => (
    <SettingRow key={key} label={label} description={description} last={i === rows.length - 1}>
      <Toggle value={notifs[key]} onChange={() => toggle(key)} />
    </SettingRow>
  ));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <SectionCard moduleId="SYS.03.A" title="Progreso y logros">
        {renderRows(ROWS_PROGRESO)}
      </SectionCard>
      <SectionCard moduleId="SYS.03.B" title="Sistema y alertas">
        {renderRows(ROWS_SISTEMA)}
      </SectionCard>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ActionBtn
          onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
          success={saved}
          label="GUARDAR PREFERENCIAS"
          successLabel="PREFERENCIAS GUARDADAS"
        />
      </div>
    </div>
  );
}

/* ─── Tab: Zona peligrosa ────────────────────────────────────── */
function TabPeligro({ onSignOut }) {
  const [showDelete, setShowDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { user } = useAuth();

  const canDelete = confirmText === user?.email;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Sign out */}
      <SectionCard moduleId="SYS.04.A" title="Sesión activa" status="EN LÍNEA" statusColor="var(--green)">
        <SettingRow
          label="Cerrar sesión"
          description="Salir de tu cuenta en este dispositivo. Tu progreso y datos se conservan."
          last
        >
          <ActionBtn onClick={onSignOut} label="CERRAR SESIÓN" variant="ghost" />
        </SettingRow>
      </SectionCard>

      {/* Reset progress — placeholder */}
      <SectionCard
        moduleId="SYS.04.B"
        title="Reiniciar progreso"
        status="NO DISPONIBLE"
        statusColor="var(--text-muted)"
      >
        <SettingRow
          label="Resetear cuenta"
          description="Elimina todo tu XP, nivel y misiones completadas, manteniendo tu cuenta activa. Operación no disponible en esta versión."
          last
        >
          <ActionBtn label="REINICIAR" variant="danger" disabled />
        </SettingRow>
      </SectionCard>

      {/* Delete account */}
      <SectionCard
        moduleId="SYS.04.C"
        title="Eliminar cuenta"
        status="PELIGRO"
        statusColor="var(--red)"
        style={{ border: '1px solid rgba(255,77,106,0.2)' }}
      >
        {/* Warning banner */}
        <div style={{
          display: 'flex', gap: 12, alignItems: 'flex-start',
          padding: '12px 14px',
          background: 'rgba(255,77,106,0.05)',
          border: '1px solid rgba(255,77,106,0.15)',
          borderRadius: 'var(--radius-md)',
          marginBottom: showDelete ? 20 : 0,
        }}>
          <AlertTriangle size={15} color="var(--red)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13,
            color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0,
          }}>
            Esta acción es <strong style={{ color: '#fff' }}>permanente e irreversible</strong>.
            {' '}Todo tu progreso, XP, misiones, badges y cosméticos serán eliminados para siempre.
          </p>
        </div>

        {!showDelete ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <ActionBtn
              onClick={() => setShowDelete(true)}
              label="ELIMINAR MI CUENTA"
              variant="danger"
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <CyberInput
              label={`// ESCRIBE TU EMAIL PARA CONFIRMAR: ${user?.email ?? ''}`}
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder={user?.email ?? 'tu@email.com'}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setShowDelete(false); setConfirmText(''); }}
                style={{
                  flex: 1, padding: '10px',
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  background: 'transparent', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                Cancelar
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
                Confirmar eliminación
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cuenta');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const content = {
    cuenta:         <TabCuenta user={user} />,
    seguridad:      <TabSeguridad />,
    notificaciones: <TabNotificaciones />,
    peligro:        <TabPeligro onSignOut={handleSignOut} />,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '210px 1fr', gap: 24, alignItems: 'start', maxWidth: 880 }}>

      {/* ── Left tab nav ── */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        position: 'sticky',
        top: 96,
      }}>
        {/* Nav header */}
        <div style={{
          padding: '13px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(26,32,53,0.35)',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--text-muted)', letterSpacing: '0.2em',
          }}>
            // CONFIG_MÓDULOS
          </span>
        </div>

        {TABS.map(({ id, label, icon: Icon, moduleId }) => {
          const isActive = activeTab === id;
          const isDanger = id === 'peligro';
          const accentColor = isDanger ? 'var(--red)' : 'var(--violet)';
          const accentDim = isDanger ? 'rgba(255,77,106,0.08)' : 'var(--violet-dim)';

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
              <Icon
                size={14}
                color={isActive ? accentColor : 'var(--text-muted)'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <div>
                <div style={{
                  fontFamily: 'var(--font-ui)', fontWeight: isActive ? 700 : 600, fontSize: 13,
                  color: isActive ? (isDanger ? 'var(--red)' : 'var(--text)') : 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 8,
                  color: isActive ? (isDanger ? 'rgba(255,77,106,0.55)' : 'rgba(124,92,255,0.6)') : 'var(--text-muted)',
                  letterSpacing: '0.12em', marginTop: 1,
                }}>
                  {moduleId}
                </div>
              </div>
            </button>
          );
        })}

        {/* System info footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(10,11,16,0.3)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 8,
            color: 'var(--text-muted)', letterSpacing: '0.1em',
            lineHeight: 1.7,
          }}>
            <div>ASCEND SISTEMA v1.0</div>
            <div style={{ color: 'rgba(74,90,122,0.6)', marginTop: 2 }}>
              {user?.email?.slice(0, 22)}{user?.email?.length > 22 ? '…' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div>
        {content[activeTab]}
      </div>
    </div>
  );
}
