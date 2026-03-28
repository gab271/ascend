// ─────────────────────────────────────────────────────────────────────────────
// DEV ONLY — mock data for local development and UI prototyping.
// Shape mirrors what Supabase RPCs return. Replace these imports with real
// API calls from src/lib/api/ before shipping to production.
// ─────────────────────────────────────────────────────────────────────────────

export const currentUser = {
  id: 'usr_gabriel',
  username: 'GABRIEL_X',
  title: 'Platino',
  level: 24,
  xp: 4230,
  xpNext: 5000,
  totalXP: 48230,
  avatar: null,
  streak: 14,
  joinedAt: '2024-11-01',
  stats: {
    health:     { value: 78, max: 100, change: +5  },
    money:      { value: 62, max: 100, change: +12 },
    discipline: { value: 91, max: 100, change: +3  },
  },
  weeklyXP: [320, 450, 280, 610, 390, 520, 430],
  badges: [
    { id: 'b1', name: 'Primer Nivel',    icon: '⚡', rarity: 'common',    unlocked: true  },
    { id: 'b2', name: 'Racha de Fuego',  icon: '🔥', rarity: 'rare',      unlocked: true  },
    { id: 'b3', name: 'Maestro del Gym', icon: '💪', rarity: 'epic',      unlocked: true  },
    { id: 'b4', name: 'Inversor',        icon: '💰', rarity: 'rare',      unlocked: true  },
    { id: 'b5', name: 'Incontenible',    icon: '🏆', rarity: 'legendary', unlocked: false },
    { id: 'b6', name: 'Disciplina Total',icon: '🎯', rarity: 'epic',      unlocked: false },
  ],
};

export const dailyMissions = [
  { id: 'm1', name: 'Entrenamiento de fuerza',  description: 'Completa 45 min de entrenamiento de pesas', xp: 150, attribute: 'health',     rarity: 'rare',   completed: false, icon: '💪' },
  { id: 'm2', name: 'Lectura de inversiones',   description: 'Lee 30 páginas de un libro financiero',      xp: 100, attribute: 'money',      rarity: 'common', completed: true,  icon: '📈' },
  { id: 'm3', name: 'Meditación matutina',       description: 'Medita 15 minutos al despertar',             xp: 80,  attribute: 'discipline', rarity: 'common', completed: false, icon: '🧠' },
  { id: 'm4', name: 'Sprint de productividad',   description: 'Trabajo enfocado sin distracciones por 3 horas', xp: 250, attribute: 'discipline', rarity: 'epic', completed: false, icon: '⚡' },
];

export const allMissions = [
  ...dailyMissions,
  { id: 'm5', name: 'Ayuno intermitente',   description: 'Completa 16 horas de ayuno',                   xp: 120,  attribute: 'health',     rarity: 'rare',      completed: false, icon: '🌙' },
  { id: 'm6', name: 'Ahorra $100',          description: 'Guarda $100 sin gastos innecesarios',          xp: 200,  attribute: 'money',      rarity: 'epic',      completed: false, icon: '💵' },
  { id: 'm7', name: 'El Desafío Legendario',description: 'Completa las 5 misiones épicas en un día',     xp: 1000, attribute: 'discipline', rarity: 'legendary', completed: false, icon: '👑' },
  { id: 'm8', name: 'Hidratación perfecta', description: 'Bebe 3L de agua a lo largo del día',           xp: 50,   attribute: 'health',     rarity: 'common',    completed: false, icon: '💧' },
  { id: 'm9', name: 'Sin redes sociales',   description: 'No uses redes sociales por 24 horas',          xp: 180,  attribute: 'discipline', rarity: 'rare',      completed: false, icon: '🔇' },
  { id: 'm10',name: 'Cardio explosivo',     description: 'HIIT de 20 minutos a máxima intensidad',       xp: 130,  attribute: 'health',     rarity: 'rare',      completed: false, icon: '🏃' },
];

