import { Platform, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Palette, Spacing, Typography } from '@/constants/theme';

const PHONE_MAX_WIDTH = 440;
const PHONE_MAX_HEIGHT = 900;
const DESKTOP_BREAKPOINT = 900;
const SIDEBAR_BREAKPOINT = 1200;

export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;
  const showSidebar = Platform.OS === 'web' && width >= SIDEBAR_BREAKPOINT;
  const { t } = useTranslation();

  if (!isDesktop) {
    return <>{children}</>;
  }

  const frameHeight = Math.min(height - 40, PHONE_MAX_HEIGHT);

  return (
    <LinearGradient
      colors={[Palette.secondary, Palette.primaryDark, Palette.primary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.backdrop}
    >
      {showSidebar && (
        <View style={styles.sidebar}>
          <View style={styles.logoBadge}>
            <Text style={{ fontSize: 38 }}>🦆</Text>
          </View>
          <Text style={[Typography.h1, { color: '#fff' }]}>{t('brand.name')}</Text>
          <Text style={[Typography.body, { color: 'rgba(255,255,255,0.85)', maxWidth: 320 }]}>
            {t('brand.tagline')}
          </Text>
          <View style={styles.divider} />
          <Feature icon="🔧" label={t('home.bookRepair')} />
          <Feature icon="💧" label={t('home.bookWash')} />
          <Feature icon="🚗" label={t('home.rentCar')} />
        </View>
      )}

      <View
        style={[
          styles.frame,
          { height: frameHeight, maxHeight: frameHeight },
        ]}
      >
        <View style={styles.frameInner}>{children}</View>
      </View>
    </LinearGradient>
  );
}

const Feature = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.feature}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={{ color: '#fff', fontSize: 16 }}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
    padding: Spacing.lg,
  },
  sidebar: { gap: Spacing.md, maxWidth: 360 },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  feature: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  frame: {
    width: '100%',
    maxWidth: PHONE_MAX_WIDTH,
    borderRadius: 36,
    backgroundColor: Palette.background,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.45,
    shadowRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  frameInner: { flex: 1, backgroundColor: Palette.background },
});
