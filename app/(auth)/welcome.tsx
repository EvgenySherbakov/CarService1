import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
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
    <View style={styles.root}>
      <LinearGradient
        colors={[Palette.primary, Palette.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.blob, styles.blobYellow]} />
      <View style={[styles.blob, styles.blobBlue]} />

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
          <LinearGradient
            colors={['rgba(11,45,110,0)', 'rgba(11,45,110,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>★ AutoDuck Premium</Text>
            </View>
            <Text style={[Typography.display, styles.heroBrand]}>
              {t('brand.name')}
            </Text>
            <Text style={[Typography.body, styles.heroTagline]}>
              {t('brand.tagline')}
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <Text style={[Typography.h2, styles.welcomeTitle]}>
            {t('auth.welcomeTitle')}
          </Text>
          <Text style={[Typography.body, styles.welcomeSubtitle]}>
            {t('auth.welcomeSubtitle')}
          </Text>

          <View style={styles.buttons}>
            <Button
              title={t('auth.signInWithGoogle')}
              variant="accent"
              loading={loading === 'google'}
              onPress={() => handleSignIn('google')}
              fullWidth
              size="lg"
              icon={<GoogleIcon />}
            />
            <Button
              title={t('auth.signInWithApple')}
              loading={loading === 'apple'}
              onPress={() => handleSignIn('apple')}
              fullWidth
              size="lg"
              style={styles.appleButton}
              textColor={Palette.white}
              icon={<AppleIcon />}
            />
          </View>

          <Text style={styles.terms}>{t('auth.terms')}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const GoogleIcon = () => (
  <View style={styles.iconBubble}>
    <Text style={styles.googleG}>G</Text>
  </View>
);

const AppleIcon = () => (
  <View style={[styles.iconBubble, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
    <Text style={{ fontSize: 18 }}>🍏</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.primary, overflow: 'hidden' },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.5,
  },
  blobYellow: {
    width: 320,
    height: 320,
    top: -120,
    right: -80,
    backgroundColor: Palette.accent,
  },
  blobBlue: {
    width: 360,
    height: 360,
    bottom: -160,
    left: -120,
    backgroundColor: Palette.secondary,
    opacity: 0.6,
  },
  container: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  logoEmoji: { fontSize: 28 },
  hero: {
    marginVertical: Spacing.md,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.lg,
  },
  heroImage: { width: '100%', height: 240, backgroundColor: Palette.secondary },
  heroContent: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: Spacing.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,212,0,0.95)',
    marginBottom: Spacing.xs,
  },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: Palette.secondary },
  heroBrand: {
    color: Palette.white,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroTagline: {
    color: 'rgba(255,255,255,0.95)',
    marginTop: 2,
  },
  bottom: { gap: Spacing.xs },
  welcomeTitle: {
    color: Palette.white,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  buttons: { gap: Spacing.sm },
  appleButton: {
    backgroundColor: Palette.black,
    borderColor: Palette.black,
    ...Platform.select({
      web: { boxShadow: '0 10px 30px rgba(0,0,0,0.35)' } as object,
      default: Shadow.md,
    }),
  },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  googleG: {
    fontSize: 16,
    fontWeight: '900',
    color: Palette.text,
  },
  terms: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    lineHeight: 18,
  },
});
