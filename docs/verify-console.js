// ============================================================================
// Ascend — end-to-end verification
// ============================================================================
// HOW TO RUN
//   1. Start the app (npm run dev) and SIGN IN.
//   2. Open DevTools -> Console.
//   3. Paste this whole file and press Enter.
//
// It checks the happy path AND tries to cheat. The cheat attempts are the
// important half: they must all FAIL. Testing with the service role would hide
// exactly the bugs that matter, which is why this runs as a real signed-in user.
//
// Safe to re-run. It completes one mission then undoes it via
// uncomplete_mission(), so your XP and streak end where they started —
// which also exercises the append-only correction path.
// ============================================================================

(async () => {
  const URL = window.location.origin.includes('localhost')
    ? 'https://lahqwiicipdgwhlkngtu.supabase.co'
    : 'https://lahqwiicipdgwhlkngtu.supabase.co';

  // Pull the session that supabase-js stored at login.
  const key = Object.keys(localStorage).find(k => /^sb-.*-auth-token$/.test(k));
  if (!key) return console.error('❌ No Supabase session found. Are you signed in?');

  let token;
  try {
    const raw = JSON.parse(localStorage.getItem(key));
    token = raw.access_token ?? raw?.currentSession?.access_token;
  } catch { /* fall through */ }
  if (!token) return console.error('❌ Could not read access_token from', key);

  // The access token is a valid project JWT, so it works as the apikey too —
  // no need to paste the anon key.
  const H = { apikey: token, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const rpc = async (fn, body = {}) => {
    const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(body) });
    return { status: r.status, data: await r.json().catch(() => null) };
  };
  const rest = async (path, opts = {}) => {
    const r = await fetch(`${URL}/rest/v1/${path}`, { headers: H, ...opts });
    return { status: r.status, data: await r.json().catch(() => null) };
  };

  const results = [];
  const check = (name, pass, detail = '') => {
    results.push({ name, pass, detail });
    console.log(`${pass ? '%c✅ PASS' : '%c❌ FAIL'} %c${name}`,
      `color:${pass ? '#33e6a1' : '#ff4d6a'};font-weight:700`, 'color:inherit', detail);
  };

  console.log('%c── Ascend verification ──', 'font-weight:700;font-size:14px');

  // ── 1. Profile ────────────────────────────────────────────────
  const prof = await rpc('get_my_profile');
  const p0 = prof.data;
  check('get_my_profile returns a profile', !!p0?.username,
    p0 ? `${p0.username} · lvl ${p0.level} · ${p0.total_xp} XP · ${p0.coins} coins · streak ${p0.streak} · tier ${p0.tier?.code ?? '—'}` : prof.data);
  check('timezone was captured at signup', !!p0?.timezone, p0?.timezone);
  check('level curve is seeded (xp_next > 0)', (p0?.xp_next ?? 0) > 0, `xp_next=${p0?.xp_next}`);

  // ── 2. Missions ───────────────────────────────────────────────
  await rpc('ensure_daily_missions');
  await rpc('ensure_weekly_missions');
  const miss = await rpc('get_missions');
  const daily = miss.data?.daily ?? [];
  const weekly = miss.data?.weekly ?? [];
  check('daily missions assigned', daily.length > 0, `${daily.length} daily, ${weekly.length} weekly`);
  check('server derives local_date (client never does)', !!miss.data?.local_date,
    `local_date=${miss.data?.local_date} week_start=${miss.data?.week_start}`);
  check('missions are localised + have emoji icons',
    typeof daily[0]?.name === 'string' && !!daily[0]?.icon,
    daily[0] ? `${daily[0].icon} ${daily[0].name} (+${daily[0].xp} XP)` : '');

  // Idempotency: calling ensure again must not add more
  await rpc('ensure_daily_missions');
  const miss2 = await rpc('get_missions');
  check('ensure_daily_missions is idempotent',
    (miss2.data?.daily ?? []).length === daily.length,
    `still ${(miss2.data?.daily ?? []).length}`);

  // ── 3. Complete a mission ─────────────────────────────────────
  const target = daily.find(m => !m.completed);
  let completed = null;
  if (!target) {
    check('a mission was available to complete', false, 'all already completed — undo one and re-run');
  } else {
    const done = await rpc('complete_mission', { p_assignment_id: target.assignment_id });
    completed = done.data;
    check('complete_mission succeeded', done.data?.success === true,
      done.data?.success
        ? `+${done.data.xp_awarded} XP, +${done.data.coins_awarded} coins, streak bonus ${done.data.streak_bonus}, streak ${done.data.streak}`
        : JSON.stringify(done.data));

    const p1 = (await rpc('get_my_profile')).data;
    const gained = (p1?.total_xp ?? 0) - (p0?.total_xp ?? 0);
    const expected = (completed?.xp_awarded ?? 0) + (completed?.streak_bonus ?? 0);
    check('XP ledger and cache agree', gained === expected, `gained ${gained}, expected ${expected}`);
    check('coins increased', (p1?.coins ?? 0) > (p0?.coins ?? 0), `${p0?.coins} → ${p1?.coins}`);

    // Double-complete must be refused
    const again = await rpc('complete_mission', { p_assignment_id: target.assignment_id });
    check('double-complete is refused', again.data?.success === false,
      `reason: ${again.data?.reason}`);
  }

  // ── 4. Derived data ───────────────────────────────────────────
  const week = await rpc('get_weekly_xp');
  check('get_weekly_xp returns exactly 7 days', (week.data ?? []).length === 7,
    (week.data ?? []).map(d => d.xp_earned).join(', '));

  const board = await rpc('get_leaderboard', { p_limit: 10, p_offset: 0 });
  check('leaderboard includes me', (board.data ?? []).some(r => r.is_me),
    `${(board.data ?? []).length} players`);

  const myRank = await rpc('get_my_rank');
  check('get_my_rank works', myRank.data?.rank != null,
    `rank ${myRank.data?.rank} of ${myRank.data?.total_players}`);

  const cat = await rpc('get_rewards_catalog');
  check('rewards catalog loads', (cat.data?.items ?? []).length > 0,
    `${(cat.data?.items ?? []).length} items, ${(cat.data?.achievements ?? []).length} achievements`);
  check('starter cosmetics were granted',
    (cat.data?.items ?? []).some(i => i.owned),
    (cat.data?.items ?? []).filter(i => i.owned).map(i => i.code).join(', ') || 'none');

  const shopEnsure = await rpc('ensure_shop_rotation');
  const shop = await rpc('get_shop_rotation');
  check('shop rotation populated', (shop.data ?? []).length > 0,
    `${(shop.data ?? []).length} items today`);

  // ── 5. SECURITY — every one of these MUST fail ────────────────
  console.log('%c── cheat attempts (all must FAIL) ──', 'font-weight:700');

  const hack1 = await rest('ledger_events', {
    method: 'POST',
    body: JSON.stringify({ user_id: p0?.id, kind: 'admin_grant', xp_delta: 999999, coins_delta: 999999, local_date: '2026-07-20', idempotency_key: 'hack-' + Date.now() }),
  });
  check('cannot INSERT into ledger_events', hack1.status >= 400,
    `status ${hack1.status} — ${hack1.data?.message ?? ''}`);

  const hack2 = await rest(`user_stats?user_id=eq.${p0?.id}`, {
    method: 'PATCH', body: JSON.stringify({ coins: 999999 }),
  });
  check('cannot UPDATE user_stats', hack2.status >= 400,
    `status ${hack2.status} — ${hack2.data?.message ?? ''}`);

  const hack3 = await rest('ledger_events?id=gt.0', {
    method: 'PATCH', body: JSON.stringify({ xp_delta: 999999 }),
  });
  check('cannot UPDATE ledger history', hack3.status >= 400,
    `status ${hack3.status} — ${hack3.data?.message ?? ''}`);

  const hack4 = await rest('ledger_events?id=gt.0', { method: 'DELETE' });
  check('cannot DELETE ledger history', hack4.status >= 400,
    `status ${hack4.status} — ${hack4.data?.message ?? ''}`);

  const hack5 = await rpc('write_ledger', { p_user_id: p0?.id, p_kind: 'admin_grant', p_xp: 999999, p_coins: 0, p_attribute: null, p_idempotency_key: 'hack2' });
  check('cannot call private.write_ledger', hack5.status >= 400,
    `status ${hack5.status} — ${hack5.data?.message ?? ''}`);

  const others = await rest('profiles?select=id,username');
  check('can only see my own profile row',
    Array.isArray(others.data) && others.data.length <= 1,
    `${Array.isArray(others.data) ? others.data.length : '?'} row(s) visible`);

  const mine = await rest('ledger_events?select=id,xp_delta&limit=5');
  check('CAN read my own ledger', mine.status === 200,
    `${Array.isArray(mine.data) ? mine.data.length : 0} events`);

  // ── 6. Restore state ──────────────────────────────────────────
  if (target && completed?.success) {
    const undo = await rpc('uncomplete_mission', { p_assignment_id: target.assignment_id });
    const p2 = (await rpc('get_my_profile')).data;
    check('uncomplete_mission restores XP via compensating rows',
      undo.data?.success === true && p2?.total_xp === p0?.total_xp,
      `total_xp back to ${p2?.total_xp} (was ${p0?.total_xp})`);

    const led = await rest('ledger_events?select=id,kind,xp_delta&order=id.desc&limit=4');
    check('history preserved (corrections appended, not deleted)',
      Array.isArray(led.data) && led.data.some(e => e.kind === 'correction'),
      (led.data ?? []).map(e => `${e.kind}:${e.xp_delta}`).join(' | '));
  }

  // ── Summary ───────────────────────────────────────────────────
  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass);
  console.log(`%c\n${passed}/${results.length} checks passed`,
    `font-weight:700;font-size:14px;color:${failed.length ? '#ff4d6a' : '#33e6a1'}`);
  if (failed.length) console.table(failed.map(f => ({ check: f.name, detail: f.detail })));
  else console.log('%c🎉 Everything works — happy path AND the economy is unforgeable.', 'color:#33e6a1');
})();
