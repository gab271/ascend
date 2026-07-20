-- ============================================================================
-- Ascend — seed data
-- ============================================================================
-- Every statement is idempotent and keyed on `code`, never on a generated
-- UUID. Run this as many times as you like: it converges to the same state
-- instead of creating duplicates.
--
--   npx supabase db push          # schema
--   psql "$DB_URL" -f supabase/seed.sql
--
-- Safe to re-run against production to ship new content.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Level curve: cumulative_xp = 50 * n * (n - 1)
--   L2 = 100    L5  = 1,000     L10 = 4,500
--   L25 = 30,000  L50 = 122,500   L100 = 495,000
-- Stored as rows so you can rebalance progression without a migration.
-- ----------------------------------------------------------------------------
insert into public.level_curve (level, cumulative_xp)
select n, (50 * n * (n - 1))::bigint
from generate_series(1, 100) as n
on conflict (level) do update set cumulative_xp = excluded.cumulative_xp;

-- ----------------------------------------------------------------------------
-- Rank tiers — the soloq ladder
-- ----------------------------------------------------------------------------
insert into public.rank_tiers (code, name, min_total_xp, icon, color, sort_order) values
  ('bronze',      '{"en": "Bronze",      "es": "Bronce"}',      0,      'Shield',  '#cd7f32', 1),
  ('silver',      '{"en": "Silver",      "es": "Plata"}',       2500,   'Shield',  '#c0c0c0', 2),
  ('gold',        '{"en": "Gold",        "es": "Oro"}',         10000,  'Award',   '#ffd700', 3),
  ('platinum',    '{"en": "Platinum",    "es": "Platino"}',     25000,  'Award',   '#5ee7c4', 4),
  ('diamond',     '{"en": "Diamond",     "es": "Diamante"}',    50000,  'Gem',     '#7dd3fc', 5),
  ('master',      '{"en": "Master",      "es": "Maestro"}',     100000, 'Crown',   '#a78bfa', 6),
  ('grandmaster', '{"en": "Grandmaster", "es": "Gran Maestro"}',200000, 'Crown',   '#fb7185', 7),
  ('challenger',  '{"en": "Challenger",  "es": "Retador"}',     400000, 'Flame',   '#fbbf24', 8)
on conflict (code) do update set
  name = excluded.name, min_total_xp = excluded.min_total_xp,
  icon = excluded.icon, color = excluded.color, sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- Cosmetic slots — add one here and the whole app supports it. No migration.
-- ----------------------------------------------------------------------------
insert into public.slots (code, label, sort_order) values
  ('title',      '{"en": "Title",      "es": "Titulo"}',    1),
  ('frame',      '{"en": "Frame",      "es": "Marco"}',     2),
  ('background', '{"en": "Background", "es": "Fondo"}',     3),
  ('banner',     '{"en": "Banner",     "es": "Banner"}',    4),
  ('nameplate',  '{"en": "Nameplate",  "es": "Placa"}',     5),
  ('emote',      '{"en": "Emote",      "es": "Emote"}',     6)
on conflict (code) do update set
  label = excluded.label, sort_order = excluded.sort_order;

