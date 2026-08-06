export const BrazilColors = {
  green: '#00A859',
  greenDark: '#00753E',
  greenLight: '#34C77B',
  greenMint: '#B6F2D3',
  yellow: '#FFD400',
  yellowDark: '#E6B800',
  yellowSoft: '#FFF1A8',
  blue: '#0B2D6E',
  blueLight: '#1D4FB3',
  coral: '#FF6B5C',
  white: '#FFFFFF',
} as const;

export const Palette = {
  primary: BrazilColors.green,
  primaryDark: BrazilColors.greenDark,
  primaryLight: BrazilColors.greenLight,
  primarySoft: BrazilColors.greenMint,
  accent: BrazilColors.yellow,
  accentDark: BrazilColors.yellowDark,
  accentSoft: BrazilColors.yellowSoft,
  secondary: BrazilColors.blue,
  secondaryLight: BrazilColors.blueLight,
  coral: BrazilColors.coral,
  background: '#FAFCF9',
  surface: '#F1F5F1',
  surfaceAlt: '#E7ECE6',
  card: '#FFFFFF',
  border: '#E0E6DE',
  text: '#0E1A2B',
  textSecondary: '#4A5567',
  textMuted: '#8A93A6',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#1D4FB3',
  overlay: 'rgba(11, 26, 32, 0.5)',
  black: '#0A0A0A',
  white: '#FFFFFF',
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
  lg: 18,
  xl: 28,
  pill: 999,
} as const;

export const Typography = {
  display: { fontSize: 40, fontWeight: '900' as const, letterSpacing: -1 },
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
    shadowColor: '#0B2D6E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#0B2D6E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0B2D6E',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.14,
    shadowRadius: 30,
    elevation: 10,
  },
} as const;

export const Gradients = {
  brazilFlag: ['#00A859', '#FFD400', '#0B2D6E'] as const,
  green: ['#00A859', '#00753E'] as const,
  yellow: ['#FFD400', '#FFB800'] as const,
  blue: ['#0B2D6E', '#1D4FB3'] as const,
  hero: ['#00A859', '#0B2D6E'] as const,
  sunset: ['#FFD400', '#FF6B5C'] as const,
  mint: ['#34C77B', '#00A859'] as const,
  carnival: ['#0B2D6E', '#00A859', '#FFD400'] as const,
} as const;
