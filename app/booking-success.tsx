import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { formatAmount } from '@/lib/currency';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function BookingSuccessScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    paid?: string;
    title?: string;
    amount?: string;
  }>();

  const isPaid = params.paid === '1';
  const amount = Number(params.amount ?? '0');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }}>
      <LinearGradient
        colors={[Palette.primary, Palette.secondary]}
        style={styles.hero}
      >
        <View style={styles.circle}>
          <Text style={{ fontSize: 56 }}>{isPaid ? '✅' : '📅'}</Text>
        </View>
        <Text style={[Typography.h1, { color: Palette.white, textAlign: 'center' }]}>
          {t('booking.successTitle')}
        </Text>
        <Text style={[Typography.body, styles.subtitle]}>
          {isPaid ? t('booking.successSubtitlePaid') : t('booking.successSubtitleOffice')}
        </Text>
      </LinearGradient>

      <View style={styles.body}>
        {params.title ? (
          <View style={styles.summary}>
            <Text style={[Typography.small, { color: Palette.textSecondary }]}>
              {t('services.service')}
            </Text>
            <Text style={[Typography.h4]} numberOfLines={2}>
              {params.title}
            </Text>
            {amount > 0 && (
              <Text style={[Typography.bodyBold, { color: Palette.primary, marginTop: Spacing.xs }]}>
                {isPaid ? '' : `${t('booking.payAtOffice')}: `}
                {formatAmount(amount)}
              </Text>
            )}
          </View>
        ) : null}

        {!isPaid && (
          <Text style={[Typography.caption, styles.callNote]}>
            {t('booking.successCallNote')}
          </Text>
        )}

        <View style={{ height: Spacing.md }} />

        <Button
          title={t('booking.viewBookings')}
          variant="primary"
          fullWidth
          onPress={() => router.replace('/bookings')}
        />
        <View style={{ height: Spacing.xs }} />
        <Button
          title={t('booking.backToHome')}
          variant="ghost"
          fullWidth
          onPress={() => router.replace('/')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  body: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  summary: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  callNote: {
    color: Palette.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
});
