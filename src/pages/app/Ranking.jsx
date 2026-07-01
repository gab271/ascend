import { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getRanking } from '../../lib/api/ranking';
import PodiumCard from '../../components/game/PodiumCard';
import ChangeIndicator from '../../components/game/ChangeIndicator';

function normalize(rows) {
  return (rows ?? []).map(r => ({
    id:       r.user_id,
    username: r.username,
    level:    r.level,
    xp:       r.total_xp,
    streak:   r.streak,
    title:    r.title_name ?? '',
    isMe:     r.is_me,
    change:   0,
  }));
}

export default function Ranking() {
  const { t } = useLanguage();
  const [period,   setPeriod]   = useState('week');
  const [ranking,  setRanking]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    getRanking({ limit: 50 }).then(({ data }) => {
      setRanking(normalize(data));
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.2em' }}>{t('common.loading')}</div>
    </div>
  );

  const myPosition = ranking.findIndex(u => u.isMe) + 1;
  const me = ranking.find(u => u.isMe);

  const top3 = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div>
      {/* My rank banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--violet-dim), rgba(51,209,255,0.08))',
        border: '1px solid rgba(124,92,255,0.4)',
        borderRadius: 14, padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, boxShadow: '0 4px 24px var(--violet-glow)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, color: 'var(--violet)', lineHeight: 1 }}>
            #{myPosition}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', color: 'var(--text-muted)', marginBottom: 2 }}>
              {t('ranking.yourPosition')}
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 16, color: 'var(--violet)', letterSpacing: '0.05em' }}>
              {me?.username}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{t('ranking.level')}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--cyan)' }}>{me?.level}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{t('ranking.totalXP')}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--violet)' }}>{((me?.xp ?? 0) / 1000).toFixed(1)}K</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>{t('ranking.change')}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--green)' }}>
              {me?.change >= 0 ? `↑${me.change}` : `↓${Math.abs(me?.change ?? 0)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.2em', color: 'var(--text-muted)' }}>
          {t('ranking.globalRanking')}
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 4 }}>
          {['week', 'month', 'all'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: '5px 14px', borderRadius: 6,
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 11, letterSpacing: '0.1em',
                color: period === p ? 'white' : 'var(--text-muted)',
                background: period === p ? 'var(--violet)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'var(--transition)', textTransform: 'uppercase',
              }}
            >
              {p === 'week' ? t('ranking.week') : p === 'month' ? t('ranking.month') : t('ranking.total')}
            </button>
          ))}
        </div>
      </div>

      {/* ─── PODIUM ─── */}
      <div style={{
        background: 'linear-gradient(180deg, var(--panel), var(--void))',
        border: '1px solid var(--border)', borderRadius: 20,
        padding: '40px 40px 0', marginBottom: 24,
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '100%', height: '100%',
          background: 'radial-gradient(ellipse at top, rgba(245,196,81,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--text-muted)', textAlign: 'center', marginBottom: 32 }}>
          {t('ranking.topPlayers')}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 24, position: 'relative' }}>
          <PodiumCard user={top3[1]} position={2} />
          <PodiumCard user={top3[0]} position={1} />
          <PodiumCard user={top3[2]} position={3} />
        </div>
      </div>

      {/* ─── REST OF RANKING ─── */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px 60px',
          gap: 8, padding: '12px 24px', borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-muted)',
        }}>
          <span>{t('ranking.pos')}</span>
          <span>{t('ranking.player')}</span>
          <span>{t('ranking.title')}</span>
          <span style={{ textAlign: 'right' }}>{t('ranking.level')}</span>
          <span style={{ textAlign: 'right' }}>XP</span>
          <span style={{ textAlign: 'center' }}>{t('ranking.change')}</span>
        </div>

        {rest.map((user, i) => {
          const position = i + 4;
          return (
            <div
              key={user.id}
              style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 120px 80px 60px',
                gap: 8, padding: '14px 24px', borderBottom: '1px solid var(--border)',
                alignItems: 'center',
                background: user.isMe ? 'var(--violet-dim)' : 'transparent',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => { if (!user.isMe) e.currentTarget.style.background = 'var(--surface)'; }}
              onMouseLeave={e => { if (!user.isMe) e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: user.isMe ? 'var(--violet)' : 'var(--text-muted)' }}>
                {position}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: user.isMe ? 'linear-gradient(135deg, var(--violet), var(--cyan))' : 'var(--surface)',
                  border: `2px solid ${user.isMe ? 'var(--violet)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'white', flexShrink: 0,
                }}>
                  {user.username.slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, letterSpacing: '0.05em', color: user.isMe ? 'var(--violet)' : 'var(--text)' }}>
                    {user.username}
                    {user.isMe && (
                      <span style={{ marginLeft: 8, fontFamily: 'var(--font-ui)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--violet)', background: 'rgba(124,92,255,0.2)', border: '1px solid rgba(124,92,255,0.4)', borderRadius: 3, padding: '1px 6px' }}>
                        {t('ranking.you')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                {user.title}
              </div>

              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--cyan)', textAlign: 'right' }}>
                {user.level}
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: user.isMe ? 'var(--violet)' : 'var(--text-muted)', textAlign: 'right' }}>
                {(user.xp / 1000).toFixed(1)}K
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <ChangeIndicator change={user.change} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
