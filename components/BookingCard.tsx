import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { formatAmount } from '@/lib/currency';
import type { Booking, BookingStatus } from '@/types';

const statusTone: Record<BookingStatus, 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  confirmed: 'info',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'danger',
};

const statusKey: Record<BookingStatus, string> = {
  pending: 'bookings.status.pending',
  confirmed: 'bookings.status.confirmed',
  in_progress: 'bookings.status.inProgress',
  completed: 'bookings.status.completed',
  cancelled: 'bookings.status.cancelled',
};

export function BookingCard({ booking, onPress }: { booking: Booking; onPress?: () => void }) {
  const { t, i18n } = useTranslation();
  const dt = new Date(booking.scheduledAt);
  const locale = i18n.language;

  return (
    <Card onPress={onPress}>
      <View style={styles.row}>
        <View style={{ flex: 1, gap: Spacing.xxs }}>
          <Text style={[Typography.h4]} numberOfLines={1}>
            {booking.service?.name ?? t('services.service')}
          </Text>
          <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
            {dt.toLocaleString(locale, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </Text>
        </View>
        <Badge label={t(statusKey[booking.status])} tone={statusTone[booking.status]} />
      </View>
      <View style={[styles.row, { marginTop: Spacing.xs }]}>
        <Text style={[Typography.small, { color: Palette.textMuted }]}>#{booking.id.slice(0, 8)}</Text>
        <Text style={[Typography.bodyBold, { color: Palette.primary }]}>
          {formatAmount(booking.totalAmount)}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
