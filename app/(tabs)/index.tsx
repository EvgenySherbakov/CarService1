import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Grid } from '@/components/layout/Grid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ServiceCard } from '@/components/ServiceCard';
import { CarCard } from '@/components/CarCard';
import { SectionHeader } from '@/components/SectionHeader';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuthStore } from '@/store/auth';
import { useBookingStore } from '@/store/booking';
import { mockRentalCars, mockServices, mockVehicles } from '@/lib/mock-data';
import { formatAmount } from '@/lib/stripe';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

const quickActions = [
  { key: 'bookRepair', icon: '🔧', tint: Palette.primary, route: '/services?type=repair' },
  { key: 'bookWash', icon: '💧', tint: Palette.info, route: '/services?type=wash' },
  { key: 'rentCar', icon: '🚗', tint: Palette.accentDark, route: '/rentals' },
] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const profile = useAuthStore((s) => s.profile);
  const bookings = useBookingStore((s) => s.bookings);

  const cols = isDesktop ? 3 : 1;
  const featuredServices = mockServices.slice(0, 3);
  const availableCars = mockRentalCars.filter((c) => c.available).slice(0, 3);
  const upcoming = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending',
  );

  return (
    <Page>
      <PageHeader
        title={t('home.greeting', {
          name: profile?.fullName?.split(' ')[0] ?? t('home.guest'),
        })}
        subtitle={t('brand.tagline')}
        right={
          <View style={styles.avatar}>
            <Text style={{ fontSize: 18 }}>
              {profile?.fullName?.[0]?.toUpperCase() ?? '🦆'}
            </Text>
          </View>
        }
      />

      <LinearGradient
        colors={[Palette.primary, Palette.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={{ flex: 1 }}>
          <Badge label="★ Premium" tone="warning" />
          <Text style={[Typography.h2, { color: Palette.white, marginTop: Spacing.xs }]}>
            {t('home.promoTitle')}
          </Text>
          <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.88)', marginTop: 4 }]}>
            {t('home.promoSubtitle')}
          </Text>
        </View>
        <Text style={{ fontSize: 56 }}>🦆</Text>
      </LinearGradient>

      <SectionHeader title={t('home.quickActions')} />
      <View style={styles.actionsRow}>
        {quickActions.map((a) => (
          <Pressable
            key={a.key}
            onPress={() => router.push(a.route as never)}
            style={styles.actionCard}
          >
            <View style={[styles.actionIcon, { backgroundColor: a.tint + '1A' }]}>
              <Text style={{ fontSize: 26 }}>{a.icon}</Text>
            </View>
            <Text style={[Typography.bodyBold, { color: Palette.text, textAlign: 'center' }]}>
              {t(`home.${a.key}` as const)}
            </Text>
          </Pressable>
        ))}
      </View>

      {upcoming.length > 0 && (
        <>
          <SectionHeader
            title={t('bookings.upcoming')}
            actionLabel={t('home.viewAll')}
            onAction={() => router.push('/bookings')}
          />
          <Card onPress={() => router.push('/bookings')} variant="elevated">
            <View style={styles.upcomingRow}>
              <View style={styles.upcomingIcon}>
                <Text style={{ fontSize: 22 }}>📅</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.bodyBold]} numberOfLines={1}>
                  {upcoming[0].service?.name}
                </Text>
                <Text style={[Typography.small, { color: Palette.textSecondary }]}>
                  {new Date(upcoming[0].scheduledAt).toLocaleString()}
                </Text>
              </View>
              <Text style={[Typography.bodyBold, { color: Palette.primary }]}>
                {formatAmount(upcoming[0].totalAmount)}
              </Text>
            </View>
          </Card>
        </>
      )}

      <SectionHeader
        title={t('home.featuredServices')}
        actionLabel={t('home.viewAll')}
        onAction={() => router.push('/services')}
      />
      <Grid
        data={featuredServices}
        columns={cols}
        keyExtractor={(s) => s.id}
        renderItem={(item) => (
          <ServiceCard service={item} onPress={() => router.push(`/booking/${item.id}`)} />
        )}
      />

      <SectionHeader
        title={t('home.featuredCars')}
        actionLabel={t('home.viewAll')}
        onAction={() => router.push('/rentals')}
      />
      <Grid
        data={availableCars}
        columns={cols}
        keyExtractor={(c) => c.id}
        renderItem={(item) => (
          <CarCard car={item} onPress={() => router.push(`/rental/${item.id}`)} />
        )}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    ...Shadow.md,
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionCard: {
    flex: 1,
    backgroundColor: Palette.card,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Palette.border,
    ...Shadow.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upcomingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  upcomingIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
