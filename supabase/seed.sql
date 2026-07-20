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
  ('bronze',      '{"en": "Bronze",      "es": "Bronce"}',      0,      '🥉',  '#cd7f32', 1),
  ('silver',      '{"en": "Silver",      "es": "Plata"}',       2500,   '🥈',  '#c0c0c0', 2),
  ('gold',        '{"en": "Gold",        "es": "Oro"}',         10000,  '🥇',   '#ffd700', 3),
  ('platinum',    '{"en": "Platinum",    "es": "Platino"}',     25000,  '💠',   '#5ee7c4', 4),
  ('diamond',     '{"en": "Diamond",     "es": "Diamante"}',    50000,  '💎',     '#7dd3fc', 5),
  ('master',      '{"en": "Master",      "es": "Maestro"}',     100000, '👑',   '#a78bfa', 6),
  ('grandmaster', '{"en": "Grandmaster", "es": "Gran Maestro"}',200000, '🔱',   '#fb7185', 7),
  ('challenger',  '{"en": "Challenger",  "es": "Retador"}',     400000, '🔥',   '#fbbf24', 8)
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
   'common', '👣', 50, 25, '{"type": "missions_total", "value": 1}'),

  ('week_warrior',
   '{"en": "Week Warrior", "es": "Guerrero Semanal"}',
   '{"en": "Reach a 7-day streak.", "es": "Alcanza una racha de 7 dias."}',
   'common', '🔥', 150, 50, '{"type": "streak_reach", "value": 7}'),

  ('unbroken',
   '{"en": "Unbroken", "es": "Inquebrantable"}',
   '{"en": "Reach a 30-day streak.", "es": "Alcanza una racha de 30 dias."}',
   'rare', '🔥', 500, 200, '{"type": "streak_reach", "value": 30}'),

  ('centurion',
   '{"en": "Centurion", "es": "Centurion"}',
   '{"en": "Reach a 100-day streak.", "es": "Alcanza una racha de 100 dias."}',
   'legendary', '👑', 2500, 1000, '{"type": "streak_reach", "value": 100}'),

  ('hundred_missions',
   '{"en": "Centenary", "es": "Centenario"}',
   '{"en": "Complete 100 missions.", "es": "Completa 100 misiones."}',
   'rare', '🎯', 400, 150, '{"type": "missions_total", "value": 100}'),

  ('thousand_missions',
   '{"en": "Relentless", "es": "Implacable"}',
   '{"en": "Complete 1000 missions.", "es": "Completa 1000 misiones."}',
   'legendary', '🏆', 3000, 1200, '{"type": "missions_total", "value": 1000}'),

  ('level_10',
   '{"en": "Rising", "es": "Ascendiendo"}',
   '{"en": "Reach level 10.", "es": "Alcanza el nivel 10."}',
   'common', '📈', 100, 50, '{"type": "level_reach", "value": 10}'),

  ('level_25',
   '{"en": "Ascendant", "es": "Ascendente"}',
   '{"en": "Reach level 25.", "es": "Alcanza el nivel 25."}',
   'rare', '⭐', 500, 250, '{"type": "level_reach", "value": 25}'),

  ('level_50',
   '{"en": "Apex", "es": "Cuspide"}',
   '{"en": "Reach level 50.", "es": "Alcanza el nivel 50."}',
   'epic', '🏔️', 1500, 600, '{"type": "level_reach", "value": 50}'),

  ('iron_body',
   '{"en": "Iron Body", "es": "Cuerpo de Hierro"}',
   '{"en": "Earn 5000 XP in Health.", "es": "Gana 5000 XP en Salud."}',
   'epic', '🛡️', 600, 250, '{"type": "attribute_xp", "attribute": "health", "value": 5000}'),

  ('capitalist',
   '{"en": "Capitalist", "es": "Capitalista"}',
   '{"en": "Earn 5000 XP in Money.", "es": "Gana 5000 XP en Dinero."}',
   'epic', '💰', 600, 250, '{"type": "attribute_xp", "attribute": "money", "value": 5000}'),

  ('iron_will',
   '{"en": "Iron Will", "es": "Voluntad de Hierro"}',
   '{"en": "Earn 5000 XP in Discipline.", "es": "Gana 5000 XP en Disciplina."}',
   'epic', '⚡', 600, 250, '{"type": "attribute_xp", "attribute": "discipline", "value": 5000}')
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
                     'daily', 'health', 'common', 50, 10, '👣', 10000, 'steps'),
  ('gym_session',    '{"en": "Gym Session", "es": "Sesion de Gimnasio"}',
                     '{"en": "Complete a full gym workout.", "es": "Completa un entrenamiento completo."}',
                     'daily', 'health', 'rare', 100, 25, '💪', 1, 'session'),
  ('cardio_30',      '{"en": "Cardio 30", "es": "Cardio 30"}',
                     '{"en": "30 minutes of cardio.", "es": "30 minutos de cardio."}',
                     'daily', 'health', 'common', 60, 12, '🏃', 30, 'min'),
  ('sun_exposure',   '{"en": "Sunlight", "es": "Luz Solar"}',
                     '{"en": "Get 20 minutes of direct sunlight.", "es": "Toma 20 minutos de sol directo."}',
                     'daily', 'health', 'common', 40, 8, '☀️', 20, 'min'),
  ('protein_goal',   '{"en": "Protein Goal", "es": "Meta de Proteina"}',
                     '{"en": "Hit your daily protein target.", "es": "Alcanza tu meta diaria de proteina."}',
                     'daily', 'health', 'common', 50, 10, '🥩', 150, 'g'),
  ('sleep_8h',       '{"en": "Full Rest", "es": "Descanso Completo"}',
                     '{"en": "Sleep at least 8 hours.", "es": "Duerme al menos 8 horas."}',
                     'daily', 'health', 'rare', 80, 20, '🌙', 8, 'h'),
  ('clean_diet',     '{"en": "Clean Diet", "es": "Dieta Limpia"}',
                     '{"en": "No processed food or added sugar.", "es": "Sin procesados ni azucar anadido."}',
                     'daily', 'health', 'rare', 90, 22, '🥗', 1, 'day'),
  ('hydration',      '{"en": "Hydration", "es": "Hidratacion"}',
                     '{"en": "Drink 3 litres of water.", "es": "Bebe 3 litros de agua."}',
                     'daily', 'health', 'common', 35, 7, '💧', 3, 'L'),
  ('cold_shower',    '{"en": "Cold Shower", "es": "Ducha Fria"}',
                     '{"en": "Take a cold shower.", "es": "Toma una ducha fria."}',
                     'daily', 'health', 'epic', 120, 35, '🧊', 1, 'shower'),

  -- Money
  ('no_spend',       '{"en": "No-Spend Day", "es": "Dia Sin Gastos"}',
                     '{"en": "Spend nothing on non-essentials.", "es": "No gastes en cosas no esenciales."}',
                     'daily', 'money', 'rare', 90, 25, '🐷', 1, 'day'),
  ('track_expenses', '{"en": "Track Expenses", "es": "Registra Gastos"}',
                     '{"en": "Log every expense today.", "es": "Registra cada gasto de hoy."}',
                     'daily', 'money', 'common', 45, 10, '🧾', 1, 'day'),
  ('side_hustle',    '{"en": "Side Hustle", "es": "Trabajo Extra"}',
                     '{"en": "Spend 1 hour on a side income project.", "es": "Dedica 1 hora a un proyecto de ingresos."}',
                     'daily', 'money', 'epic', 130, 40, '💼', 1, 'h'),
  ('learn_finance',  '{"en": "Learn Finance", "es": "Aprende Finanzas"}',
                     '{"en": "Read or watch 20 minutes on finance.", "es": "Lee o mira 20 minutos sobre finanzas."}',
                     'daily', 'money', 'common', 50, 12, '📈', 20, 'min'),
  ('cook_at_home',   '{"en": "Cook at Home", "es": "Cocina en Casa"}',
                     '{"en": "Cook instead of ordering out.", "es": "Cocina en vez de pedir comida."}',
                     'daily', 'money', 'common', 40, 10, '🍳', 1, 'meal'),

  -- Discipline
  ('deep_work',      '{"en": "Deep Work", "es": "Trabajo Profundo"}',
                     '{"en": "90 minutes of focused work, no phone.", "es": "90 minutos de trabajo enfocado, sin movil."}',
                     'daily', 'discipline', 'epic', 140, 40, '🧠', 90, 'min'),
  ('early_rise',     '{"en": "Early Rise", "es": "Madrugar"}',
                     '{"en": "Wake up before 6:30 AM.", "es": "Levantate antes de las 6:30."}',
                     'daily', 'discipline', 'rare', 85, 20, '🌅', 1, 'day'),
  ('read_20',        '{"en": "Read 20 Pages", "es": "Lee 20 Paginas"}',
                     '{"en": "Read 20 pages of a book.", "es": "Lee 20 paginas de un libro."}',
                     'daily', 'discipline', 'common', 50, 12, '📖', 20, 'pages'),
  ('no_socials',     '{"en": "Digital Detox", "es": "Detox Digital"}',
                     '{"en": "No social media all day.", "es": "Sin redes sociales en todo el dia."}',
                     'daily', 'discipline', 'epic', 130, 38, '📵', 1, 'day'),
  ('meditate',       '{"en": "Meditate", "es": "Medita"}',
                     '{"en": "Meditate for 10 minutes.", "es": "Medita durante 10 minutos."}',
                     'daily', 'discipline', 'common', 45, 10, '🧘', 10, 'min'),
  ('plan_tomorrow',  '{"en": "Plan Tomorrow", "es": "Planea Manana"}',
                     '{"en": "Write tomorrow''s top 3 tasks.", "es": "Escribe las 3 tareas de manana."}',
                     'daily', 'discipline', 'common', 35, 8, '📋', 3, 'tasks'),
  ('journal',        '{"en": "Journal", "es": "Diario"}',
                     '{"en": "Write a journal entry.", "es": "Escribe una entrada de diario."}',
                     'daily', 'discipline', 'rare', 70, 18, '✍️', 1, 'entry')
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
                     'weekly', 'health', 'rare', 400, 120, '🏋️', 4, 'sessions'),
  ('week_run_20k',   '{"en": "20K Week", "es": "Semana 20K"}',
                     '{"en": "Run 20 km in total this week.", "es": "Corre 20 km en total esta semana."}',
                     'weekly', 'health', 'epic', 550, 170, '🏃', 20, 'km'),
  ('week_sleep',     '{"en": "Rested Week", "es": "Semana Descansada"}',
                     '{"en": "Sleep 8h on at least 6 nights.", "es": "Duerme 8h al menos 6 noches."}',
                     'weekly', 'health', 'epic', 500, 150, '😴', 6, 'nights'),
  ('week_budget',    '{"en": "Weekly Budget", "es": "Presupuesto Semanal"}',
                     '{"en": "Stay under budget all week.", "es": "Manten el presupuesto toda la semana."}',
                     'weekly', 'money', 'rare', 420, 130, '💳', 1, 'week'),
  ('week_save',      '{"en": "Pay Yourself First", "es": "Pagate Primero"}',
                     '{"en": "Move money to savings this week.", "es": "Mueve dinero a ahorros esta semana."}',
                     'weekly', 'money', 'epic', 520, 160, '🐷', 1, 'transfer'),
  ('week_invest',    '{"en": "Invest in Yourself", "es": "Invierte en Ti"}',
                     '{"en": "Finish a course module or certification step.", "es": "Termina un modulo de curso o certificacion."}',
                     'weekly', 'money', 'legendary', 800, 250, '🎓', 1, 'module'),
  ('week_book',      '{"en": "Finish a Book", "es": "Termina un Libro"}',
                     '{"en": "Finish reading a book.", "es": "Termina de leer un libro."}',
                     'weekly', 'discipline', 'legendary', 850, 260, '📚', 1, 'book'),
  ('week_no_snooze', '{"en": "Never Snooze", "es": "Sin Posponer"}',
                     '{"en": "Get up on the first alarm, 7 days.", "es": "Levantate a la primera alarma, 7 dias."}',
                     'weekly', 'discipline', 'epic', 560, 175, '⏰', 7, 'days'),
  ('week_deep_work', '{"en": "10 Hours Deep", "es": "10 Horas Profundas"}',
                     '{"en": "Log 10 hours of deep work this week.", "es": "Registra 10 horas de trabajo profundo."}',
                     'weekly', 'discipline', 'rare', 450, 140, '🧠', 10, 'h')
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

