import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { RatingStars } from './RatingStars';
import { Palette, Spacing, Typography } from '@/constants/theme';
import { formatAmount } from '@/lib/stripe';
import type { RentalCar } from '@/types';

export function CarCard({
  car,
  onPress,
  horizontal,
}: {
  car: RentalCar;
  onPress?: () => void;
  horizontal?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card
      onPress={onPress}
      padded={false}
      style={[styles.card, horizontal && styles.horizontal]}
    >
      <Image source={{ uri: car.imageUrl }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Badge label={car.fuel.toUpperCase()} tone={car.fuel === 'electric' ? 'info' : 'neutral'} />
          {!car.available && <Badge label="Indisponível" tone="danger" />}
        </View>
        <Text style={[Typography.h4]} numberOfLines={1}>
          {car.make} {car.model}
        </Text>
        <View style={styles.specRow}>
          <Spec label={`${car.year}`} />
          <Spec label={t('rentals.seats', { count: car.seats })} />
          <Spec label={car.transmission === 'automatic' ? 'AT' : 'MT'} />
        </View>
        <View style={styles.rowBetween}>
          <Text style={[Typography.bodyBold, { color: Palette.primary }]}>
            {formatAmount(car.pricePerDay)}{' '}
            <Text style={[Typography.small, { color: Palette.textSecondary }]}>{t('common.perDay')}</Text>
          </Text>
          <RatingStars value={car.rating} size={14} showValue />
        </View>
      </View>
    </Card>
  );
}

const Spec = ({ label }: { label: string }) => (
  <View style={styles.spec}>
    <Text style={[Typography.small, { color: Palette.textSecondary }]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { overflow: 'hidden' },
  horizontal: { width: 280 },
  image: { width: '100%', height: 160, backgroundColor: Palette.surface },
  body: { padding: Spacing.md, gap: Spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specRow: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  spec: {
    backgroundColor: Palette.surface,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    borderRadius: 6,
  },
});
