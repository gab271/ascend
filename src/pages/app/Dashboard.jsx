import { useState, useEffect } from 'react';
import { Shield, DollarSign, Zap, ChevronRight, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { getMyProfile, getWeeklyXP } from '../../lib/api/profile';
import { getDailyMissions, completeMission as completeMissionAPI } from '../../lib/api/missions';
import { getRanking } from '../../lib/api/ranking';
import { useCountUp } from '../../hooks/useCountUp';
import HexLevel from '../../components/game/HexLevel';
import XPBar from '../../components/game/XPBar';
import WeeklyChart from '../../components/game/WeeklyChart';
import MissionRow from '../../components/game/MissionRow';

// ─── Entry animation hook ─────────────────────────────────────
function useEntry(delay = 0) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return entered;
}

function entryStyle(entered) {
  return {
    opacity: entered ? 1 : 0,
    transform: entered ? 'translateY(0)' : 'translateY(28px)',
    filter: entered ? 'blur(0px)' : 'blur(8px)',
    transition: 'opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.7s ease',
  };
}

// ─── Eyebrow label ────────────────────────────────────────────
function Eyebrow({ children, color = 'var(--text-muted)' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 10,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.22em', textTransform: 'uppercase',
      color, marginBottom: 14,
    }}>
      <span style={{ display: 'block', width: 18, height: 1, background: color, opacity: 0.45 }} />
      {children}
      <span style={{ display: 'block', width: 18, height: 1, background: color, opacity: 0.45 }} />
    </div>
  );
}

// ─── Angular Stat Card ────────────────────────────────────────
function StatCard({ label, value, max, color, icon: Icon, change }) {
  const animated = useCountUp(value, 1200, 400);
  const [barWidth, setBarWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBarWidth((value / max) * 100), 600);
    return () => clearTimeout(t);
  }, [value, max]);

  return (
    <div
      className="clip-angular-tr"
      style={{
        flex: 1,
        background: 'var(--panel)',
        border: `1px solid ${color}22`,
        padding: '22px 22px 18px',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}66`;
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.35), 0 0 28px ${color}28`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = `${color}22`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Ambient glow orb */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 110, height: 110, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}55, transparent)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 9,
          background: `${color}18`, border: `1px solid ${color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={color} />
        </div>
        {change !== undefined && (
          <div style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
            color: change >= 0 ? 'var(--green)' : 'var(--red)',
            background: change >= 0 ? 'var(--green-dim)' : 'var(--red-dim)',
            border: `1px solid ${change >= 0 ? 'rgba(51,230,161,0.3)' : 'rgba(255,77,106,0.3)'}`,
            borderRadius: 3, padding: '2px 7px',
          }}>
            {change >= 0 ? '+' : ''}{change}
          </div>
        )}
      </div>

      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 56, color,
        lineHeight: 1, marginBottom: 2, textShadow: `0 0 30px ${color}55`,
      }}>
        {animated}
      </div>

      <div style={{
        fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10,
        letterSpacing: '0.22em', color: 'var(--text-muted)', marginBottom: 10,
      }}>
        {label}
      </div>

      <div style={{ height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${barWidth}%`, height: '100%', background: `linear-gradient(90deg, ${color}99, ${color})`,
          borderRadius: 3,
          transition: 'width 1.1s cubic-bezier(0.4, 0, 0.2, 1)', transitionDelay: '0.6s',
          boxShadow: `0 0 8px ${color}40`,
        }} />
      </div>
    </div>
  );
}

// ─── Normalize helpers ────────────────────────────────────────
function normalizeProfile(raw) {
  if (!raw) return null;
  return {
    username:    raw.username ?? '—',
    level:       raw.level ?? 1,
    xp:          raw.xp ?? 0,
    xpNext:      raw.xp_next ?? 700,
    totalXP:     raw.total_xp ?? 0,
    streak:      raw.streak ?? 0,
    title:       raw.active_title?.name ?? '',
    stats: {
      health:     { value: raw.stat_health    ?? 0 },
      money:      { value: raw.stat_money     ?? 0 },
      discipline: { value: raw.stat_discipline ?? 0 },
    },
  };
}

