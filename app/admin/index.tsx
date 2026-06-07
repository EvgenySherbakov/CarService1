import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { BookingCard } from '@/components/BookingCard';
import { useBookingStore } from '@/store/booking';
import { mockReviews, mockRentalCars } from '@/lib/mock-data';
import { formatAmount } from '@/lib/stripe';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const router = useRouter();
  const { bookings, rentals } = useBookingStore();

  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = bookings.filter((b) => b.scheduledAt.startsWith(today)).length;
  const revenue =
    bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.totalAmount, 0) +
    rentals.reduce((sum, r) => sum + r.totalAmount, 0);
  const activeRentals = rentals.filter((r) => r.status === 'confirmed' || r.status === 'in_progress').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.surface }} edges={['bottom']}>
      <Stack.Screen options={{ title: t('admin.dashboard') }} />
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl }}>
        <LinearGradient
          colors={[Palette.secondary, Palette.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.85)' }]}>AutoDuck Manager</Text>
          <Text style={[Typography.h2, { color: Palette.white }]}>{t('admin.title')}</Text>
        </LinearGradient>

        <View style={styles.kpiGrid}>
          <KPI icon="📅" label={t('admin.todayBookings')} value={`${todayBookings}`} tint={Palette.primary} />
          <KPI icon="🚗" label={t('admin.activeRentals')} value={`${activeRentals}`} tint={Palette.secondary} />
          <KPI icon="💰" label={t('admin.revenue')} value={formatAmount(revenue)} tint="#16A34A" />
          <KPI icon="⭐" label={t('admin.newReviews')} value={`${mockReviews.length}`} tint="#F59E0B" />
        </View>

        <Text style={[Typography.h3, { marginTop: Spacing.sm }]}>{t('admin.bookings')}</Text>
        {bookings.slice(0, 5).map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}

        <Text style={[Typography.h3, { marginTop: Spacing.sm }]}>{t('admin.cars')}</Text>
        <Card>
          {mockRentalCars.map((c, i) => (
            <View key={c.id} style={[styles.carRow, i > 0 && styles.carRowBorder]}>
              <Text style={{ fontSize: 22 }}>🚗</Text>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.body]}>
                  {c.make} {c.model}
                </Text>
                <Text style={[Typography.small, { color: Palette.textSecondary }]}>
                  {c.year} · {formatAmount(c.pricePerDay)} / day
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: c.available ? Palette.primary : Palette.textMuted },
                ]}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const KPI = ({
  icon,
  label,
  value,
  tint,
}: {
  icon: string;
  label: string;
  value: string;
  tint: string;
}) => (
  <Card style={styles.kpiCard}>
    <View style={[styles.kpiIcon, { backgroundColor: tint + '20' }]}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
    </View>
    <Text style={[Typography.h3, { color: Palette.text }]}>{value}</Text>
    <Text style={[Typography.small, { color: Palette.textSecondary }]} numberOfLines={2}>
      {label}
    </Text>
  </Card>
);

const styles = StyleSheet.create({
  hero: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
  },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  kpiCard: { width: '48%', gap: Spacing.xxs },
  kpiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  carRowBorder: { borderTopWidth: 1, borderTopColor: Palette.border },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
