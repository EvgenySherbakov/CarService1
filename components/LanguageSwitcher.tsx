import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const langs: { code: string; label: string; flag: string }[] = [
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
  { code: 'pt-BR', label: 'PT', flag: '🇧🇷' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <View style={styles.row}>
      {langs.map((l) => {
        const active = i18n.language === l.code;
        return (
          <Pressable
            key={l.code}
            onPress={() => i18n.changeLanguage(l.code)}
            style={[
              styles.btn,
              active && { backgroundColor: Palette.primary, borderColor: Palette.primary },
            ]}
          >
            <Text style={{ fontSize: 14 }}>{l.flag}</Text>
            <Text
              style={[
                Typography.small,
                { color: active ? Palette.white : Palette.textSecondary },
              ]}
            >
              {l.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.xxs },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
});
