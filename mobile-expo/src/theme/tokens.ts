import { neutralPalettes, neutralTheme } from '@astryxdesign/theme-neutral';

export type ThemeMode = 'light' | 'dark';

export { neutralPalettes, neutralTheme };

export const fonts = {
  regular: 'ReadexPro_400Regular',
  medium: 'ReadexPro_500Medium',
  semibold: 'ReadexPro_600SemiBold',
  bold: 'ReadexPro_700Bold',
} as const;

export const tokens = {
  light: {
    name: 'Light',
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceAlt: '#F1ECE4',
    ink: '#0F172A',
    muted: '#475569',
    line: '#E2DDD5',
    primary: '#0F172A',
    primaryHover: '#1E293B',
    primaryLight: '#FFF1E6',
    primaryBorder: '#C2410C',
    onPrimary: '#FFFFFF',
    accent: '#C2410C',
    accentText: '#9A3412',
    accentLight: '#FFF1E6',
    mint: '#9A3412',
    mintBg: '#FFF1E6',
    forestGreen: '#0F172A',
    danger: '#DC2626',
    dangerBg: '#FEE2E2',
  },
  dark: {
    name: 'Dark',
    bg: '#0B0F19',
    surface: '#131B2E',
    surfaceAlt: '#1E293B',
    ink: '#F8FAFC',
    muted: '#94A3B8',
    line: '#26334D',
    primary: '#FB923C',
    primaryHover: '#FDBA74',
    primaryLight: '#2A1C17',
    primaryBorder: '#FB923C',
    onPrimary: '#0B0F19',
    accent: '#FB923C',
    accentText: '#FDBA74',
    accentLight: '#2A1C17',
    mint: '#FDBA74',
    mintBg: '#2A1C17',
    forestGreen: '#0B0F19',
    danger: '#F87171',
    dangerBg: '#3B1219',
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
  ['#C2410C', '#EA580C'],
  ['#0F172A', '#1E3A8A'],
  ['#9A3412', '#D97706'],
  ['#1E293B', '#0369A1'],
  ['#0F172A', '#059669'],
  ['#7C2D12', '#B45309'],
] as const;