-- ----------------------------------------------------------------------------
-- Achievements (seeded before items — items may unlock from them)
--
-- criteria is jsonb, read by private.evaluate_achievements(). Adding a new
-- achievement is an INSERT here; the evaluator never changes.
-- ----------------------------------------------------------------------------
insert into public.achievements (code, name, description, rarity, icon, xp_reward, coins_reward, criteria) values
  ('first_step',
   '{"en": "First Step", "es": "Primer Paso"}',
   '{"en": "Complete your first mission.", "es": "Completa tu primera mision."}',
   'common', 'Footprints', 50, 25, '{"type": "missions_total", "value": 1}'),

  ('week_warrior',
   '{"en": "Week Warrior", "es": "Guerrero Semanal"}',
   '{"en": "Reach a 7-day streak.", "es": "Alcanza una racha de 7 dias."}',
   'common', 'Flame', 150, 50, '{"type": "streak_reach", "value": 7}'),

  ('unbroken',
   '{"en": "Unbroken", "es": "Inquebrantable"}',
   '{"en": "Reach a 30-day streak.", "es": "Alcanza una racha de 30 dias."}',
   'rare', 'Flame', 500, 200, '{"type": "streak_reach", "value": 30}'),

  ('centurion',
   '{"en": "Centurion", "es": "Centurion"}',
   '{"en": "Reach a 100-day streak.", "es": "Alcanza una racha de 100 dias."}',
   'legendary', 'Crown', 2500, 1000, '{"type": "streak_reach", "value": 100}'),

  ('hundred_missions',
   '{"en": "Centenary", "es": "Centenario"}',
   '{"en": "Complete 100 missions.", "es": "Completa 100 misiones."}',
   'rare', 'Target', 400, 150, '{"type": "missions_total", "value": 100}'),

  ('thousand_missions',
   '{"en": "Relentless", "es": "Implacable"}',
   '{"en": "Complete 1000 missions.", "es": "Completa 1000 misiones."}',
   'legendary', 'Target', 3000, 1200, '{"type": "missions_total", "value": 1000}'),

  ('level_10',
   '{"en": "Rising", "es": "Ascendiendo"}',
   '{"en": "Reach level 10.", "es": "Alcanza el nivel 10."}',
   'common', 'TrendingUp', 100, 50, '{"type": "level_reach", "value": 10}'),

  ('level_25',
   '{"en": "Ascendant", "es": "Ascendente"}',
   '{"en": "Reach level 25.", "es": "Alcanza el nivel 25."}',
   'rare', 'TrendingUp', 500, 250, '{"type": "level_reach", "value": 25}'),

  ('level_50',
   '{"en": "Apex", "es": "Cuspide"}',
   '{"en": "Reach level 50.", "es": "Alcanza el nivel 50."}',
   'epic', 'Mountain', 1500, 600, '{"type": "level_reach", "value": 50}'),

  ('iron_body',
   '{"en": "Iron Body", "es": "Cuerpo de Hierro"}',
   '{"en": "Earn 5000 XP in Health.", "es": "Gana 5000 XP en Salud."}',
   'epic', 'Shield', 600, 250, '{"type": "attribute_xp", "attribute": "health", "value": 5000}'),

  ('capitalist',
   '{"en": "Capitalist", "es": "Capitalista"}',
   '{"en": "Earn 5000 XP in Money.", "es": "Gana 5000 XP en Dinero."}',
   'epic', 'DollarSign', 600, 250, '{"type": "attribute_xp", "attribute": "money", "value": 5000}'),

  ('iron_will',
   '{"en": "Iron Will", "es": "Voluntad de Hierro"}',
   '{"en": "Earn 5000 XP in Discipline.", "es": "Gana 5000 XP en Disciplina."}',
   'epic', 'Zap', 600, 250, '{"type": "attribute_xp", "attribute": "discipline", "value": 5000}')
on conflict (code) do update set
  name = excluded.name, description = excluded.description, rarity = excluded.rarity,
  icon = excluded.icon, xp_reward = excluded.xp_reward,
  coins_reward = excluded.coins_reward, criteria = excluded.criteria;

