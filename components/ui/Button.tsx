import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'accent';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  textColor?: string;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  icon,
  fullWidth,
  textColor,
}: Props) {
  const isDisabled = disabled || loading;
  const sizing = sizes[size];

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={isDisabled}
        style={[
          fullWidth && { width: '100%' },
          { opacity: isDisabled ? 0.6 : 1 },
          style,
        ]}
      >
        <LinearGradient
          colors={[Palette.primary, Palette.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, sizing, Shadow.md]}
        >
          <Content
            title={title}
            loading={loading}
            icon={icon}
            color={textColor ?? Palette.white}
          />
        </LinearGradient>
      </Pressable>
    );
  }

  const tokens = variants[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        sizing,
        {
          backgroundColor: tokens.bg,
          borderColor: tokens.border,
          borderWidth: tokens.border === 'transparent' ? 0 : 1.5,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
        },
        fullWidth && { width: '100%' },
        variant === 'primary' ? Shadow.sm : null,
        style,
      ]}
    >
      <Content title={title} loading={loading} icon={icon} color={textColor ?? tokens.fg} />
    </Pressable>
  );
}

const Content = ({
  title,
  loading,
  icon,
  color,
}: {
  title: string;
  loading?: boolean;
  icon?: React.ReactNode;
  color: string;
}) =>
  loading ? (
    <ActivityIndicator color={color} />
  ) : (
    <>
      {icon}
      <Text style={[Typography.bodyBold, { color }]}>{title}</Text>
    </>
  );

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.lg,
  },
});

const sizes: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, minHeight: 36 },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, minHeight: 48 },
  lg: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, minHeight: 56 },
};

const variants: Record<string, { bg: string; fg: string; border: string }> = {
  primary: { bg: Palette.primary, fg: Palette.white, border: 'transparent' },
  secondary: { bg: Palette.secondary, fg: Palette.white, border: 'transparent' },
  accent: { bg: Palette.accent, fg: Palette.text, border: 'transparent' },
  outline: { bg: 'transparent', fg: Palette.primary, border: Palette.primary },
  ghost: { bg: 'transparent', fg: Palette.text, border: 'transparent' },
  gradient: { bg: 'transparent', fg: Palette.white, border: 'transparent' },
};
