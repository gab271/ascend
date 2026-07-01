import { createContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

// Exported so useAuth (hooks/useAuth.js) can access it without
// re-importing the whole module. Context objects are not React
// components, so this export does not trigger the Fast Refresh
// "incompatible exports" warning.
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(undefined); // undefined = still loading

  const loadProfile = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, onboarding_completed')
      .single();
    setProfile(data ?? null);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) await loadProfile();
      else setProfile(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) await loadProfile();
      else setProfile(null);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const loading = session === undefined || profile === undefined;

  return (
    <AuthContext.Provider value={{
      session,
      user:           session?.user ?? null,
      profile,
      loading,
      refreshProfile: loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
