import { neutralPalettes, neutralTheme } from '@astryxdesign/theme-neutral';

export type ThemeMode = 'light' | 'dark';

export { neutralPalettes, neutralTheme };

export const tokens = {
  light: {
    name: 'Light',
    bg: '#F6F4FF',
    surface: '#FFFFFF',
    surfaceAlt: '#EEEAFC',
    ink: '#14121F',
    muted: '#58546A',
    line: '#DCD7EE',
    primary: '#0F2A24',
    primaryHover: '#1A433A',
    primaryLight: '#E6E0FF',
    primaryBorder: '#6A4CFF',
    onPrimary: '#CFF5E3',
    accent: '#6A4CFF',
    accentText: '#4B2ED6',
    accentLight: '#E6E0FF',
    mint: '#0F2A24',
    mintBg: '#CFF5E3',
    forestGreen: '#0F2A24',
    danger: '#E1306C',
    dangerBg: '#FFE5EE',
  },
  dark: {
    name: 'Dark',
    bg: '#0E0C18',
    surface: '#181527',
    surfaceAlt: '#221E36',
    ink: '#F1EEFC',
    muted: '#9B96B2',
    line: '#2E2947',
    primary: '#CFF5E3',
    primaryHover: '#B6F36B',
    primaryLight: '#2B2450',
    primaryBorder: '#9A85FF',
    onPrimary: '#0F2A24',
    accent: '#9A85FF',
    accentText: '#C4B5FD',
    accentLight: '#2B2450',
    mint: '#CFF5E3',
    mintBg: '#173A30',
    forestGreen: '#0F2A24',
    danger: '#FF6B95',
    dangerBg: '#351523',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 36,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  thumb: 18,
  chip: 20,
  btn: 22,
  row: 24,
  card: 28,
  box: 30,
  nav: 30,
  pill: 999,
} as const;

export const springs = {
  standard: { mass: 1, stiffness: 280, damping: 28 },
  snappy: { mass: 1, stiffness: 400, damping: 32 },
} as const;

export const gradients = [
  ['#6A4CFF', '#2FD4A0'],
  ['#FF7A59', '#6A4CFF'],
  ['#0F2A24', '#2FD4A0'],
  ['#FFB347', '#E1306C'],
  ['#3A86FF', '#8338EC'],
  ['#06D6A0', '#0F2A24'],
] as const;
