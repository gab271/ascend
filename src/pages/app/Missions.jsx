import { useState, useEffect, useCallback } from 'react';
import { Settings } from 'lucide-react';
import {
  getDailyMissions,
  getWeeklyMissions,
  completeMission as completeMissionAPI,
  completeWeeklyMission as completeWeeklyMissionAPI,
  getMissionPreferences,
  updateMissionPreferences,
} from '../../lib/api/missions';
import MissionCard from '../../components/game/MissionCard';
import { useLanguage } from '../../hooks/useLanguage';

// ─── Attribute filter config ──────────────────────────────────
const FILTERS = ['all', 'health', 'money', 'discipline', 'social', 'mind', 'creativity'];

const FILTER_COLORS = {
  all:        'var(--text-secondary)',
  health:     'var(--green)',
  money:      'var(--gold)',
  discipline: 'var(--violet)',
  social:     'var(--cyan)',
  mind:       '#A78BFA',
  creativity: '#FF8C42',
};

// ─── Countdown helpers ────────────────────────────────────────

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight - now;
}

function getMsUntilNextMonday() {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7; // days until next Mon
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday - now;
}

function formatCountdown(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const pad = n => String(n).padStart(2, '0');
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// ─── Countdown display ────────────────────────────────────────

function CountdownTimer({ isWeekly, t }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const tick = () => {
      const ms = isWeekly ? getMsUntilNextMonday() : getMsUntilMidnight();
      setDisplay(formatCountdown(ms));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isWeekly]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '10px 18px',
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        background: isWeekly ? 'var(--gold)' : 'var(--cyan)',
        boxShadow: `0 0 8px ${isWeekly ? 'var(--gold)' : 'var(--cyan)'}`,
        animation: 'pulse-dot 1.5s ease-in-out infinite',
      }} />
      <div>
        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 2 }}>
          {isWeekly ? t('missions.resetsMonday') : t('missions.resetsIn')}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: isWeekly ? 'var(--gold)' : 'var(--cyan)', letterSpacing: '0.1em' }}>
          {display}
        </div>
      </div>
    </div>
  );
}

// ─── Weekly progress bar ──────────────────────────────────────

