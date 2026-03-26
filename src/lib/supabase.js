import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[ASCEND] Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE is more secure than the implicit flow
    flowType:        'pkce',
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: true,
  },
  global: {
    headers: { 'x-app-name': 'ascend' },
  },
});