-- ----------------------------------------------------------------------------
-- Daily missions
-- ----------------------------------------------------------------------------
insert into public.missions (code, name, description, cadence, attribute, rarity, xp_reward, coins_reward, icon, target_value, target_unit) values
  -- Health
  ('steps_10k',      '{"en": "10,000 Steps", "es": "10.000 Pasos"}',
                     '{"en": "Walk 10,000 steps today.", "es": "Camina 10.000 pasos hoy."}',
                     'daily', 'health', 'common', 50, 10, 'Footprints', 10000, 'steps'),
  ('gym_session',    '{"en": "Gym Session", "es": "Sesion de Gimnasio"}',
                     '{"en": "Complete a full gym workout.", "es": "Completa un entrenamiento completo."}',
                     'daily', 'health', 'rare', 100, 25, 'Dumbbell', 1, 'session'),
  ('cardio_30',      '{"en": "Cardio 30", "es": "Cardio 30"}',
                     '{"en": "30 minutes of cardio.", "es": "30 minutos de cardio."}',
                     'daily', 'health', 'common', 60, 12, 'HeartPulse', 30, 'min'),
  ('sun_exposure',   '{"en": "Sunlight", "es": "Luz Solar"}',
                     '{"en": "Get 20 minutes of direct sunlight.", "es": "Toma 20 minutos de sol directo."}',
                     'daily', 'health', 'common', 40, 8, 'Sun', 20, 'min'),
  ('protein_goal',   '{"en": "Protein Goal", "es": "Meta de Proteina"}',
                     '{"en": "Hit your daily protein target.", "es": "Alcanza tu meta diaria de proteina."}',
                     'daily', 'health', 'common', 50, 10, 'Beef', 150, 'g'),
  ('sleep_8h',       '{"en": "Full Rest", "es": "Descanso Completo"}',
                     '{"en": "Sleep at least 8 hours.", "es": "Duerme al menos 8 horas."}',
                     'daily', 'health', 'rare', 80, 20, 'Moon', 8, 'h'),
  ('clean_diet',     '{"en": "Clean Diet", "es": "Dieta Limpia"}',
                     '{"en": "No processed food or added sugar.", "es": "Sin procesados ni azucar anadido."}',
                     'daily', 'health', 'rare', 90, 22, 'Salad', 1, 'day'),
  ('hydration',      '{"en": "Hydration", "es": "Hidratacion"}',
                     '{"en": "Drink 3 litres of water.", "es": "Bebe 3 litros de agua."}',
                     'daily', 'health', 'common', 35, 7, 'Droplet', 3, 'L'),
  ('cold_shower',    '{"en": "Cold Shower", "es": "Ducha Fria"}',
                     '{"en": "Take a cold shower.", "es": "Toma una ducha fria."}',
                     'daily', 'health', 'epic', 120, 35, 'Snowflake', 1, 'shower'),

  -- Money
  ('no_spend',       '{"en": "No-Spend Day", "es": "Dia Sin Gastos"}',
                     '{"en": "Spend nothing on non-essentials.", "es": "No gastes en cosas no esenciales."}',
                     'daily', 'money', 'rare', 90, 25, 'PiggyBank', 1, 'day'),
  ('track_expenses', '{"en": "Track Expenses", "es": "Registra Gastos"}',
                     '{"en": "Log every expense today.", "es": "Registra cada gasto de hoy."}',
                     'daily', 'money', 'common', 45, 10, 'Receipt', 1, 'day'),
  ('side_hustle',    '{"en": "Side Hustle", "es": "Trabajo Extra"}',
                     '{"en": "Spend 1 hour on a side income project.", "es": "Dedica 1 hora a un proyecto de ingresos."}',
                     'daily', 'money', 'epic', 130, 40, 'Briefcase', 1, 'h'),
  ('learn_finance',  '{"en": "Learn Finance", "es": "Aprende Finanzas"}',
                     '{"en": "Read or watch 20 minutes on finance.", "es": "Lee o mira 20 minutos sobre finanzas."}',
                     'daily', 'money', 'common', 50, 12, 'BookOpen', 20, 'min'),
  ('cook_at_home',   '{"en": "Cook at Home", "es": "Cocina en Casa"}',
                     '{"en": "Cook instead of ordering out.", "es": "Cocina en vez de pedir comida."}',
                     'daily', 'money', 'common', 40, 10, 'ChefHat', 1, 'meal'),

  -- Discipline
  ('deep_work',      '{"en": "Deep Work", "es": "Trabajo Profundo"}',
                     '{"en": "90 minutes of focused work, no phone.", "es": "90 minutos de trabajo enfocado, sin movil."}',
                     'daily', 'discipline', 'epic', 140, 40, 'Brain', 90, 'min'),
  ('early_rise',     '{"en": "Early Rise", "es": "Madrugar"}',
                     '{"en": "Wake up before 6:30 AM.", "es": "Levantate antes de las 6:30."}',
                     'daily', 'discipline', 'rare', 85, 20, 'Sunrise', 1, 'day'),
  ('read_20',        '{"en": "Read 20 Pages", "es": "Lee 20 Paginas"}',
                     '{"en": "Read 20 pages of a book.", "es": "Lee 20 paginas de un libro."}',
                     'daily', 'discipline', 'common', 50, 12, 'BookMarked', 20, 'pages'),
  ('no_socials',     '{"en": "Digital Detox", "es": "Detox Digital"}',
                     '{"en": "No social media all day.", "es": "Sin redes sociales en todo el dia."}',
                     'daily', 'discipline', 'epic', 130, 38, 'SmartphoneOff', 1, 'day'),
  ('meditate',       '{"en": "Meditate", "es": "Medita"}',
                     '{"en": "Meditate for 10 minutes.", "es": "Medita durante 10 minutos."}',
                     'daily', 'discipline', 'common', 45, 10, 'Sparkles', 10, 'min'),
  ('plan_tomorrow',  '{"en": "Plan Tomorrow", "es": "Planea Manana"}',
                     '{"en": "Write tomorrow''s top 3 tasks.", "es": "Escribe las 3 tareas de manana."}',
                     'daily', 'discipline', 'common', 35, 8, 'ListChecks', 3, 'tasks'),
  ('journal',        '{"en": "Journal", "es": "Diario"}',
                     '{"en": "Write a journal entry.", "es": "Escribe una entrada de diario."}',
                     'daily', 'discipline', 'rare', 70, 18, 'PenLine', 1, 'entry')
