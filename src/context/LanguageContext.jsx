import { createContext, useContext, useState } from 'react';
import en from '../i18n/en';
import es from '../i18n/es';

const TRANSLATIONS = { en, es };
const STORAGE_KEY = 'ascend_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );

  const setLang = (l) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  // t(key) — dot-path lookup, e.g. t('dashboard.loading')
  // Returns the value or the key itself as fallback
  function t(key) {
    const keys = key.split('.');
    let val = TRANSLATIONS[lang];
    for (const k of keys) {
      if (val == null) return key;
      val = val[k];
    }
    return val ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translations: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