-- ----------------------------------------------------------------------------
-- Missions for Social / Mind / Creativity  (added with migration 010)
--
-- The first sample under each onboarding card is included verbatim, so what the
-- card promises is a mission the user will actually be assigned.
-- ----------------------------------------------------------------------------
insert into public.missions (code, name, description, cadence, attribute, rarity, xp_reward, coins_reward, icon, target_value, target_unit) values
  -- ── Social ──────────────────────────────────────────────────
  ('call_loved_one',  '{"en": "Call Someone You Care About", "es": "Llama a Alguien Querido"}',
                      '{"en": "Call a friend or family member, not a text.", "es": "Llama a un amigo o familiar, nada de mensajes."}',
                      'daily', 'social', 'common', 50, 12, '📞', 1, 'call'),
  ('new_contact',     '{"en": "Make a New Contact", "es": "Haz un Nuevo Contacto"}',
                      '{"en": "Start a conversation with someone new.", "es": "Inicia una conversacion con alguien nuevo."}',
                      'daily', 'social', 'rare', 90, 24, '🤝', 1, 'person'),
  ('quality_time',    '{"en": "Quality Time", "es": "Tiempo de Calidad"}',
                      '{"en": "One hour with someone, phones away.", "es": "Una hora con alguien, sin moviles."}',
                      'daily', 'social', 'rare', 85, 20, '☕', 1, 'h'),
  ('give_compliment', '{"en": "Genuine Compliment", "es": "Cumplido Sincero"}',
                      '{"en": "Tell someone something you appreciate about them.", "es": "Dile a alguien algo que aprecias de esa persona."}',
                      'daily', 'social', 'common', 35, 8, '💬', 1, 'person'),
  ('reconnect',       '{"en": "Reconnect", "es": "Reconecta"}',
                      '{"en": "Message someone you have lost touch with.", "es": "Escribe a alguien con quien perdiste el contacto."}',
                      'daily', 'social', 'rare', 80, 20, '✉️', 1, 'person'),
  ('help_someone',    '{"en": "Help Someone", "es": "Ayuda a Alguien"}',
                      '{"en": "Help someone expecting nothing back.", "es": "Ayuda a alguien sin esperar nada a cambio."}',
                      'daily', 'social', 'epic', 120, 34, '🫶', 1, 'act'),
  ('family_check',    '{"en": "Check On Family", "es": "Cuida de los Tuyos"}',
                      '{"en": "Ask a family member how they really are.", "es": "Pregunta a un familiar como esta de verdad."}',
                      'daily', 'social', 'common', 45, 10, '👨‍👩‍👧', 1, 'check'),

  -- ── Mind ────────────────────────────────────────────────────
  ('read_30_mind',    '{"en": "Read for 30 Minutes", "es": "Lee 30 Minutos"}',
                      '{"en": "Read anything that teaches you something.", "es": "Lee algo que te ensene algo nuevo."}',
                      'daily', 'mind', 'common', 55, 12, '📚', 30, 'min'),
  ('online_lesson',   '{"en": "Complete an Online Lesson", "es": "Completa una Leccion Online"}',
                      '{"en": "Finish one lesson or module of a course.", "es": "Termina una leccion o modulo de un curso."}',
                      'daily', 'mind', 'rare', 95, 25, '🎓', 1, 'lesson'),
  ('practice_language','{"en": "Practice a Language", "es": "Practica un Idioma"}',
                      '{"en": "15 minutes of language practice.", "es": "15 minutos de practica de idioma."}',
                      'daily', 'mind', 'common', 50, 12, '🗣️', 15, 'min'),
  ('educational_pod', '{"en": "Learn While You Move", "es": "Aprende en Movimiento"}',
                      '{"en": "Listen to an educational podcast episode.", "es": "Escucha un episodio de podcast educativo."}',
                      'daily', 'mind', 'common', 40, 10, '🎧', 1, 'episode'),
  ('summarise_learn', '{"en": "Write What You Learned", "es": "Escribe lo Aprendido"}',
                      '{"en": "Summarise today''s learning in your own words.", "es": "Resume lo aprendido hoy con tus palabras."}',
                      'daily', 'mind', 'rare', 75, 18, '📝', 1, 'note'),
  ('brain_game',      '{"en": "Train Your Brain", "es": "Entrena tu Cerebro"}',
                      '{"en": "Solve a puzzle, chess problem or brain game.", "es": "Resuelve un puzzle, problema de ajedrez o juego mental."}',
                      'daily', 'mind', 'common', 35, 8, '🧩', 1, 'puzzle'),
  ('deep_documentary','{"en": "Watch Something Real", "es": "Mira Algo Real"}',
                      '{"en": "Watch a documentary or a technical talk.", "es": "Mira un documental o una charla tecnica."}',
                      'daily', 'mind', 'common', 45, 10, '🎬', 1, 'video'),

  -- ── Creativity ──────────────────────────────────────────────
  ('project_1h',      '{"en": "Work on Your Project 1h", "es": "Trabaja en tu Proyecto 1h"}',
                      '{"en": "One focused hour on something you are building.", "es": "Una hora enfocada en algo que estas construyendo."}',
                      'daily', 'creativity', 'rare', 100, 26, '🛠️', 1, 'h'),
  ('share_creation',  '{"en": "Share Something You Made", "es": "Comparte Algo que Hiciste"}',
                      '{"en": "Put something you created out in public.", "es": "Publica algo que hayas creado."}',
                      'daily', 'creativity', 'epic', 130, 38, '📤', 1, 'post'),
  ('sketch',          '{"en": "Sketch Something", "es": "Dibuja Algo"}',
                      '{"en": "Draw for 15 minutes — quality irrelevant.", "es": "Dibuja 15 minutos, la calidad da igual."}',
                      'daily', 'creativity', 'common', 40, 10, '✏️', 15, 'min'),
  ('write_creative',  '{"en": "Write Freely", "es": "Escribe Libremente"}',
                      '{"en": "20 minutes of creative writing.", "es": "20 minutos de escritura creativa."}',
                      'daily', 'creativity', 'common', 50, 12, '🖋️', 20, 'min'),
  ('make_music',      '{"en": "Make Music", "es": "Haz Musica"}',
                      '{"en": "Play or produce music for 20 minutes.", "es": "Toca o produce musica durante 20 minutos."}',
                      'daily', 'creativity', 'rare', 80, 20, '🎵', 20, 'min'),
  ('intentional_photo','{"en": "One Good Photo", "es": "Una Buena Foto"}',
                      '{"en": "Take one photo you actually composed.", "es": "Haz una foto que hayas compuesto de verdad."}',
                      'daily', 'creativity', 'common', 35, 8, '📸', 1, 'photo'),
  ('brainstorm_10',   '{"en": "Ten New Ideas", "es": "Diez Ideas Nuevas"}',
                      '{"en": "Write down 10 ideas. Bad ones count.", "es": "Escribe 10 ideas. Las malas tambien cuentan."}',
                      'daily', 'creativity', 'rare', 70, 18, '💡', 10, 'ideas'),

  -- ── Weekly ──────────────────────────────────────────────────
  ('week_meetup',     '{"en": "See a Friend", "es": "Ve a un Amigo"}',
                      '{"en": "Meet someone in person this week.", "es": "Queda con alguien en persona esta semana."}',
                      'weekly', 'social', 'rare', 430, 130, '🍻', 1, 'meetup'),
  ('week_deep_convo', '{"en": "One Real Conversation", "es": "Una Conversacion Real"}',
                      '{"en": "Have one conversation that actually matters.", "es": "Ten una conversacion que de verdad importe."}',
                      'weekly', 'social', 'epic', 520, 160, '🗨️', 1, 'conversation'),
  ('week_no_ghost',   '{"en": "Inbox Zero, Human Edition", "es": "Responde a Todos"}',
                      '{"en": "Reply to everyone you have left hanging.", "es": "Responde a todos los que dejaste en visto."}',
                      'weekly', 'social', 'rare', 400, 120, '📬', 1, 'week'),

  ('week_course',     '{"en": "Finish a Module", "es": "Termina un Modulo"}',
                      '{"en": "Complete a full course module this week.", "es": "Completa un modulo entero de un curso."}',
                      'weekly', 'mind', 'epic', 540, 165, '🎓', 1, 'module'),
  ('week_150_pages',  '{"en": "150 Pages", "es": "150 Paginas"}',
                      '{"en": "Read 150 pages this week.", "es": "Lee 150 paginas esta semana."}',
                      'weekly', 'mind', 'rare', 450, 140, '📖', 150, 'pages'),
  ('week_teach',      '{"en": "Teach What You Learned", "es": "Ensena lo Aprendido"}',
                      '{"en": "Explain something you learned to someone else.", "es": "Explica a alguien algo que hayas aprendido."}',
                      'weekly', 'mind', 'legendary', 820, 250, '🧑‍🏫', 1, 'lesson'),

  ('week_ship',       '{"en": "Ship Something", "es": "Publica Algo"}',
                      '{"en": "Release something publicly, however small.", "es": "Publica algo, por pequeno que sea."}',
                      'weekly', 'creativity', 'legendary', 850, 260, '🚀', 1, 'release'),
  ('week_craft_10h',  '{"en": "10 Hours on Your Craft", "es": "10 Horas en tu Arte"}',
                      '{"en": "Ten hours of creative work this week.", "es": "Diez horas de trabajo creativo esta semana."}',
                      'weekly', 'creativity', 'epic', 560, 170, '⏳', 10, 'h'),
  ('week_new_medium', '{"en": "Try a New Medium", "es": "Prueba un Medio Nuevo"}',
                      '{"en": "Create in a format you have never tried.", "es": "Crea en un formato que nunca hayas probado."}',
                      'weekly', 'creativity', 'rare', 440, 135, '🎨', 1, 'attempt')
