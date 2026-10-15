import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

// Nothing to subscribe to: hydration happens once and never changes back.
const subscribeNoop = () => () => {};

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web.
 * useSyncExternalStore reports `false` during the server render and `true` on the client,
 * so the first client render matches the static HTML (light) and then follows the system.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(subscribeNoop, () => true, () => false);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
