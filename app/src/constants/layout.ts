// Layout constants shared between the tab bar and the floating mini-player.
//
// The mini-player is rendered outside the tab navigator (it must stay visible
// on story screens pushed above the tabs), so it cannot ask React Navigation
// how tall the tab bar is. Both sides read these numbers instead, and the tab
// bar's height is pinned to them rather than left to the platform default.

import { Platform } from 'react-native';

/** Tab bar height, ABOVE the bottom safe-area inset. */
export const TAB_BAR_HEIGHT = Platform.select({ ios: 49, default: 56 }) as number;

/** Room a scrolling screen leaves at the bottom for the floating mini-player. */
export const MINI_PLAYER_SPACE = 96;
