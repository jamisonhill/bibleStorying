// Resolve the active semantic color set from the system light/dark setting.

import { useColorScheme } from 'react-native';
import { Colors, type ThemeColors } from '@/constants/theme';

export function useTheme(): ThemeColors {
  const scheme = useColorScheme();
  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
