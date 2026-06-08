import { Image, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Grid } from '@/components/layout/Grid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/RatingStars';
import { useResponsive } from '@/hooks/useResponsive';
import { mockRentalCars } from '@/lib/mock-data';
import { formatAmount } from '@/lib/currency';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { RentalCar } from '@/types';

export default function FleetScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={t('fleet.title')} />
      <Page>
        <PageHeader title={t('fleet.title')} subtitle={t('fleet.subtitle')} />

        <Grid
          data={mockRentalCars}
          columns={isDesktop ? 2 : 1}
          keyExtractor={(c) => c.id}
          renderItem={(car) => <FleetCard car={car} />}
        />

        <Card style={{ marginTop: Spacing.lg, alignItems: 'center', gap: Spacing.sm }}>
          <Text style={[Typography.body, { color: Palette.textSecondary, textAlign: 'center' }]}>
            {t('fleet.note')}
          </Text>
          <Button
            title={t('fleet.loginToRent')}
            variant="gradient"
            fullWidth
            onPress={() => router.replace('/(auth)/welcome')}
          />
        </Card>
      </Page>
    </View>
  );
}

function FleetCard({ car }: { car: RentalCar }) {
  const { t } = useTranslation();
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      <View>
        <Image source={{ uri: car.imageUrl }} style={styles.image} />
        {!car.available && (
          <View style={styles.badgeOverlay}>
            <Badge label={t('fleet.unavailable')} tone="danger" />
          </View>
        )}
      </View>
      <View style={styles.body}>
        <View style={styles.rowBetween}>
          <Text style={[Typography.h4]} numberOfLines={1}>
            {car.make} {car.model}
          </Text>
          <RatingStars value={car.rating} size={13} showValue />
        </View>
        <Text style={[Typography.small, { color: Palette.textSecondary }]}>
          {car.year} · {t('rentals.seats', { count: car.seats })} ·{' '}
          {car.transmission === 'automatic' ? 'AT' : 'MT'} · {car.fuel}
        </Text>
        {car.description ? (
          <Text style={[Typography.caption, { color: Palette.textSecondary }]} numberOfLines={3}>
            {car.description}
          </Text>
        ) : null}
        <View style={styles.priceRow}>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>
            {t('common.from')}
          </Text>
          <Text style={[Typography.h4, { color: Palette.primary }]}>
            {formatAmount(car.pricePerDay)}
          </Text>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>
            {t('common.perDay')}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 180, backgroundColor: Palette.surface },
  badgeOverlay: { position: 'absolute', top: Spacing.sm, left: Spacing.sm },
  body: { padding: Spacing.md, gap: Spacing.xs },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 4 },
});
