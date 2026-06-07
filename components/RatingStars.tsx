import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette, Spacing } from '@/constants/theme';

type Props = {
  value: number;
  outOf?: number;
  size?: number;
  onChange?: (v: number) => void;
  showValue?: boolean;
};

export function RatingStars({ value, outOf = 5, size = 16, onChange, showValue }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: outOf }).map((_, i) => {
        const idx = i + 1;
        const filled = idx <= Math.round(value);
        return (
          <Pressable key={i} disabled={!onChange} onPress={() => onChange?.(idx)} hitSlop={6}>
            <Text style={{ fontSize: size, color: filled ? '#F59E0B' : Palette.border }}>
              {filled ? '★' : '☆'}
            </Text>
          </Pressable>
        );
      })}
      {showValue && (
        <Text style={{ marginLeft: Spacing.xxs, color: Palette.textSecondary, fontSize: 13 }}>
          {value.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
