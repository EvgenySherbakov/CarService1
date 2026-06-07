import { Pressable, StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import { Palette, Radius, Shadow, Spacing } from '@/constants/theme';

type Props = ViewProps & {
  onPress?: () => void;
  padded?: boolean;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
};

export function Card({
  children,
  onPress,
  padded = true,
  style,
  variant = 'default',
  ...rest
}: Props) {
  const shadow =
    variant === 'elevated' ? Shadow.md : variant === 'flat' ? null : Shadow.sm;

  const inner = (
    <View
      style={[
        styles.card,
        padded && { padding: Spacing.md },
        shadow,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
        {inner}
      </Pressable>
    );
  }

  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.border,
  },
});
