// App theme: brand colors from biblestoryingkenya.com (terracotta #EF8354,
// slate navy #2D3142) mapped onto semantic light/dark roles. Components use
// these roles — never raw hex — so dark mode works everywhere.

import { Platform } from 'react-native';

export const brand = {
  terracotta: '#EF8354',
  terracottaDeep: '#E06A38',
  slate: '#2D3142',
  slateLight: '#4F5D75',
  mist: '#BFC0C0',
};

export type ThemeColors = {
  background: string;
  surface: string;        // cards, grouped rows
  surfaceAlt: string;     // pressed/nested surfaces
  text: string;
  textSecondary: string;
  textOnAccent: string;
  accent: string;         // ONE accent, reserved for the primary action
  separator: string;
  danger: string;
  success: string;
  tabBar: string;
};

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceAlt: '#F1EEE9',
    text: '#26293A',
    textSecondary: '#6B7080',
    textOnAccent: '#FFFFFF',
    accent: brand.terracottaDeep,
    separator: '#E5E1DA',
    danger: '#C0392B',
    success: '#2E7D4F',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#191B26',
    surface: '#242736',
    surfaceAlt: '#2E3245',
    text: '#F2F0EC',
    textSecondary: '#A6AAB8',
    textOnAccent: '#FFFFFF',
    accent: brand.terracotta,
    separator: '#343849',
    danger: '#E57368',
    success: '#5DBB84',
    tabBar: '#242736',
  },
};

/** Serif for story text (reads like a printed storybook); system elsewhere. */
export const storyFont = Platform.select({ ios: 'Georgia', default: 'serif' });

export const radius = { card: 14, control: 10, pill: 999 };
