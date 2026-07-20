// ─── Shared helpers for the API layer ─────────────────────────
// The database stores user-facing text as jsonb {"en": ..., "es": ...} so a
// single row serves both locales. These helpers unwrap it for the UI.

const STORAGE_KEY = 'ascend_lang';   // written by LanguageContext

export function currentLang() {
  try {
    return localStorage.getItem(STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

// Resolve a jsonb translation object to a plain string.
// Accepts a plain string too, so callers never have to special-case.
export function loc(value, lang = currentLang()) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return value[lang] ?? value.en ?? value.es ?? '';
}

// Most RPCs return jsonb like { success: false, reason: 'insufficient_coins' }
// for *expected* failures — those come back with no Postgres error, so a caller
// checking only `error` would treat them as success. This converts them into a
// real error object so every call site can keep using `if (error)`.
export function unwrap(data, error) {
  if (error) return { data: null, error };
  if (data && typeof data === 'object' && data.success === false) {
    return {
      data: null,
      error: { message: data.reason ?? 'unknown_error', hint: data.reason, details: data },
    };
  }
  return { data, error: null };
}