on conflict (code) do update set
  name = excluded.name, description = excluded.description, cadence = excluded.cadence,
  attribute = excluded.attribute, rarity = excluded.rarity, xp_reward = excluded.xp_reward,
  coins_reward = excluded.coins_reward, icon = excluded.icon,
  target_value = excluded.target_value, target_unit = excluded.target_unit;

-- ----------------------------------------------------------------------------
-- Weekly missions — bigger commitments, bigger rewards
-- ----------------------------------------------------------------------------
insert into public.missions (code, name, description, cadence, attribute, rarity, xp_reward, coins_reward, icon, target_value, target_unit) values
  ('week_gym_4',     '{"en": "Four Sessions", "es": "Cuatro Sesiones"}',
                     '{"en": "Train at the gym 4 times this week.", "es": "Entrena 4 veces esta semana."}',
                     'weekly', 'health', 'rare', 400, 120, 'Dumbbell', 4, 'sessions'),
  ('week_run_20k',   '{"en": "20K Week", "es": "Semana 20K"}',
                     '{"en": "Run 20 km in total this week.", "es": "Corre 20 km en total esta semana."}',
                     'weekly', 'health', 'epic', 550, 170, 'Footprints', 20, 'km'),
  ('week_sleep',     '{"en": "Rested Week", "es": "Semana Descansada"}',
                     '{"en": "Sleep 8h on at least 6 nights.", "es": "Duerme 8h al menos 6 noches."}',
                     'weekly', 'health', 'epic', 500, 150, 'Moon', 6, 'nights'),
  ('week_budget',    '{"en": "Weekly Budget", "es": "Presupuesto Semanal"}',
                     '{"en": "Stay under budget all week.", "es": "Manten el presupuesto toda la semana."}',
                     'weekly', 'money', 'rare', 420, 130, 'Wallet', 1, 'week'),
  ('week_save',      '{"en": "Pay Yourself First", "es": "Pagate Primero"}',
                     '{"en": "Move money to savings this week.", "es": "Mueve dinero a ahorros esta semana."}',
                     'weekly', 'money', 'epic', 520, 160, 'PiggyBank', 1, 'transfer'),
  ('week_invest',    '{"en": "Invest in Yourself", "es": "Invierte en Ti"}',
                     '{"en": "Finish a course module or certification step.", "es": "Termina un modulo de curso o certificacion."}',
                     'weekly', 'money', 'legendary', 800, 250, 'GraduationCap', 1, 'module'),
  ('week_book',      '{"en": "Finish a Book", "es": "Termina un Libro"}',
                     '{"en": "Finish reading a book.", "es": "Termina de leer un libro."}',
                     'weekly', 'discipline', 'legendary', 850, 260, 'BookMarked', 1, 'book'),
  ('week_no_snooze', '{"en": "Never Snooze", "es": "Sin Posponer"}',
                     '{"en": "Get up on the first alarm, 7 days.", "es": "Levantate a la primera alarma, 7 dias."}',
                     'weekly', 'discipline', 'epic', 560, 175, 'AlarmClock', 7, 'days'),
  ('week_deep_work', '{"en": "10 Hours Deep", "es": "10 Horas Profundas"}',
                     '{"en": "Log 10 hours of deep work this week.", "es": "Registra 10 horas de trabajo profundo."}',
                     'weekly', 'discipline', 'rare', 450, 140, 'Brain', 10, 'h')
