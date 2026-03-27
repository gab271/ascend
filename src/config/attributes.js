import { Shield, DollarSign, Zap } from 'lucide-react';

// Canonical attribute configuration. Import from here — do NOT redeclare locally.
export const ATTR_CONFIG = {
  health:     { key: 'health',     label: 'SALUD',      color: 'var(--green)',  icon: Shield     },
  money:      { key: 'money',      label: 'DINERO',     color: 'var(--gold)',   icon: DollarSign },
  discipline: { key: 'discipline', label: 'DISCIPLINA', color: 'var(--violet)', icon: Zap        },
};