function WeekProgress({ t }) {
  const day = new Date().getDay(); // 0=Sun…6=Sat
  // ISO week: Mon=1…Sun=7 → convert
  const isoDay = day === 0 ? 7 : day; // 1=Mon … 7=Sun
  const pct = Math.round((isoDay / 7) * 100);

  const dayLabels = t('missions.dayLabels');

  return (
    <div style={{
      background: 'var(--panel)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '12px 18px', minWidth: 220,
    }}>
      <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', color: 'var(--text-muted)', marginBottom: 8 }}>
        {t('missions.weeklyProgress')}
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {dayLabels.map((label, i) => {
          const active = i < isoDay;
          const current = i === isoDay - 1;
          return (
            <div
              key={label}
              style={{
                flex: 1, height: 6, borderRadius: 3,
                background: current
                  ? 'var(--gold)'
                  : active
                    ? 'rgba(245,196,81,0.35)'
                    : 'var(--border)',
                boxShadow: current ? '0 0 6px var(--gold)' : 'none',
                transition: 'all 0.3s',
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {dayLabels.map((label, i) => (
          <div key={label} style={{
            flex: 1, textAlign: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.05em',
            color: i < isoDay ? 'var(--gold)' : 'var(--text-muted)',
          }}>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Mission preferences modal ────────────────────────────────

const CATEGORY_CONFIG = [
  { id: 'health',     icon: '⚡', color: '#33E6A1', labelKey: 'missions.prefHealth',     descKey: 'missions.prefHealthDesc'     },
  { id: 'money',      icon: '💰', color: '#F5C451', labelKey: 'missions.prefMoney',      descKey: 'missions.prefMoneyDesc'      },
  { id: 'discipline', icon: '🎯', color: '#7C5CFF', labelKey: 'missions.prefDiscipline', descKey: 'missions.prefDisciplineDesc' },
  { id: 'social',     icon: '🤝', color: '#33D1FF', labelKey: 'missions.prefSocial',     descKey: 'missions.prefSocialDesc'     },
  { id: 'mind',       icon: '🧠', color: '#A78BFA', labelKey: 'missions.prefMind',       descKey: 'missions.prefMindDesc'       },
  { id: 'creativity', icon: '🎨', color: '#FF8C42', labelKey: 'missions.prefCreativity', descKey: 'missions.prefCreativityDesc' },
];

function MissionPreferencesModal({ initial, onSave, onClose, t }) {
  const [selected, setSelected] = useState([...initial]);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [error,    setError]    = useState('');

  function toggle(id) {
    setSelected(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          setError(t('missions.prefAtLeastOne'));
          return prev;
        }
        return prev.filter(c => c !== id);
      }
      setError('');
      return [...prev, id];
    });
    setSaved(false);
  }

  async function handleSave() {
    if (selected.length === 0) { setError(t('missions.prefAtLeastOne')); return; }
    setSaving(true);
    const err = await onSave(selected);
    setSaving(false);
    if (err) {
      setError(err.message || 'Error saving preferences.');
    } else {
      setSaved(true);
      setTimeout(onClose, 900);
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,11,16,0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: '28px 28px 24px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 24px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(124,92,255,0.1)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', letterSpacing: '0.05em', marginBottom: 6 }}>
              {t('missions.prefTitle')}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, maxWidth: 360 }}>
              {t('missions.prefSubtitle')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 8px', fontSize: 20, lineHeight: 1 }}
          >×</button>
        </div>

        {/* Category cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {CATEGORY_CONFIG.map(cat => {
            const active = selected.includes(cat.id);
            const isLast = selected.length === 1 && active;
            return (
              <div
                key={cat.id}
                onClick={() => toggle(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 18px',
                  background: active
                    ? `linear-gradient(135deg, ${cat.color}18, ${cat.color}08)`
                    : 'rgba(19,23,34,0.6)',
                  border: `1px solid ${active ? cat.color + '55' : 'var(--border)'}`,
                  borderRadius: 12,
                  cursor: isLast ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isLast ? 0.6 : 1,
                }}
              >
                <div style={{ fontSize: 22, width: 32, textAlign: 'center', flexShrink: 0 }}>{cat.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
                    letterSpacing: '0.1em', color: active ? cat.color : 'var(--text)',
                    transition: 'color 0.2s', marginBottom: 2,
                  }}>
                    {t(cat.labelKey)}
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                    {t(cat.descKey)}
                  </div>
                </div>
                {/* Colour-matched toggle */}
                <div style={{
                  width: 44, height: 24, borderRadius: 12, flexShrink: 0,
                  background: active ? cat.color : 'rgba(26,32,53,0.8)',
                  border: `1px solid ${active ? cat.color : 'var(--border)'}`,
                  position: 'relative', transition: 'all 0.2s',
                  boxShadow: active ? `0 0 12px ${cat.color}55` : 'none',
                }}>
                  <div style={{
                    position: 'absolute', top: 3,
                    left: active ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%',
                    background: active ? '#fff' : '#3D4559',
                    transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: active ? `0 0 6px ${cat.color}88` : 'none',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* "Takes effect tomorrow" notice */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'rgba(124,92,255,0.07)',
          border: '1px solid rgba(124,92,255,0.15)',
        }}>
          <div style={{ fontSize: 14 }}>📅</div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {t('missions.prefTomorrow')}
          </div>
        </div>

        {error && (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#FF4D6A', marginBottom: 12, letterSpacing: '0.05em' }}>
            ⚠ {error}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || saved}
          style={{
            width: '100%', padding: '14px',
            background: saved
              ? 'rgba(51,230,161,0.15)'
              : 'linear-gradient(135deg, var(--violet), #5a3fd4)',
            border: `1px solid ${saved ? 'var(--green)' : 'var(--violet)'}`,
            borderRadius: 10,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.12em', color: saved ? 'var(--green)' : 'white',
            cursor: saving || saved ? 'default' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: saved ? '0 0 16px rgba(51,230,161,0.2)' : '0 4px 20px rgba(124,92,255,0.3)',
          }}
        >
          {saved ? t('missions.prefSaved') : saving ? t('missions.prefSaving') : t('missions.prefSave')}
        </button>
      </div>
    </div>
  );
}


// ─── Main component ───────────────────────────────────────────

export default function Missions() {
  const { t } = useLanguage();
  const [tab,          setTab]          = useState('daily');   // 'daily' | 'weekly'
  const [daily,        setDaily]        = useState([]);
  const [weekly,       setWeekly]       = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading,      setLoading]      = useState(true);
  const [showPrefs,    setShowPrefs]    = useState(false);
  const [preferences,  setPreferences]  = useState(['health', 'money', 'discipline']);

  // Normalise API rows → flat mission objects with completed flag
  const normalise = rows =>
    (rows ?? []).map(row => ({ ...row.mission, completed: row.completed }));

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getDailyMissions(),
      getWeeklyMissions(),
      getMissionPreferences(),
    ]).then(([{ data: d }, { data: w }, { data: prefs }]) => {
      setDaily(normalise(d));
      setWeekly(normalise(w));
      if (prefs) setPreferences(prefs);
      setLoading(false);
    });
  }, []);

  const handleComplete = useCallback(async (id) => {
    const isWeekly = tab === 'weekly';
    const setter = isWeekly ? setWeekly : setDaily;

    // Optimistic update
    setter(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));

    const fn = isWeekly ? completeWeeklyMissionAPI : completeMissionAPI;
    const { error } = await fn(id);

    if (error) {
      // Rollback on failure
      setter(prev => prev.map(m => m.id === id ? { ...m, completed: false } : m));
    }
  }, [tab]);

  const handleSavePreferences = useCallback(async (cats) => {
    const { error } = await updateMissionPreferences(cats);
    if (!error) setPreferences(cats);
    return error;
  }, []);

  const missions = tab === 'daily' ? daily : weekly;

  const filtered = missions.filter(m => {
    if (activeFilter === 'all') return true;
    return m.attribute === activeFilter;
  });

  const completedCount = missions.filter(m => m.completed).length;
  const pendingXP      = missions.filter(m => !m.completed).reduce((s, m) => s + m.xp, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>{t('common.loading')}</div>
    </div>
  );

  return (
    <div>

      {/* ── Type tab selector ── */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { id: 'daily',  label: t('missions.daily'),  badge: daily.length,  color: 'var(--cyan)' },
          { id: 'weekly', label: t('missions.weekly'), badge: weekly.length, color: 'var(--gold)' },
        ].map(tabItem => (
          <button
            key={tabItem.id}
            onClick={() => { setTab(tabItem.id); setActiveFilter('all'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 24px', borderRadius: 12,
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, letterSpacing: '0.1em',
              cursor: 'pointer', transition: 'var(--transition)',
              background: tab === tabItem.id
                ? `linear-gradient(135deg, ${tabItem.color}22, ${tabItem.color}10)`
                : 'var(--panel)',
              border: `1px solid ${tab === tabItem.id ? tabItem.color : 'var(--border)'}`,
              color: tab === tabItem.id ? tabItem.color : 'var(--text-muted)',
              boxShadow: tab === tabItem.id ? `0 4px 20px ${tabItem.color}22` : 'none',
            }}
          >
            {tabItem.label}
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              background: tab === tabItem.id ? tabItem.color : 'var(--border)',
              color: tab === tabItem.id ? 'var(--void)' : 'var(--text-muted)',
              borderRadius: 4, padding: '1px 6px',
            }}>
              {tabItem.badge}
            </span>
          </button>
        ))}

        {/* Countdown + week progress on the right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <CountdownTimer isWeekly={tab === 'weekly'} t={t} />
          {tab === 'weekly' && <WeekProgress t={t} />}
        </div>
      </div>

      {/* ── Header stats ── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        {[
          {
            label: tab === 'daily' ? t('missions.active') : t('missions.activeChallenges'),
            value: missions.length - completedCount,
            color: tab === 'daily' ? 'var(--cyan)' : 'var(--gold)',
          },
          {
            label: t('missions.completed'),
            value: `${completedCount} / ${missions.length}`,
            color: 'var(--green)',
          },
          {
            label: t('missions.availableXP'),
            value: `${pendingXP.toLocaleString()} XP`,
            color: 'var(--violet)',
          },
        ].map(stat => (
          <div
            key={stat.label}
            style={{
              flex: 1, background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Weekly context banner ── */}
      {tab === 'weekly' && (
        <div style={{
          marginBottom: 24, padding: '14px 20px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(245,196,81,0.07), transparent)',
          border: '1px solid rgba(245,196,81,0.25)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 22 }}>⚔️</div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--gold)', letterSpacing: '0.08em', marginBottom: 2 }}>
              {t('missions.weeklyChallenges')}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
              {t('missions.weeklyDesc')}
            </div>
          </div>
        </div>
      )}

      {/* ── Attribute filter tabs + configure button ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', gap: 8, padding: '6px',
          background: 'var(--panel)', border: '1px solid var(--border)',
          borderRadius: 12, overflowX: 'auto', flexShrink: 0,
        }}>
          {FILTERS.map(f => {
            const filterLabel = {
              all:        t('missions.filterAll'),
              health:     t('missions.filterHealth'),
              money:      t('missions.filterMoney'),
              discipline: t('missions.filterDiscipline'),
              social:     t('missions.filterSocial'),
              mind:       t('missions.filterMind'),
              creativity: t('missions.filterCreativity'),
            }[f];
            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '8px 18px', borderRadius: 8,
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
                  color: activeFilter === f ? 'white' : 'var(--text-muted)',
                  background: activeFilter === f ? FILTER_COLORS[f] : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'var(--transition)',
                  boxShadow: activeFilter === f ? `0 4px 14px ${FILTER_COLORS[f]}44` : 'none',
                }}
              >
                {filterLabel}
              </button>
            );
          })}
        </div>

        {/* Category preferences button */}
        <button
          onClick={() => setShowPrefs(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 10,
            background: 'var(--panel)', border: '1px solid var(--border)',
            color: 'var(--text-muted)', cursor: 'pointer',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', transition: 'var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--violet)'; e.currentTarget.style.color = 'var(--violet)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <Settings size={13} />
          {t('missions.configureCategories')}
        </button>
      </div>

      {/* ── Mission cards grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
        {filtered.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onComplete={handleComplete}
            isWeekly={tab === 'weekly'}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px 0',
          color: 'var(--text-muted)', fontFamily: 'var(--font-ui)',
          fontSize: 16, letterSpacing: '0.1em',
        }}>
          {t('missions.noMissions')}
        </div>
      )}

      {showPrefs && (
        <MissionPreferencesModal
          initial={preferences}
          onSave={handleSavePreferences}
          onClose={() => setShowPrefs(false)}
          t={t}
        />
      )}

    </div>
  );
}
