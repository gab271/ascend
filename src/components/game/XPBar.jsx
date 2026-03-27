import { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

// Segmented animated XP progress bar
export default function XPBar({ current, max, nextLevel, segments = 20 }) {
  const [tick, setTick] = useState(0);
  const percent = (current / max) * 100;

  useEffect(() => {
    const t = setTimeout(() => setTick(1), 300);
    return () => clearTimeout(t);
  }, []);

  const animPercent = tick ? percent : 0;
  const filled = Math.floor((animPercent / 100) * segments);
  const partial = ((animPercent / 100) * segments) % 1;

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 8,
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--violet)' }}>
          <Zap size={11} /> EXPERIENCIA
        </span>
        <span>
          {current.toLocaleString()}
          <span style={{ color: 'var(--text-muted)' }}> / {max.toLocaleString()} XP</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
        {Array.from({ length: segments }).map((_, i) => {
          const isFilled = i < filled;
          const isPartial = i === filled && partial > 0;
          return (
            <div key={i} style={{
              flex: 1, height: 14,
              background: isFilled
                ? 'linear-gradient(90deg, var(--violet), var(--cyan))'
                : isPartial
                  ? `linear-gradient(90deg, var(--violet) ${partial * 100}%, var(--surface) ${partial * 100}%)`
                  : 'var(--surface)',
              borderRadius: 2,
              border: isFilled || isPartial ? 'none' : '1px solid var(--border)',
              boxShadow: isFilled ? '0 0 5px rgba(124,92,255,0.3)' : 'none',
              transition: `background ${0.6 + i * 0.04}s cubic-bezier(0.4, 0, 0.2, 1)`,
              transitionDelay: tick ? `${i * 0.03}s` : '0s',
              position: 'relative', overflow: 'hidden',
            }}>
              {isFilled && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(0deg, transparent, rgba(255,255,255,0.14))',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {nextLevel != null && (
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', textAlign: 'right' }}>
          {(max - current).toLocaleString()} XP para nivel {nextLevel}
        </div>
      )}
    </div>
  );
}