on conflict (code) do update set
  name = excluded.name, description = excluded.description, cadence = excluded.cadence,
  attribute = excluded.attribute, rarity = excluded.rarity, xp_reward = excluded.xp_reward,
  coins_reward = excluded.coins_reward, icon = excluded.icon,
  target_value = excluded.target_value, target_unit = excluded.target_unit;

-- ----------------------------------------------------------------------------
-- Achievements for the new attributes. Same criteria evaluator, no code change
-- — which is the point of storing criteria as jsonb.
-- ----------------------------------------------------------------------------
insert into public.achievements (code, name, description, rarity, icon, xp_reward, coins_reward, criteria) values
  ('connector',
   '{"en": "Connector", "es": "Conector"}',
   '{"en": "Earn 5000 XP in Social.", "es": "Gana 5000 XP en Social."}',
   'epic', '🤝', 600, 250, '{"type": "attribute_xp", "attribute": "social", "value": 5000}'),
  ('scholar',
   '{"en": "Scholar", "es": "Erudito"}',
   '{"en": "Earn 5000 XP in Mind.", "es": "Gana 5000 XP en Mente."}',
   'epic', '🧠', 600, 250, '{"type": "attribute_xp", "attribute": "mind", "value": 5000}'),
  ('creator',
   '{"en": "Creator", "es": "Creador"}',
   '{"en": "Earn 5000 XP in Creativity.", "es": "Gana 5000 XP en Creatividad."}',
   'epic', '🎨', 600, 250, '{"type": "attribute_xp", "attribute": "creativity", "value": 5000}')
on conflict (code) do update set
  name = excluded.name, description = excluded.description, rarity = excluded.rarity,
  icon = excluded.icon, xp_reward = excluded.xp_reward,
  coins_reward = excluded.coins_reward, criteria = excluded.criteria;
