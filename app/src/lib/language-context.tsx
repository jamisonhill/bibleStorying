// The user's chosen story language, shared app-wide and persisted.
// Users often study in one language and tell in another, so screens also
// offer in-place switching; this is just the default.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { getMeta, setMeta } from './db';
import type { LangCode } from './types';

interface LanguageContextValue {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(() => {
    const saved = getMeta('language');
    return saved === 'en' || saved === 'sw' || saved === 'ma' || saved === 'br' ? saved : 'en';
  });

  const setLang = useCallback((next: LangCode) => {
    setLangState(next);
    setMeta('language', next);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
