import { RARITY_CONFIG } from '../../config/rarities';

export default function RarityBadge({ rarity, isLegendary = false, style }) {
  const r = RARITY_CONFIG[rarity];
  if (!r) return null;
  return (
    <div style={{
      fontFamily: 'var(--font-ui)',
      fontWeight: 700,
      fontSize: 10,
      letterSpacing: '0.12em',
      color: r.color,
      background: `${r.color}18`,
      border: `1px solid ${r.color}44`,
      borderRadius: 4,
      padding: '3px 8px',
      display: 'inline-block',
      ...style,
    }}>
      {isLegendary ? '⭐ ' : ''}{r.label}
    </div>
  );
}
