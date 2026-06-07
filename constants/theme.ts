export const BrazilColors = {
  green: '#009C3B',
  greenDark: '#007A2D',
  greenLight: '#33B05E',
  yellow: '#FFDF00',
  yellowDark: '#E6C800',
  blue: '#002776',
  blueLight: '#1A3D8F',
  white: '#FFFFFF',
} as const;

export const Palette = {
  primary: BrazilColors.green,
  primaryDark: BrazilColors.greenDark,
  primaryLight: BrazilColors.greenLight,
  accent: BrazilColors.yellow,
  accentDark: BrazilColors.yellowDark,
  secondary: BrazilColors.blue,
  secondaryLight: BrazilColors.blueLight,
  background: '#FFFFFF',
  surface: '#F5F7FA',
  surfaceAlt: '#EEF1F6',
  card: '#FFFFFF',
  border: '#E1E6EE',
  text: '#0B1220',
  textSecondary: '#5A6478',
  textMuted: '#8A93A6',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
  overlay: 'rgba(11, 18, 32, 0.5)',
} as const;

export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '700' as const },
  h4: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodyBold: { fontSize: 16, fontWeight: '600' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
  small: { fontSize: 12, fontWeight: '500' as const },
} as const;

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const Gradients = {
  brazilFlag: ['#009C3B', '#FFDF00', '#002776'] as const,
  green: ['#009C3B', '#007A2D'] as const,
  yellow: ['#FFDF00', '#E6C800'] as const,
  blue: ['#002776', '#1A3D8F'] as const,
  hero: ['#009C3B', '#1A3D8F'] as const,
} as const;
