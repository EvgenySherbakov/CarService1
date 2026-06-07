import { StyleSheet, Text, View } from 'react-native';
import { Palette, Spacing, Typography } from '@/constants/theme';

/** Page title block used at the top of every main screen. */
export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.h1, { color: Palette.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[Typography.caption, { color: Palette.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
});
