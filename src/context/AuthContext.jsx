import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Exported so useAuth (hooks/useAuth.js) can access it without
// re-importing the whole module. Context objects are not React
// components, so this export does not trigger the Fast Refresh
// "incompatible exports" warning.
export const AuthContext = createContext(null);

// If auth has not resolved by now, stop waiting and let the app render.
// A blank screen forever is the worst possible outcome; showing the login page
// or a "profile not found" message is recoverable.
const AUTH_TIMEOUT_MS = 8000;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still resolving
  const [profile, setProfile] = useState(undefined); // undefined = still resolving

  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }

    // Must ALWAYS settle profile to an object or null. While it is undefined
    // every guard renders nothing, so a silent failure here blanks the app.
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, onboarded_at')
        .eq('id', userId)
        .maybeSingle();

      if (error) console.error('[ASCEND] loadProfile failed:', error.message);

      // v2 stores onboarding as a nullable timestamp (onboarded_at) rather than
      // a boolean, so the moment it happened is recorded too. Mapped back to
      // the boolean OnboardingGuard expects.
      setProfile(
        data ? { ...data, onboarding_completed: data.onboarded_at != null } : null
      );
    } catch (err) {
      console.error('[ASCEND] loadProfile threw:', err);
      setProfile(null);
    }
  }, []);

  // ── 1. Track the session ONLY ───────────────────────────────────────────
  useEffect(() => {
    let alive = true;

    supabase.auth.getSession()
      .then(({ data: { session } }) => { if (alive) setSession(session ?? null); })
      .catch(err => {
        console.error('[ASCEND] getSession failed:', err);
        if (alive) setSession(null);
      });

    // ⚠️ This callback MUST stay synchronous.
    //
    // supabase-js holds an internal auth lock while running it. Awaiting any
    // other supabase call in here waits on that same lock and deadlocks — the
    // promise never settles, nothing throws, and the app hangs on a blank
    // screen with an empty console. Set state here; do the work in effect 2.
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, newSession) => {
        if (alive) setSession(newSession ?? null);
      });

    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  // ── 2. Load the profile in response to the session, outside the lock ─────
  useEffect(() => {
    if (session === undefined) return;          // still resolving
    if (!session) { setProfile(null); return; } // signed out
    loadProfile(session.user.id);
  }, [session, loadProfile]);

  // ── 3. Watchdog — loading must never be permanent ───────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      setSession(prev => {
        if (prev === undefined) {
          console.error(`[ASCEND] Session unresolved after ${AUTH_TIMEOUT_MS}ms — treating as signed out.`);
          return null;
        }
        return prev;
      });
      setProfile(prev => {
        if (prev === undefined) {
          console.error(`[ASCEND] Profile unresolved after ${AUTH_TIMEOUT_MS}ms — continuing without it.`);
          return null;
        }
        return prev;
      });
    }, AUTH_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, []);

  const refreshProfile = useCallback(
    () => loadProfile(session?.user?.id),
    [session, loadProfile]
  );

  const loading = session === undefined || profile === undefined;

  return (
    <AuthContext.Provider value={{
      session,
      user:    session?.user ?? null,
      profile,
      loading,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
