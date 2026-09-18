// The app's colour scheme. By default it follows the phone's light/dark
// setting; Settings can pin it to one or the other. The choice is persisted
// in the SQLite `meta` table like every other preference, and read
// synchronously at start-up so there is no flash of the wrong theme.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '@/constants/theme';
import { getMeta, setMeta } from './db';

/** What the user asked for; `system` means follow the phone. */
export type ThemePreference = 'system' | 'light' | 'dark';
/** What is actually on screen right now. */
export type ResolvedScheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
  scheme: ResolvedScheme;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** meta key; values are the ThemePreference strings. Missing = system. */
const META_KEY = 'colorScheme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    const saved = getMeta(META_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  });

  // React Native re-renders this when the phone's setting changes, which is
  // exactly what "system" should track.
  const systemScheme = useColorScheme();
  const scheme: ResolvedScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    setMeta(META_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, setPreference, scheme, colors: Colors[scheme] }),
    [preference, setPreference, scheme],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used inside ThemeProvider');
  return ctx;
}
