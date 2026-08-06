import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SectionHeader } from '@/components/SectionHeader';
import { useAuthStore } from '@/store/auth';
import { useBookingStore } from '@/store/booking';
import { formatAmount } from '@/lib/currency';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';
import type { Booking, BookingStatus, Rental } from '@/types';

const quickActions = [
  { key: 'bookRepair', icon: '🔧', tint: Palette.primary, route: '/services?type=repair' },
  { key: 'bookWash', icon: '💧', tint: Palette.info, route: '/services?type=wash' },
  { key: 'rentCar', icon: '🚗', tint: Palette.accentDark, route: '/rentals' },
] as const;

const UPCOMING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress'];
const PAST_STATUSES: BookingStatus[] = ['completed', 'cancelled'];

type VisitItem =
  | { kind: 'booking'; date: Date; data: Booking }
  | { kind: 'rental'; date: Date; data: Rental };

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);
  const bookings = useBookingStore((s) => s.bookings);
  const rentals = useBookingStore((s) => s.rentals);

  const now = Date.now();
  const visits: VisitItem[] = [
    ...bookings.map<VisitItem>((b) => ({
      kind: 'booking',
      date: new Date(b.scheduledAt),
      data: b,
    })),
    ...rentals.map<VisitItem>((r) => ({
      kind: 'rental',
      date: new Date(r.startDate),
      data: r,
    })),
  ];

  const upcoming = visits
    .filter((v) => v.date.getTime() >= now && UPCOMING_STATUSES.includes(v.data.status))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const history = visits
    .filter((v) => v.date.getTime() < now || PAST_STATUSES.includes(v.data.status))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 4);

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

      <SectionHeader
        title={t('home.upcomingVisits')}
        actionLabel={upcoming.length > 0 ? t('home.viewAll') : undefined}
        onAction={upcoming.length > 0 ? () => router.push('/bookings') : undefined}
      />
      {upcoming.length === 0 ? (
        <Card padded>
          <Text style={[Typography.caption, { color: Palette.textSecondary, textAlign: 'center' }]}>
            {t('home.noUpcoming')}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {upcoming.map((v) => (
            <VisitRow
              key={`${v.kind}-${v.data.id}`}
              item={v}
              locale={i18n.language}
              onPress={() =>
                v.kind === 'booking'
                  ? router.push(`/booking/${v.data.serviceId}`)
                  : router.push(`/rental/${v.data.carId}`)
              }
              t={t}
            />
          ))}
        </View>
      )}

      <SectionHeader
        title={t('home.visitHistory')}
        actionLabel={history.length > 0 ? t('home.viewAll') : undefined}
        onAction={history.length > 0 ? () => router.push('/bookings') : undefined}
      />
      {history.length === 0 ? (
        <Card padded>
          <Text style={[Typography.caption, { color: Palette.textSecondary, textAlign: 'center' }]}>
            {t('home.noHistory')}
          </Text>
        </Card>
      ) : (
        <View style={{ gap: Spacing.sm }}>
          {history.map((v) => (
            <VisitRow
              key={`${v.kind}-${v.data.id}`}
              item={v}
              locale={i18n.language}
              onPress={() =>
                v.kind === 'booking'
                  ? router.push(`/booking/${v.data.serviceId}`)
                  : router.push(`/rental/${v.data.carId}`)
              }
              t={t}
            />
          ))}
        </View>
      )}
    </Page>
  );
}

const STATUS_TONE: Record<BookingStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
};

const STATUS_KEY: Record<BookingStatus, string> = {
  pending: 'bookings.status.pending',
  confirmed: 'bookings.status.confirmed',
  in_progress: 'bookings.status.inProgress',
  completed: 'bookings.status.completed',
  cancelled: 'bookings.status.cancelled',
};

type T = ReturnType<typeof useTranslation>['t'];

function VisitRow({
  item,
  locale,
  onPress,
  t,
}: {
  item: VisitItem;
  locale: string;
  onPress: () => void;
  t: T;
}) {
  const isRental = item.kind === 'rental';
  const title = isRental
    ? `${item.data.car?.make ?? ''} ${item.data.car?.model ?? ''}`.trim() || t('home.rental')
    : item.data.service?.name ?? t('services.service');
  const subtitle = isRental
    ? `${new Date(item.data.startDate).toLocaleDateString(locale)} – ${new Date(
        item.data.endDate,
      ).toLocaleDateString(locale)}`
    : item.date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' });
  const icon = isRental ? '🚗' : '🔧';

  return (
    <Card onPress={onPress} variant="elevated">
      <View style={visitStyles.row}>
        <View style={visitStyles.icon}>
          <Text style={{ fontSize: 22 }}>{icon}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[Typography.bodyBold]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>{subtitle}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: Spacing.xxs }}>
          <Badge label={t(STATUS_KEY[item.data.status])} tone={STATUS_TONE[item.data.status]} />
          <Text style={[Typography.bodyBold, { color: Palette.primary }]}>
            {formatAmount(item.data.totalAmount)}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const visitStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Palette.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
});
