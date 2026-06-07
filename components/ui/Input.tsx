import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: Spacing.xxs }}>
      {label && <Text style={[Typography.small, { color: Palette.textSecondary }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={Palette.textMuted}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          { borderColor: error ? Palette.danger : focused ? Palette.primary : Palette.border },
          style,
        ]}
      />
      {error && <Text style={[Typography.small, { color: Palette.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    color: Palette.text,
    fontSize: 16,
    minHeight: 48,
  },
});