on conflict (code) do update set
  name = excluded.name, description = excluded.description, cadence = excluded.cadence,
  attribute = excluded.attribute, rarity = excluded.rarity, xp_reward = excluded.xp_reward,
  coins_reward = excluded.coins_reward, icon = excluded.icon,
  target_value = excluded.target_value, target_unit = excluded.target_unit;

-- ----------------------------------------------------------------------------
-- Items — starter kit (granted automatically on signup)
-- ----------------------------------------------------------------------------
insert into public.items (code, item_type, name, description, rarity, config, acquisition) values
  ('title_novice',  'title',
   '{"en": "Novice", "es": "Novato"}', '{"en": "Everyone starts here.", "es": "Todos empiezan aqui."}',
   'common', '{"color": "#94a3b8"}', 'starter'),
  ('frame_basic',   'frame',
   '{"en": "Basic Frame", "es": "Marco Basico"}', '{"en": "A simple frame.", "es": "Un marco simple."}',
   'common', '{"border": "2px solid #475569"}', 'starter'),
  ('bg_slate',      'background',
   '{"en": "Slate", "es": "Pizarra"}', '{"en": "Default profile background.", "es": "Fondo de perfil por defecto."}',
   'common', '{"gradient": ["#0f172a", "#1e293b"]}', 'starter')
on conflict (code) do update set
  item_type = excluded.item_type, name = excluded.name, description = excluded.description,
  rarity = excluded.rarity, config = excluded.config, acquisition = excluded.acquisition;

-- Shop items (rotate daily through ensure_shop_rotation)
insert into public.items (code, item_type, name, description, rarity, config, acquisition, price_coins) values
  ('frame_bronze',   'frame',
   '{"en": "Bronze Frame", "es": "Marco de Bronce"}', '{"en": "Forged in effort.", "es": "Forjado con esfuerzo."}',
   'common', '{"border": "3px solid #cd7f32"}', 'shop', 300),
  ('frame_neon',     'frame',
   '{"en": "Neon Frame", "es": "Marco Neon"}', '{"en": "Glows in the dark.", "es": "Brilla en la oscuridad."}',
   'rare', '{"border": "3px solid #22d3ee", "glow": "#22d3ee"}', 'shop', 900),
  ('frame_inferno',  'frame',
   '{"en": "Inferno Frame", "es": "Marco Infernal"}', '{"en": "For those who never miss.", "es": "Para los que nunca fallan."}',
   'epic', '{"border": "3px solid #f97316", "glow": "#f97316", "animated": true}', 'shop', 2200),
  ('bg_aurora',      'background',
   '{"en": "Aurora", "es": "Aurora"}', '{"en": "Northern lights.", "es": "Luces del norte."}',
   'rare', '{"gradient": ["#0f172a", "#134e4a", "#065f46"]}', 'shop', 1100),
  ('bg_void',        'background',
   '{"en": "Void", "es": "Vacio"}', '{"en": "Endless dark.", "es": "Oscuridad infinita."}',
   'epic', '{"gradient": ["#000000", "#1e1b4b"], "stars": true}', 'shop', 2400),
  ('banner_forge',   'banner',
   '{"en": "The Forge", "es": "La Forja"}', '{"en": "Where discipline is made.", "es": "Donde se forja la disciplina."}',
   'rare', '{"image": "banners/forge.webp"}', 'shop', 1000),
  ('banner_summit',  'banner',
   '{"en": "Summit", "es": "Cumbre"}', '{"en": "The view from the top.", "es": "La vista desde arriba."}',
   'epic', '{"image": "banners/summit.webp"}', 'shop', 2600),
  ('plate_carbon',   'nameplate',
   '{"en": "Carbon", "es": "Carbono"}', '{"en": "Matte black nameplate.", "es": "Placa negra mate."}',
   'common', '{"bg": "#18181b", "text": "#e4e4e7"}', 'shop', 400),
  ('plate_gold',     'nameplate',
   '{"en": "Gilded", "es": "Dorado"}', '{"en": "Pure gold nameplate.", "es": "Placa de oro puro."}',
   'epic', '{"bg": "#78350f", "text": "#fbbf24", "shimmer": true}', 'shop', 2000),
  ('emote_flex',     'emote',
   '{"en": "Flex", "es": "Flex"}', '{"en": "Show it off.", "es": "Presume."}',
   'common', '{"emoji": "💪"}', 'shop', 250),
  ('emote_fire',     'emote',
   '{"en": "On Fire", "es": "En Llamas"}', '{"en": "Unstoppable.", "es": "Imparable."}',
   'rare', '{"emoji": "🔥"}', 'shop', 700),
  ('emote_crown',    'emote',
   '{"en": "Crowned", "es": "Coronado"}', '{"en": "Top of the ladder.", "es": "Cima de la clasificacion."}',
   'legendary', '{"emoji": "👑"}', 'shop', 4000)
