import { useState, useEffect, useRef } from 'react';
import { getMyProfile, getRewardsCatalog, uploadAvatar } from '../../lib/api/profile';
import { RARITY_CONFIG } from '../../config/rarities';
import { Shield, DollarSign, Zap, Edit3, Lock, Loader2 } from 'lucide-react';

function ProfileStat({ label, value, max = 100, color, icon: Icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: `${color}1A`, border: `1px solid ${color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={14} color={color} />
          </div>
          <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.15em', color: 'var(--text-secondary)' }}>
            {label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color, lineHeight: 1 }}>{value}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>/{max}</span>
        </div>
      </div>
      <div style={{ height: 8, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          width: `${(value / max) * 100}%`, height: '100%',
          background: color, borderRadius: 4, position: 'relative',
          transition: 'width 1s ease',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            backgroundSize: '200% 100%',
            animation: 'xp-shimmer 3s linear infinite',
          }} />
        </div>
      </div>
    </div>
  );
}

function BadgeCard({ badge }) {
  const rarity = RARITY_CONFIG[badge.rarity];
  return (
    <div
      style={{
        position: 'relative',
        background: badge.unlocked ? 'var(--panel)' : 'var(--surface)',
        border: `1px solid ${badge.unlocked ? rarity.color + '55' : 'var(--border)'}`,
        borderRadius: 12, padding: '16px 12px', textAlign: 'center',
        transition: 'var(--transition)',
        filter: badge.unlocked ? 'none' : 'grayscale(0.8)',
        opacity: badge.unlocked ? 1 : 0.5,
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        if (badge.unlocked) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.3), 0 0 20px ${rarity.glow}`;
          e.currentTarget.style.borderColor = rarity.color;
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = badge.unlocked ? rarity.color + '55' : 'var(--border)';
      }}
    >
      {!badge.unlocked && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,11,16,0.5)', zIndex: 2,
        }}>
          <Lock size={18} color="var(--text-muted)" />
        </div>
      )}

      <div style={{ fontSize: 28, marginBottom: 6, filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>
        {badge.icon}
      </div>
      <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', color: badge.unlocked ? 'var(--text)' : 'var(--text-muted)', marginBottom: 5 }}>
        {badge.name}
      </div>
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
        color: badge.unlocked ? rarity.color : 'var(--text-muted)',
        background: badge.unlocked ? `${rarity.color}15` : 'transparent',
        border: badge.unlocked ? `1px solid ${rarity.color}33` : 'none',
        borderRadius: 3, padding: badge.unlocked ? '2px 6px' : '0',
        display: 'inline-block',
      }}>
        {rarity.label}
      </div>
    </div>
  );
}

