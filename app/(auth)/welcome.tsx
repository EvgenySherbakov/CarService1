import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { signInWithProvider } from '@/lib/auth';
import { useAuthStore } from '@/store/auth';

export default function Welcome() {
  const { t } = useTranslation();
  const setProfile = useAuthStore((s) => s.setProfile);
  const [loading, setLoading] = useState<'google' | 'apple' | null>(null);

  const handleSignIn = async (provider: 'google' | 'apple') => {
    setLoading(provider);
    const res = await signInWithProvider(provider);
    setLoading(null);
    if ('profile' in res) setProfile(res.profile);
  };

  return (
    <LinearGradient
      colors={[Palette.primary, '#1A8F49', Palette.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.topRow}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🦆</Text>
          </View>
          <LanguageSwitcher />
        </View>

        <View style={styles.hero}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=900',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={[Typography.h1, { color: Palette.white }]}>{t('brand.name')}</Text>
            <Text style={[Typography.body, { color: 'rgba(255,255,255,0.9)' }]}>
              {t('brand.tagline')}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={[Typography.h2, { color: Palette.white, textAlign: 'center' }]}>
            {t('auth.welcomeTitle')}
          </Text>
          <Text
            style={[
              Typography.body,
              { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginBottom: Spacing.lg },
            ]}
          >
            {t('auth.welcomeSubtitle')}
          </Text>

          <Button
            title={t('auth.signInWithGoogle')}
            variant="accent"
            loading={loading === 'google'}
            onPress={() => handleSignIn('google')}
            fullWidth
            icon={<Text style={{ fontSize: 18 }}>G</Text>}
          />
          <View style={{ height: Spacing.sm }} />
          <Button
            title={t('auth.signInWithApple')}
            variant="primary"
            loading={loading === 'apple'}
            onPress={() => handleSignIn('apple')}
            fullWidth
            style={{ backgroundColor: '#000', borderColor: '#000' }}
            icon={<Text style={{ fontSize: 18, color: '#fff' }}></Text>}
          />

          <Text
            style={[
              Typography.small,
              { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: Spacing.md },
            ]}
          >
            {t('auth.terms')}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg, justifyContent: 'space-between' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 30 },
  hero: { marginVertical: Spacing.lg, borderRadius: 24, overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: 240 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,39,118,0.35)',
  },
  heroContent: { position: 'absolute', left: Spacing.lg, bottom: Spacing.lg },
  bottom: { gap: Spacing.xs },
});
