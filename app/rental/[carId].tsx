import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/RatingStars';
import { mockRentalCars } from '@/lib/mock-data';
import { useBookingStore } from '@/store/booking';
import { formatAmount } from '@/lib/stripe';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const dayChips = (offset: number) =>
  Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + offset + i);
    return d.toISOString().slice(0, 10);
  });

export default function RentalScreen() {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { setRentalDraft } = useBookingStore();

  const car = useMemo(() => mockRentalCars.find((c) => c.id === carId), [carId]);

  const [start, setStart] = useState(dayChips(1)[0]);
  const [end, setEnd] = useState(dayChips(1)[2]);

  if (!car) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.background }}>
        <FlowHeader title={t('common.error')} />
      </View>
    );
  }

  const days = Math.max(
    1,
    Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000),
  );
  const rentalTotal = days * car.pricePerDay;

  const handleContinue = () => {
    setRentalDraft({ car, startDate: start, endDate: end });
    router.push({
      pathname: '/checkout/[type]',
      params: {
        type: 'rental',
        amount: rentalTotal.toString(),
        deposit: car.depositAmount.toString(),
        title: `${car.make} ${car.model}`,
        days: days.toString(),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={`${car.make} ${car.model}`} />
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          gap: Spacing.md,
          paddingBottom: 140,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
      >
        <Image source={{ uri: car.imageUrl }} style={styles.hero} />

        <View style={styles.rowBetween}>
          <View>
            <Text style={[Typography.h2]}>
              {car.make} {car.model}
            </Text>
            <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
              {car.year} · {car.transmission} · {car.fuel}
            </Text>
          </View>
          <RatingStars value={car.rating} size={16} showValue />
        </View>

        <Card>
          <Text style={[Typography.h4, { marginBottom: Spacing.sm }]}>{t('rentals.specs')}</Text>
          <View style={styles.specsGrid}>
            <Spec icon="🪑" label={t('rentals.seats', { count: car.seats })} />
            <Spec icon="⚙️" label={car.transmission === 'automatic' ? 'AT' : 'MT'} />
            <Spec icon="⛽" label={car.fuel} />
            <Spec icon="📅" label={`${car.year}`} />
          </View>
        </Card>

        <Text style={[Typography.h4]}>{t('rentals.selectPeriod')}</Text>
        <DateRangePicker label={t('rentals.pickup')} value={start} onChange={setStart} />
        <DateRangePicker label={t('rentals.dropoff')} value={end} onChange={setEnd} minDate={start} />

        <Card>
          <Row label={t('rentals.rentalDays', { count: days })} value={`${days}`} />
          <Row label={t('common.perDay')} value={formatAmount(car.pricePerDay)} />
          <View style={styles.divider} />
          <Row label={t('rentals.rentalTotal')} value={formatAmount(rentalTotal)} bold />
          <Badge
            label={t('rentals.depositInfo', { amount: formatAmount(car.depositAmount) })}
            tone="warning"
          />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>{t('common.price')}</Text>
          <Text style={[Typography.h3, { color: Palette.primary }]}>
            {formatAmount(rentalTotal)}
          </Text>
        </View>
        <Button title={t('rentals.rentNow')} variant="gradient" onPress={handleContinue} />
      </View>
    </View>
  );
}

const Spec = ({ icon, label }: { icon: string; label: string }) => (
  <View style={styles.spec}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={[Typography.caption, { color: Palette.textSecondary }]}>{label}</Text>
  </View>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.row}>
    <Text style={[bold ? Typography.bodyBold : Typography.body, { color: Palette.textSecondary }]}>
      {label}
    </Text>
    <Text style={[bold ? Typography.h4 : Typography.body, { color: Palette.text }]}>{value}</Text>
  </View>
);

const DateRangePicker = ({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minDate?: string;
}) => {
  const dates = dayChips(0).filter((d) => !minDate || d >= minDate);
  return (
    <View>
      <Text style={[Typography.small, { color: Palette.textSecondary, marginBottom: 4 }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
          {dates.map((d) => {
            const dt = new Date(d);
            const active = d === value;
            return (
              <View key={d}>
                <Card
                  onPress={() => onChange(d)}
                  padded={false}
                  variant="flat"
                  style={[
                    styles.dateCard,
                    active && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                  ]}
                >
                  <Text
                    style={{
                      color: active ? Palette.white : Palette.textSecondary,
                      fontSize: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    {dt.toLocaleDateString(undefined, { weekday: 'short' })}
                  </Text>
                  <Text
                    style={{
                      color: active ? Palette.white : Palette.text,
                      fontSize: 18,
                      fontWeight: '700',
                    }}
                  >
                    {dt.getDate()}
                  </Text>
                </Card>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: Radius.lg, backgroundColor: Palette.surface },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  spec: {
    minWidth: '22%',
    flex: 1,
    alignItems: 'center',
    gap: 4,
    padding: Spacing.xs,
    backgroundColor: Palette.surface,
    borderRadius: Radius.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  divider: { height: 1, backgroundColor: Palette.border, marginVertical: Spacing.xs },
  dateCard: { width: 52, paddingVertical: 8, alignItems: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Palette.background,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
});
