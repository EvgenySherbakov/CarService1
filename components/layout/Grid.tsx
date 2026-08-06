import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';

/**
 * Responsive wrapping grid. Uses padding (not gap+%) so column widths
 * stay exact across web and native.
 */
export function Grid<T>({
  data,
  columns,
  keyExtractor,
  renderItem,
  gap = Spacing.md,
}: {
  data: T[];
  columns: number;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T) => React.ReactNode;
  gap?: number;
}) {
  return (
    <View style={[styles.row, { marginHorizontal: -gap / 2 }]}>
      {data.map((item, i) => (
        <View
          key={keyExtractor(item, i)}
          style={{ width: `${100 / columns}%`, padding: gap / 2 }}
        >
          {renderItem(item)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
});