export default function Profile() {
  const [activeTab,  setActiveTab]  = useState('badges');
  const [profile,    setProfile]    = useState(null);
  const [badges,     setBadges]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [avatarUrl,  setAvatarUrl]  = useState(null);
  const [uploading,  setUploading]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    Promise.all([getMyProfile(), getRewardsCatalog()]).then(([{ data: p }, { data: r }]) => {
      if (p) {
        setProfile(p);
        setAvatarUrl(p.avatar_url ?? null);
      }
      if (r) setBadges(r.badges ?? []);
      setLoading(false);
    });
  }, []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: url, error } = await uploadAvatar(file);
    if (!error && url) setAvatarUrl(url);
    setUploading(false);
    e.target.value = '';
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>CARGANDO...</div>
    </div>
  );

  const xpPercent = (profile.xp / profile.xp_next) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* ─── PROFILE HERO ─── */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #0F1525, #1A1030, #0A1520)',
        border: '1px solid var(--border)', borderRadius: 20,
        overflow: 'hidden', padding: '40px',
      }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,92,255,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(51,209,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(42,51,82,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(42,51,82,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ position: 'absolute', inset: -6, borderRadius: '50%', border: '2px solid var(--violet)', boxShadow: '0 0 20px var(--violet-glow), inset 0 0 20px rgba(124,92,255,0.1)', animation: 'breathe 3s ease-in-out infinite' }} />
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--violet), var(--cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-display)', fontSize: 40, color: 'white', position: 'relative',
              overflow: 'hidden',
            }}>
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : profile.username.slice(0, 2)
              }
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--void)', border: '2px solid var(--border-bright)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: uploading ? 'default' : 'pointer', transition: 'var(--transition)',
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = 'var(--violet)'; }}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-bright)'}
            >
              {uploading
                ? <Loader2 size={12} color="var(--violet)" style={{ animation: 'spin-slow 1s linear infinite' }} />
                : <Edit3 size={12} color="var(--text-muted)" />
              }
            </button>
          </div>

          {/* Profile info */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <h1 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 28, letterSpacing: '0.08em', color: 'var(--text)' }}>
                {profile.username}
              </h1>
              {profile.active_title && (
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--gold)',
                  background: 'var(--gold-dim)', border: '1px solid rgba(245,196,81,0.4)',
                  borderRadius: 6, padding: '4px 12px', letterSpacing: '0.1em',
                  boxShadow: '0 4px 12px var(--gold-glow)',
                }}>
                  {profile.active_title.name.toUpperCase()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 56, color: 'var(--text)', lineHeight: 1, textShadow: '0 0 30px rgba(124,92,255,0.4)' }}>{profile.level}</span>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.15em', color: 'var(--text-muted)' }}>NIVEL</span>
              </div>
              <div style={{ width: 1, height: 48, background: 'var(--border)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>XP TOTAL</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--violet)' }}>{profile.total_xp.toLocaleString()}</div>
              </div>
              <div style={{ width: 1, height: 48, background: 'var(--border)' }} />
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>RACHA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--gold)' }}>🔥 {profile.streak} días</div>
              </div>
            </div>

            <div style={{ maxWidth: 480 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--violet)' }}>Nivel {profile.level} → {profile.level + 1}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{profile.xp.toLocaleString()} / {profile.xp_next.toLocaleString()} XP</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ width: `${xpPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--violet), var(--cyan))', borderRadius: 5, position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', backgroundSize: '200% 100%', animation: 'xp-shimmer 2s linear infinite' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
            JUGADOR DESDE<br />
            <span style={{ color: 'var(--text-secondary)' }}>
              {new Date(profile.created_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* ─── STATS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>

        <div className="card">
          <div className="section-label">ATRIBUTOS</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <ProfileStat label="SALUD"      value={profile.stat_health}     color="var(--green)"  icon={Shield} />
            <ProfileStat label="DINERO"     value={profile.stat_money}      color="var(--gold)"   icon={DollarSign} />
            <ProfileStat label="DISCIPLINA" value={profile.stat_discipline} color="var(--violet)" icon={Zap} />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>INSIGNIAS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)' }}>
              {badges.filter(b => b.unlocked).length}/{badges.length}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
            {['badges', 'stats'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
                  color: activeTab === tab ? 'white' : 'var(--text-muted)',
                  background: activeTab === tab ? 'var(--violet)' : 'transparent',
                  border: `1px solid ${activeTab === tab ? 'var(--violet)' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'var(--transition)', textTransform: 'uppercase',
                }}
              >
                {tab === 'badges' ? 'Insignias' : 'Estadísticas'}
              </button>
            ))}
          </div>

          {activeTab === 'badges' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 10 }}>
              {badges.map(badge => (
                <BadgeCard key={badge.id} badge={badge} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Misiones Completadas',   value: 47,   suffix: '' },
                { label: 'Días de Racha Máxima',   value: 21,   suffix: ' días' },
                { label: 'XP Ganado Esta Semana',  value: 3000, suffix: ' XP' },
                { label: 'Posición en Ranking',    value: 5,    suffix: '°' },
              ].map(stat => (
                <div
                  key={stat.label}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>{stat.label}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)' }}>{stat.value}{stat.suffix}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
