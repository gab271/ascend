import { Shield, DollarSign, Zap, Users, Brain, Palette } from 'lucide-react';

// Presentation fallback for the six life areas.
//
// The DATABASE is the source of truth — public.attributes carries the label,
// colour, emoji and sort order, and get_my_profile() returns them. This map
// only exists for components that render a single mission and have no profile
// payload to read from (MissionCard), so they can still show an icon.
//
// If you add a row to public.attributes, the dashboard and profile pick it up
// automatically. Adding an entry here is optional — it just gives that
// attribute a lucide icon on mission cards instead of the generic fallback.
export const ATTR_CONFIG = {
  health:     { key: 'health',     label: 'SALUD',       color: '#33E6A1', emoji: '⚡',  icon: Shield     },
  money:      { key: 'money',      label: 'DINERO',      color: '#F5C451', emoji: '💰', icon: DollarSign },
  discipline: { key: 'discipline', label: 'DISCIPLINA',  color: '#7C5CFF', emoji: '🎯', icon: Zap        },
  social:     { key: 'social',     label: 'SOCIAL',      color: '#33D1FF', emoji: '🤝', icon: Users      },
  mind:       { key: 'mind',       label: 'MENTE',       color: '#A78BFA', emoji: '🧠', icon: Brain      },
  creativity: { key: 'creativity', label: 'CREATIVIDAD', color: '#FF8C42', emoji: '🎨', icon: Palette    },
};

// Never let an unknown attribute crash a render — a mission whose category was
// added to the database but not here should still draw.
export const FALLBACK_ATTR = {
  key: 'unknown', label: '—', color: '#8B9AB3', emoji: '✨', icon: Zap,
};

export const getAttr = (code) => ATTR_CONFIG[code] ?? FALLBACK_ATTR;
