import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ChangeIndicator({ change }) {
  if (change === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--text-muted)' }}>
      <Minus size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>—</span>
    </div>
  );
  if (change > 0) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--green)' }}>
      <TrendingUp size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>+{change}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--red)' }}>
      <TrendingDown size={12} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>{change}</span>
    </div>
  );
}