on conflict (code) do update set
  item_type = excluded.item_type, name = excluded.name, description = excluded.description,
  rarity = excluded.rarity, config = excluded.config,
  acquisition = excluded.acquisition, price_coins = excluded.price_coins;

-- Level-gated items (granted automatically by private.grant_level_items)
insert into public.items (code, item_type, name, description, rarity, config, acquisition, unlock_level) values
  ('title_consistent', 'title',
   '{"en": "Consistent", "es": "Constante"}', '{"en": "Reach level 10.", "es": "Alcanza el nivel 10."}',
   'common', '{"color": "#5ee7c4"}', 'level', 10),
  ('title_ascendant',  'title',
   '{"en": "Ascendant", "es": "Ascendente"}', '{"en": "Reach level 25.", "es": "Alcanza el nivel 25."}',
   'rare', '{"color": "#a78bfa"}', 'level', 25),
  ('title_apex',       'title',
   '{"en": "Apex", "es": "Cuspide"}', '{"en": "Reach level 50.", "es": "Alcanza el nivel 50."}',
   'epic', '{"color": "#fbbf24", "glow": true}', 'level', 50),
  ('title_immortal',   'title',
   '{"en": "Immortal", "es": "Inmortal"}', '{"en": "Reach level 100.", "es": "Alcanza el nivel 100."}',
   'legendary', '{"color": "#fb7185", "glow": true, "animated": true}', 'level', 100)
on conflict (code) do update set
  item_type = excluded.item_type, name = excluded.name, description = excluded.description,
  rarity = excluded.rarity, config = excluded.config,
  acquisition = excluded.acquisition, unlock_level = excluded.unlock_level;

-- Achievement-gated items. Referenced by achievement CODE, not UUID, so this
-- stays correct across a full rebuild.
insert into public.items (code, item_type, name, description, rarity, config, acquisition, unlock_achievement_id)
select v.code, v.item_type, v.name::jsonb, v.description::jsonb, v.rarity::public.rarity_type,
       v.config::jsonb, 'achievement'::public.acquisition_type, a.id
from (values
  ('title_unbroken', 'title',
   '{"en": "Unbroken", "es": "Inquebrantable"}', '{"en": "30-day streak.", "es": "Racha de 30 dias."}',
   'rare', '{"color": "#f97316"}', 'unbroken'),
  ('title_centurion', 'title',
   '{"en": "Centurion", "es": "Centurion"}', '{"en": "100-day streak.", "es": "Racha de 100 dias."}',
   'legendary', '{"color": "#fbbf24", "glow": true, "animated": true}', 'centurion'),
  ('frame_relentless', 'frame',
   '{"en": "Relentless Frame", "es": "Marco Implacable"}', '{"en": "1000 missions completed.", "es": "1000 misiones completadas."}',
   'legendary', '{"border": "3px solid #fbbf24", "glow": "#fbbf24", "animated": true}', 'thousand_missions')
) as v(code, item_type, name, description, rarity, config, achievement_code)
join public.achievements a on a.code = v.achievement_code
on conflict (code) do update set
  item_type = excluded.item_type, name = excluded.name, description = excluded.description,
  rarity = excluded.rarity, config = excluded.config,
  acquisition = excluded.acquisition, unlock_achievement_id = excluded.unlock_achievement_id;