export const ranking = [
  { id: 'u1',          username: 'DARKSTAR_X', level: 35, xp: 158400, avatar: null, title: 'Radiante',  change:  0            },
  { id: 'u2',          username: 'RYUU_ALPHA', level: 31, xp: 105200, avatar: null, title: 'Inmortal',  change:  2            },
  { id: 'u3',          username: 'NOVA_PRIME', level: 27, xp: 68900,  avatar: null, title: 'Diamante',  change: -1            },
  { id: 'u4',          username: 'ZEPHYR_77',  level: 25, xp: 55100,  avatar: null, title: 'Diamante',  change:  1            },
  { id: 'usr_gabriel', username: 'GABRIEL_X',  level: 20, xp: 43230,  avatar: null, title: 'Platino',   change:  3, isMe: true },
  { id: 'u6',          username: 'CIPHER_K',   level: 17, xp: 32800,  avatar: null, title: 'Oro',       change: -2            },
  { id: 'u7',          username: 'VECTOR_9',   level: 14, xp: 23500,  avatar: null, title: 'Oro',       change:  0            },
  { id: 'u8',          username: 'PHANTOM_Z',  level: 11, xp: 14200,  avatar: null, title: 'Plata',     change:  4            },
  { id: 'u9',          username: 'STORM_IX',   level:  7, xp: 6200,   avatar: null, title: 'Bronce',    change: -1            },
  { id: 'u10',         username: 'BLAZE_01',   level:  3, xp: 1400,   avatar: null, title: 'Hierro',    change:  1            },
];

export const rewards = {
  badges: [
    { id: 'r1', name: 'Primer Nivel',    rarity: 'common',    type: 'badge', icon: '⚡', unlocked: true,  xpRequired: 0     },
    { id: 'r2', name: 'Racha de Fuego',  rarity: 'rare',      type: 'badge', icon: '🔥', unlocked: true,  xpRequired: 5000  },
    { id: 'r3', name: 'Guerrero del Gym',rarity: 'epic',      type: 'badge', icon: '💪', unlocked: true,  xpRequired: 15000 },
    { id: 'r4', name: 'Inversor Élite',  rarity: 'rare',      type: 'badge', icon: '📈', unlocked: false, xpRequired: 25000 },
    { id: 'r5', name: 'Maestro Mental',  rarity: 'epic',      type: 'badge', icon: '🧠', unlocked: false, xpRequired: 35000 },
    { id: 'r6', name: 'La Corona',       rarity: 'legendary', type: 'badge', icon: '👑', unlocked: false, xpRequired: 50000 },
  ],
  titles: [
    { id: 't1', name: 'Hierro',   rarity: 'common',    type: 'title', unlocked: true,  xpRequired: 0      },
    { id: 't2', name: 'Bronce',   rarity: 'common',    type: 'title', unlocked: true,  xpRequired: 3000   },
    { id: 't3', name: 'Plata',    rarity: 'common',    type: 'title', unlocked: true,  xpRequired: 10000  },
    { id: 't4', name: 'Oro',      rarity: 'rare',      type: 'title', unlocked: false, xpRequired: 22000  },
    { id: 't5', name: 'Platino',  rarity: 'rare',      type: 'title', unlocked: false, xpRequired: 40000  },
    { id: 't6', name: 'Diamante', rarity: 'epic',      type: 'title', unlocked: false, xpRequired: 65000  },
    { id: 't7', name: 'Inmortal', rarity: 'epic',      type: 'title', unlocked: false, xpRequired: 100000 },
    { id: 't8', name: 'Radiante', rarity: 'legendary', type: 'title', unlocked: false, xpRequired: 150000 },
  ],
  frames: [
    { id: 'f1', name: 'Marco Básico',  rarity: 'common',    type: 'frame', unlocked: true,  xpRequired: 0     },
    { id: 'f2', name: 'Filo Cian',     rarity: 'rare',      type: 'frame', unlocked: true,  xpRequired: 10000 },
    { id: 'f3', name: 'Aura Violeta',  rarity: 'epic',      type: 'frame', unlocked: false, xpRequired: 30000 },
    { id: 'f4', name: 'Corona Dorada', rarity: 'legendary', type: 'frame', unlocked: false, xpRequired: 80000 },
  ],
  backgrounds: [
    { id: 'bg1', name: 'Void',             rarity: 'common',    type: 'background', unlocked: true,  xpRequired: 0,     color: '#0A0B10' },
    { id: 'bg2', name: 'Abismo Cian',      rarity: 'rare',      type: 'background', unlocked: true,  xpRequired: 15000, color: '#051820' },
    { id: 'bg3', name: 'Violeta Profundo', rarity: 'epic',      type: 'background', unlocked: false, xpRequired: 40000, color: '#0D0A1F' },
    { id: 'bg4', name: 'Cosmos Dorado',    rarity: 'legendary', type: 'background', unlocked: false, xpRequired: 90000, color: '#1A1200' },
  ],
};