function normalizeMissions(rows) {
  return (rows ?? []).map(row => ({
    ...row.mission,
    completed: row.completed,
    rowId:     row.id,
  }));
}

function normalizeRanking(rows) {
  return (rows ?? []).map(r => ({
    id:       r.user_id,
    username: r.username,
    level:    r.level,
    xp:       r.total_xp,
    title:    r.title_name ?? '',
    isMe:     r.is_me,
  }));
}

// Resolves with fallback after ms milliseconds if promise hangs
function withTimeout(promise, fallback, ms = 8000) {
  return Promise.race([
    promise,
    new Promise(resolve => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// ─── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const { t } = useLanguage();
  const [profile,  setProfile]  = useState(null);
  const [weeklyXP, setWeeklyXP] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [missions, setMissions] = useState([]);
  const [rankData, setRankData] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [loadError, setLoadError] = useState(null);

  const heroEntered  = useEntry(60);
  const attrsEntered = useEntry(220);
  const botEntered   = useEntry(380);

  useEffect(() => {
    async function load() {
      try {
        // Profile is critical — load first, fail fast if broken
        const { data: profileRaw, error: profileErr } = await getMyProfile();
        if (profileErr) {
          setLoadError(profileErr.message ?? JSON.stringify(profileErr));
          return;
        }
        setProfile(normalizeProfile(profileRaw));

        // Secondary calls — each has an 8s timeout so one hanging DB
        // function (e.g. ensure_daily_missions) can't freeze the whole page
        const [
          { data: weekRaw },
          { data: missionsRaw },
          { data: rankRaw },
        ] = await Promise.all([
          withTimeout(getWeeklyXP(),       { data: null }),
          withTimeout(getDailyMissions(),  { data: null }),
          withTimeout(getRanking({ limit: 4 }), { data: null }),
        ]);

        setWeeklyXP(weekRaw ?? [0, 0, 0, 0, 0, 0, 0]);
        setMissions(normalizeMissions(missionsRaw));
        setRankData(normalizeRanking(rankRaw));
      } catch (err) {
        setLoadError(err?.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleComplete = async (missionId) => {
    setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: true } : m));
    const { error } = await completeMissionAPI(missionId);
    if (error) {
      setMissions(prev => prev.map(m => m.id === missionId ? { ...m, completed: false } : m));
      return;
    }
    const { data: profileRaw } = await getMyProfile();
    setProfile(normalizeProfile(profileRaw));
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{
          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 40, height: 40,
            border: '2px solid var(--border)',
            borderTop: '2px solid var(--violet)',
            borderRadius: '50%',
            animation: 'spin-slow 0.8s linear infinite',
          }} />
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--text-muted)', letterSpacing: '0.28em',
          }}>
            {t('dashboard.loadingSystem')}
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.18em' }}>
            ERROR — PROFILE NOT FOUND
          </div>
          {loadError && (
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '8px 14px', maxWidth: 500, wordBreak: 'break-all',
            }}>
              {loadError}
            </div>
          )}
        </div>
      </div>
    );
  }

  const completedCount = missions.filter(m => m.completed).length;
  const topRankUsers   = rankData.slice(0, 4);
  const hour           = new Date().getHours();
  const greeting       = hour < 12 ? t('dashboard.greetingMorning') : hour < 18 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening');

  return (
    <div style={{ position: 'relative' }}>

      {/* ── Ambient background orbs ─────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,92,255,0.07) 0%, transparent 65%)',
          animation: 'orb-breathe 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: 40, left: -100,
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(51,209,255,0.05) 0%, transparent 60%)',
          animation: 'orb-breathe 11s ease-in-out infinite',
          animationDelay: '4s',
        }} />
      </div>

      {/* ── Film grain overlay ───────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: -150, pointerEvents: 'none', zIndex: 2,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        opacity: 0.028,
        animation: 'grain-shift 0.9s steps(1) infinite',
      }} />

      {/* ── Page content ─────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ═══ ROW 1: Hero card ═══════════════════════════════ */}
        <div
          className="hud-frame"
          style={{
            background: 'linear-gradient(135deg, var(--panel) 0%, #100D1C 50%, #0D1425 100%)',
            border: '1px solid rgba(124,92,255,0.2)',
            borderRadius: 16,
            padding: '28px 36px',
            overflow: 'hidden',
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: 40,
            alignItems: 'center',
            ...entryStyle(heroEntered),
          }}
        >
          {/* Animated background grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage:
              'linear-gradient(rgba(42,51,82,0.12) 1px, transparent 1px),' +
              'linear-gradient(90deg, rgba(42,51,82,0.12) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'grid-flow 8s linear infinite',
            pointerEvents: 'none',
          }} />

          {/* Ambient left glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 20% 50%, rgba(124,92,255,0.12) 0%, transparent 55%)',
            pointerEvents: 'none',
          }} />

          {/* Scan sweep line */}
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.55), transparent)',
            animation: 'scan-sweep 4s ease-in-out infinite',
            pointerEvents: 'none', zIndex: 5,
          }} />

          {/* Top edge accent */}
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(124,92,255,0.4), rgba(51,209,255,0.3), transparent)',
            pointerEvents: 'none',
          }} />

          {/* LEFT — HexLevel */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <HexLevel level={profile.level} title={profile.title} />
          </div>

          {/* CENTER — Player identity + XP */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column' }}>
            <Eyebrow color="var(--violet)">{greeting}</Eyebrow>

            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 72, lineHeight: 0.88,
              color: 'var(--text)',
              letterSpacing: '0.04em',
              textShadow: '0 2px 48px rgba(124,92,255,0.22)',
              marginBottom: 10,
            }}>
              {profile.username}
            </div>

            {profile.title && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--gold-dim)',
                border: '1px solid rgba(245,196,81,0.28)',
                borderRadius: 3, padding: '4px 12px',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
                letterSpacing: '0.12em', color: 'var(--gold)',
                alignSelf: 'flex-start', marginBottom: 20,
              }}>
                <Crown size={10} color="var(--gold)" />
                {profile.title.toUpperCase()}
              </div>
            )}

            <div style={{ marginTop: profile.title ? 0 : 16 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10,
                  letterSpacing: '0.18em', color: 'var(--text-muted)',
                }}>
                  {t('common.totalXP')}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 44, color: 'var(--violet)',
                  lineHeight: 1, textShadow: '0 0 32px var(--violet-glow)',
                }}>
                  {profile.totalXP.toLocaleString()}
                </span>
              </div>
              <XPBar current={profile.xp} max={profile.xpNext} nextLevel={profile.level + 1} />
            </div>
          </div>

          {/* RIGHT — Streak */}
          <div
            style={{
              position: 'relative', zIndex: 2,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center',
              background: 'linear-gradient(160deg, rgba(245,196,81,0.07) 0%, rgba(245,196,81,0.02) 100%)',
              border: '1px solid rgba(245,196,81,0.18)',
              borderRadius: 12, padding: '28px 32px', gap: 6,
              flexShrink: 0,
            }}
          >
            {/* Gold corner accent */}
            <div style={{
              position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.5), transparent)',
            }} />
            <div style={{
              fontSize: 38,
              animation: 'streak-pulse 2.2s ease-in-out infinite',
              filter: 'drop-shadow(0 0 14px rgba(245,196,81,0.65))',
            }}>
              🔥
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 80, color: 'var(--gold)',
              lineHeight: 0.85, textShadow: '0 0 48px var(--gold-glow)',
            }}>
              {profile.streak}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 9,
              letterSpacing: '0.26em', color: 'rgba(245,196,81,0.55)', marginTop: 6,
              textTransform: 'uppercase',
            }}>
              {t('dashboard.streakDays')}
            </div>
          </div>
        </div>

        {/* ═══ ROW 2: Attributes ══════════════════════════════ */}
        <div style={{ ...entryStyle(attrsEntered) }}>
          <Eyebrow>{t('dashboard.attributes')}</Eyebrow>
          <div style={{ display: 'flex', gap: 16 }}>
            <StatCard label={t('common.health')}     value={profile.stats.health.value}     max={100} color="var(--green)"  icon={Shield}     />
            <StatCard label={t('common.money')}      value={profile.stats.money.value}      max={100} color="var(--gold)"   icon={DollarSign} />
            <StatCard label={t('common.discipline')} value={profile.stats.discipline.value} max={100} color="var(--violet)" icon={Zap}        />
          </div>
        </div>

        {/* ═══ ROW 3: Missions + Sidebar ══════════════════════ */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20,
          ...entryStyle(botEntered),
        }}>

          {/* ─ Daily missions ─ */}
          <div
            className="card"
            style={{
              position: 'relative', overflow: 'hidden',
              background: 'var(--panel)',
            }}
          >
            {/* Subtle grid texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage:
                'linear-gradient(rgba(42,51,82,0.1) 1px, transparent 1px),' +
                'linear-gradient(90deg, rgba(42,51,82,0.1) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }} />
            {/* Cyan top edge */}
            <div style={{
              position: 'absolute', top: 0, left: '10%', right: '10%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(51,209,255,0.3), transparent)',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <Eyebrow color="var(--cyan)">{t('dashboard.dailyMissions')}</Eyebrow>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11,
                    color: 'var(--text-muted)', marginTop: -8, marginBottom: 16,
                  }}>
                    <span style={{ color: completedCount === missions.length && missions.length > 0 ? 'var(--green)' : 'var(--cyan)' }}>
                      {completedCount}
                    </span>
                    <span style={{ color: 'var(--border-bright)' }}>/</span>
                    {missions.length} {t('dashboard.completed')}
                  </div>
                </div>
                <Link
                  to="/missions"
                  style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10,
                    letterSpacing: '0.12em', color: 'var(--cyan)',
                    display: 'flex', alignItems: 'center', gap: 3,
                    opacity: 0.75, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.75'}
                >
                  {t('dashboard.seeAll')} <ChevronRight size={12} />
                </Link>
              </div>

              {/* Segmented progress track */}
              <div style={{ display: 'flex', gap: 3, marginBottom: 20 }}>
                {missions.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: 7,
                      background: m.completed
                        ? 'linear-gradient(90deg, var(--green), rgba(51,230,161,0.7))'
                        : 'var(--surface)',
                      border: m.completed ? 'none' : '1px solid var(--border)',
                      borderRadius: 3,
                      transition: 'background 0.5s ease',
                      boxShadow: m.completed ? '0 0 6px rgba(51,230,161,0.4)' : 'none',
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {missions.map(mission => (
                  <MissionRow key={mission.id} mission={mission} onComplete={handleComplete} />
                ))}
              </div>
            </div>
          </div>

          {/* ─ Right sidebar ─ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Ranking mini-panel */}
            <div
              className="card"
              style={{
                flex: 1, position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(160deg, var(--panel) 0%, #13110A 100%)',
                borderColor: 'rgba(245,196,81,0.14)',
              }}
            >
              {/* Gold top accent */}
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(245,196,81,0.4), transparent)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Eyebrow color="var(--gold)">{t('dashboard.ranking')}</Eyebrow>
                  <Link
                    to="/ranking"
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10,
                      letterSpacing: '0.1em', color: 'var(--gold)',
                      display: 'flex', alignItems: 'center', gap: 3,
                      opacity: 0.65, transition: 'opacity 0.2s',
                      marginTop: -14,
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.65'}
                  >
                    {t('dashboard.see')} <ChevronRight size={11} />
                  </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {topRankUsers.map((user, idx) => {
                    const rankColors = ['var(--gold)', '#C0C0C0', '#CD7F32', 'var(--text-muted)'];
                    const rankBgs   = [
                      'linear-gradient(90deg, rgba(245,196,81,0.1), rgba(245,196,81,0.03))',
                      'linear-gradient(90deg, rgba(192,192,192,0.07), rgba(192,192,192,0.02))',
                      'linear-gradient(90deg, rgba(205,127,50,0.07), rgba(205,127,50,0.02))',
                      'transparent',
                    ];
                    const rankBorders = [
                      'rgba(245,196,81,0.22)',
                      'rgba(192,192,192,0.12)',
                      'rgba(205,127,50,0.12)',
                      'transparent',
                    ];

                    return (
                      <div
                        key={user.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 9,
                          padding: idx === 0 ? '9px 10px' : '7px 10px',
                          borderRadius: 7,
                          background: user.isMe
                            ? 'var(--violet-dim)'
                            : rankBgs[idx] ?? 'transparent',
                          border: `1px solid ${user.isMe ? 'rgba(124,92,255,0.28)' : rankBorders[idx] ?? 'transparent'}`,
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => {
                          if (!user.isMe && idx > 0)
                            e.currentTarget.style.background = 'var(--surface)';
                        }}
                        onMouseLeave={e => {
                          if (!user.isMe)
                            e.currentTarget.style.background = rankBgs[idx] ?? 'transparent';
                        }}
                      >
                        {/* Rank number */}
                        <div style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: idx === 0 ? 22 : 15,
                          width: 26, textAlign: 'center',
                          color: rankColors[idx] ?? 'var(--text-muted)',
                          textShadow: idx === 0 ? '0 0 12px rgba(245,196,81,0.5)' : 'none',
                          lineHeight: 1, flexShrink: 0,
                        }}>
                          {idx === 0 ? '①' : idx === 1 ? '②' : idx === 2 ? '③' : `${idx + 1}`}
                        </div>

                        {/* Avatar */}
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: user.isMe
                            ? 'linear-gradient(135deg, var(--violet), var(--cyan))'
                            : `linear-gradient(135deg, ${rankColors[idx] ?? 'var(--surface)'}44, ${rankColors[idx] ?? 'var(--surface)'}22)`,
                          border: `1px solid ${user.isMe ? 'var(--violet)' : rankColors[idx] ?? 'var(--border)'}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 9,
                          color: 'white',
                        }}>
                          {user.username.slice(0, 2).toUpperCase()}
                        </div>

                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{
                            fontFamily: 'var(--font-ui)', fontWeight: 700,
                            fontSize: idx === 0 ? 13 : 12,
                            color: user.isMe ? 'var(--violet)' : idx === 0 ? 'var(--gold)' : 'var(--text)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            letterSpacing: '0.04em',
                          }}>
                            {user.username}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-mono)', fontSize: 9,
                            color: 'var(--text-muted)', letterSpacing: '0.06em',
                          }}>
                            LVL {user.level}
                          </div>
                        </div>

                        <div style={{
                          fontFamily: 'var(--font-mono)', fontSize: 10, flexShrink: 0,
                          color: user.isMe ? 'var(--violet)' : idx === 0 ? 'var(--gold)' : 'var(--text-muted)',
                        }}>
                          {(user.xp / 1000).toFixed(1)}K
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly XP chart */}
            <div
              className="card"
              style={{
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(160deg, var(--panel) 0%, #0A1018 100%)',
                borderColor: 'rgba(51,209,255,0.14)',
              }}
            >
              {/* Cyan top accent */}
              <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                background: 'linear-gradient(90deg, transparent, rgba(51,209,255,0.35), transparent)',
                pointerEvents: 'none',
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Eyebrow color="var(--cyan)">{t('dashboard.weeklyXP')}</Eyebrow>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan)',
                    marginTop: -14,
                    textShadow: '0 0 14px var(--cyan-glow)',
                  }}>
                    {weeklyXP.reduce((a, b) => a + b, 0).toLocaleString()} XP
                  </div>
                </div>
                <WeeklyChart data={weeklyXP} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
