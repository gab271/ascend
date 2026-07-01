import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { completeOnboarding } from '../../lib/api/missions';

// ─── Category definitions ─────────────────────────────────────
// Each entry maps to a row in the attribute_type enum.

const CATEGORIES = [
  {
    id:       'health',
    icon:     '⚡',
    color:    '#33E6A1',
    nameKey:  'onboarding.cats.health.name',
    descKey:  'onboarding.cats.health.desc',
    samples:  ['onboarding.cats.health.s1', 'onboarding.cats.health.s2'],
  },
  {
    id:       'money',
    icon:     '💰',
    color:    '#F5C451',
    nameKey:  'onboarding.cats.money.name',
    descKey:  'onboarding.cats.money.desc',
    samples:  ['onboarding.cats.money.s1', 'onboarding.cats.money.s2'],
  },
  {
    id:       'discipline',
    icon:     '🎯',
    color:    '#7C5CFF',
    nameKey:  'onboarding.cats.discipline.name',
    descKey:  'onboarding.cats.discipline.desc',
    samples:  ['onboarding.cats.discipline.s1', 'onboarding.cats.discipline.s2'],
  },
  {
    id:       'social',
    icon:     '🤝',
    color:    '#33D1FF',
    nameKey:  'onboarding.cats.social.name',
    descKey:  'onboarding.cats.social.desc',
    samples:  ['onboarding.cats.social.s1', 'onboarding.cats.social.s2'],
  },
  {
    id:       'mind',
    icon:     '🧠',
    color:    '#A78BFA',
    nameKey:  'onboarding.cats.mind.name',
    descKey:  'onboarding.cats.mind.desc',
    samples:  ['onboarding.cats.mind.s1', 'onboarding.cats.mind.s2'],
  },
  {
    id:       'creativity',
    icon:     '🎨',
    color:    '#FF8C42',
    nameKey:  'onboarding.cats.creativity.name',
    descKey:  'onboarding.cats.creativity.desc',
    samples:  ['onboarding.cats.creativity.s1', 'onboarding.cats.creativity.s2'],
  },
];

// ─── Category card ────────────────────────────────────────────

function CategoryCard({ cat, active, onToggle, t }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: active
          ? `linear-gradient(145deg, ${cat.color}22, ${cat.color}0A)`
          : hovered
            ? 'rgba(255,255,255,0.03)'
            : 'var(--panel)',
        border: `2px solid ${active ? cat.color : hovered ? cat.color + '55' : 'var(--border)'}`,
        borderRadius: 18,
        padding: '26px 22px 22px',
        cursor: 'pointer',
        transition: 'all 0.22s ease',
        boxShadow: active
          ? `0 0 0 1px ${cat.color}30, 0 12px 40px ${cat.color}22`
          : 'none',
        userSelect: 'none',
      }}
    >
      {/* Checkmark badge */}
      <div style={{
        position: 'absolute', top: 14, right: 14,
        width: 24, height: 24, borderRadius: '50%',
        background: active ? cat.color : 'var(--border)',
        border: `2px solid ${active ? cat.color : 'var(--border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: active ? '#0A0B10' : 'transparent',
        transition: 'all 0.2s',
        boxShadow: active ? `0 0 10px ${cat.color}66` : 'none',
      }}>
        ✓
      </div>

      {/* Icon */}
      <div style={{
        fontSize: 38, lineHeight: 1,
        marginBottom: 12,
        filter: active ? 'drop-shadow(0 0 8px ' + cat.color + '88)' : 'none',
        transition: 'filter 0.2s',
      }}>
        {cat.icon}
      </div>

      {/* Name */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 20,
        letterSpacing: '0.06em',
        color: active ? cat.color : 'var(--text)',
        marginBottom: 6,
        transition: 'color 0.2s',
      }}>
        {t(cat.nameKey)}
      </div>

      {/* Description */}
      <div style={{
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text-muted)',
        lineHeight: 1.55,
        marginBottom: 14,
      }}>
        {t(cat.descKey)}
      </div>

      {/* Sample missions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {cat.samples.map((sk, i) => (
          <div
            key={i}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.04em',
              color: active ? cat.color + 'CC' : 'rgba(139,154,179,0.6)',
              transition: 'color 0.2s',
            }}
          >
            <div style={{
              width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
              background: active ? cat.color : 'var(--border)',
              transition: 'background 0.2s',
            }} />
            {t(sk)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────

export default function Onboarding() {
  const { refreshProfile } = useAuth();
  const navigate            = useNavigate();
  const { t }               = useLanguage();

  const [selected, setSelected] = useState([]);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  function toggle(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    setError('');
  }

  async function handleStart() {
    if (selected.length === 0) { setError(t('onboarding.selectAtLeastOne')); return; }
    setSaving(true);
    const { error: rpcError } = await completeOnboarding(selected);
    if (rpcError) { setError(rpcError.message); setSaving(false); return; }
    await refreshProfile();
    navigate('/dashboard', { replace: true });
  }

  const canStart = selected.length > 0 && !saving;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--void)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 20px 60px',
    }}>

      {/* ── Brand mark ── */}
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 15, letterSpacing: '0.35em',
        color: 'var(--text-muted)',
        marginBottom: 36,
      }}>
        ⚡ ASCEND
      </div>

      {/* ── Headline ── */}
      <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 560 }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          lineHeight: 1.05,
          letterSpacing: '0.03em',
          color: 'var(--text)',
          margin: '0 0 16px',
        }}>
          {t('onboarding.headline1')}<br />
          <span style={{ color: 'var(--violet)' }}>{t('onboarding.headline2')}</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          color: 'var(--text-muted)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {t('onboarding.subtitle')}
        </p>
      </div>

      {/* ── Category grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
        gap: 14,
        width: '100%',
        maxWidth: 720,
        marginBottom: 40,
      }}>
        {CATEGORIES.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            active={selected.includes(cat.id)}
            onToggle={() => toggle(cat.id)}
            t={t}
          />
        ))}
      </div>

      {/* ── Selection counter ── */}
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.15em',
        color: selected.length > 0 ? 'var(--text-muted)' : 'transparent',
        marginBottom: 14,
        transition: 'color 0.2s',
      }}>
        {selected.length} {t('onboarding.selectedCount')}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: '#FF4D6A', letterSpacing: '0.06em',
          marginBottom: 14,
        }}>
          ⚠ {error}
        </div>
      )}

      {/* ── CTA button ── */}
      <button
        onClick={handleStart}
        disabled={!canStart}
        style={{
          padding: '16px 52px',
          background: canStart
            ? 'linear-gradient(135deg, var(--violet) 0%, #5a3fd4 100%)'
            : 'var(--panel)',
          border: `1px solid ${canStart ? 'var(--violet)' : 'var(--border)'}`,
          borderRadius: 12,
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: 14,
          letterSpacing: '0.18em',
          color: canStart ? '#fff' : 'var(--text-muted)',
          cursor: canStart ? 'pointer' : 'default',
          transition: 'all 0.25s',
          boxShadow: canStart ? '0 8px 32px rgba(124,92,255,0.4)' : 'none',
          minWidth: 260,
        }}
      >
        {saving
          ? t('onboarding.starting')
          : selected.length === 0
            ? t('onboarding.ctaEmpty')
            : `${t('onboarding.cta')} (${selected.length})`
        }
      </button>

      {/* ── Fine print ── */}
      <p style={{
        marginTop: 20,
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'rgba(139,154,179,0.5)',
        textAlign: 'center',
        maxWidth: 340,
        lineHeight: 1.6,
      }}>
        {t('onboarding.finePrint')}
      </p>
    </div>
  );
}
