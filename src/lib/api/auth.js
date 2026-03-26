import { supabase } from '../supabase';

// ─── Sign up ──────────────────────────────────────────────────
// username se guarda en raw_user_meta_data y el trigger lo pone en profiles.
export async function signUp({ email, password, username }) {
  // Client-side validation (defence in depth — server also validates)
  const clean = username.trim().toUpperCase();
  if (!/^[A-Z0-9_]{3,20}$/.test(clean)) {
    return {
      data: null,
      error: { message: 'El username solo puede contener letras, números y _, entre 3 y 20 caracteres.' },
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email:    email.trim().toLowerCase(),
    password,
    options: {
      data:             { username: clean },
      emailRedirectTo:  `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

// ─── Sign in ──────────────────────────────────────────────────
export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    email.trim().toLowerCase(),
    password,
  });
  return { data, error };
}

// ─── Sign out ─────────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// ─── Request password reset email ────────────────────────────
export async function sendPasswordResetEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: `${window.location.origin}/auth/reset-password` }
  );
  return { error };
}

// ─── Set new password (after clicking the email link) ────────
export async function updatePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

// ─── Get current session ─────────────────────────────────────
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

// ─── Get current user ────────────────────────────────────────
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

// ─── Subscribe to auth state changes ─────────────────────────
// Returns an unsubscribe function — call it in useEffect cleanup.
export function onAuthStateChange(callback) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return () => subscription.unsubscribe();
}
