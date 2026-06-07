import { StyleSheet, Text, View } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral' | 'brand';

const tones: Record<Tone, { bg: string; fg: string }> = {
  success: { bg: '#DCFCE7', fg: '#15803D' },
  warning: { bg: '#FEF3C7', fg: '#B45309' },
  info: { bg: '#E0F2FE', fg: '#075985' },
  danger: { bg: '#FEE2E2', fg: '#B91C1C' },
  neutral: { bg: Palette.surfaceAlt, fg: Palette.textSecondary },
  brand: { bg: '#DCFCE7', fg: Palette.primary },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: Tone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[Typography.small, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
});
