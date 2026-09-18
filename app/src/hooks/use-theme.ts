// Resolve the active semantic color set. The scheme comes from ThemeProvider
// (the phone's setting, or the override chosen in Settings), so every screen
// re-renders together when it changes.

import type { ThemeColors } from '@/constants/theme';
import { useThemeContext, type ResolvedScheme } from '@/lib/theme-context';

export function useTheme(): ThemeColors {
  return useThemeContext().colors;
}

/** 'light' | 'dark' as currently shown — for the status bar and similar. */
export function useResolvedScheme(): ResolvedScheme {
  return useThemeContext().scheme;
}
