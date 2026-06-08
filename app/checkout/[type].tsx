import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useBookingStore } from '@/store/booking';
import { useAuthStore } from '@/store/auth';
import { presentPaymentSheet } from '@/lib/stripe';
import { formatAmount } from '@/lib/currency';
import { scheduleBookingReminder } from '@/lib/notifications';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { Booking, Rental } from '@/types';

type Method = 'card' | 'applePay' | 'googlePay';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    type: 'booking' | 'rental';
    amount: string;
    deposit?: string;
    when?: string;
    title?: string;
    days?: string;
  }>();

  const {
    bookingDraft,
    rentalDraft,
    addBooking,
    addRental,
    clearBookingDraft,
    clearRentalDraft,
  } = useBookingStore();
  const profile = useAuthStore((s) => s.profile);

  const [method, setMethod] = useState<Method>('card');
  const [paying, setPaying] = useState(false);

  const amount = Number(params.amount ?? '0');
  const deposit = Number(params.deposit ?? '0');
  const isRental = params.type === 'rental';

  const handlePay = async () => {
    setPaying(true);
    const result = await presentPaymentSheet({
      amount,
      currency: 'BRL',
      description: params.title ?? 'AutoDuck',
      capture: 'immediate',
    });
    setPaying(false);

    if (result.status !== 'succeeded') return;

    if (isRental && rentalDraft.car && rentalDraft.startDate && rentalDraft.endDate) {
      const r: Rental = {
        id: `rent_${Date.now()}`,
        clientId: profile?.id ?? 'demo',
        carId: rentalDraft.car.id,
        car: rentalDraft.car,
        startDate: rentalDraft.startDate,
        endDate: rentalDraft.endDate,
        status: 'confirmed',
        totalAmount: amount,
        depositAmount: deposit,
        paymentId: result.paymentIntentId,
        createdAt: new Date().toISOString(),
      };
      addRental(r);
      clearRentalDraft();
    } else if (bookingDraft.service && bookingDraft.date && bookingDraft.time) {
      const scheduledAt = `${bookingDraft.date}T${bookingDraft.time}:00`;
      const b: Booking = {
        id: `b_${Date.now()}`,
        clientId: profile?.id ?? 'demo',
        serviceId: bookingDraft.service.id,
        service: bookingDraft.service,
        vehicleId: bookingDraft.vehicle?.id,
        scheduledAt,
        status: 'confirmed',
        totalAmount: amount,
        notes: bookingDraft.notes,
        paymentId: result.paymentIntentId,
        createdAt: new Date().toISOString(),
      };
      addBooking(b);
      clearBookingDraft();
      await scheduleBookingReminder(
        t('brand.name'),
        `${bookingDraft.service.name} — ${bookingDraft.date} ${bookingDraft.time}`,
        scheduledAt,
      );
    }

    router.replace({
      pathname: '/booking-success',
      params: {
        paid: '1',
        title: params.title ?? '',
        amount: amount.toString(),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={t('checkout.title')} />
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          gap: Spacing.md,
          paddingBottom: 140,
          width: '100%',
          maxWidth: 640,
          alignSelf: 'center',
        }}
      >
        <Card>
          <Text style={[Typography.h4, { marginBottom: Spacing.xs }]}>{params.title}</Text>
          {isRental ? (
            <>
              <Row label={t('rentals.rentalDays', { count: Number(params.days ?? 1) })} value={String(params.days)} />
              <Row label={t('rentals.deposit')} value={formatAmount(deposit)} />
              <Row label={t('rentals.rentalTotal')} value={formatAmount(amount)} bold />
            </>
          ) : (
            <>
              {bookingDraft.vehicle && (
                <Row
                  label={t('services.vehicle')}
                  value={`${bookingDraft.vehicle.make} ${bookingDraft.vehicle.model}`}
                />
              )}
              {params.when && (
                <Row
                  label={t('services.datetime')}
                  value={new Date(params.when).toLocaleString()}
                />
              )}
              <Row label={t('services.total')} value={formatAmount(amount)} bold />
            </>
          )}
        </Card>

        <Text style={[Typography.h4]}>{t('checkout.payment')}</Text>
        <View style={{ gap: Spacing.xs }}>
          <PayMethod
            active={method === 'card'}
            onPress={() => setMethod('card')}
            icon="💳"
            label={t('checkout.card')}
            sub="•••• 4242"
          />
          <PayMethod
            active={method === 'applePay'}
            onPress={() => setMethod('applePay')}
            icon="🍏"
            label={t('checkout.applePay')}
          />
          <PayMethod
            active={method === 'googlePay'}
            onPress={() => setMethod('googlePay')}
            icon="G"
            label={t('checkout.googlePay')}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>
            {t('services.total')}
          </Text>
          <Text style={[Typography.h3, { color: Palette.primary }]}>{formatAmount(amount)}</Text>
        </View>
        <Button
          title={t('checkout.pay', { amount: formatAmount(amount) })}
          variant="gradient"
          loading={paying}
          onPress={handlePay}
        />
      </View>
    </View>
  );
}

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <View style={styles.row}>
    <Text style={[Typography.body, { color: Palette.textSecondary }]}>{label}</Text>
    <Text style={[bold ? Typography.h4 : Typography.body, { color: Palette.text }]}>{value}</Text>
  </View>
);

const PayMethod = ({
  active,
  onPress,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onPress: () => void;
  icon: string;
  label: string;
  sub?: string;
}) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.method,
      active && { borderColor: Palette.primary, backgroundColor: '#F0FDF4' },
    ]}
  >
    <View style={styles.methodIcon}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>{icon}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[Typography.body]}>{label}</Text>
      {sub && <Text style={[Typography.small, { color: Palette.textSecondary }]}>{sub}</Text>}
    </View>
    <View style={[styles.radio, active && { borderColor: Palette.primary }]}>
      {active && <View style={styles.radioDot} />}
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
  methodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Palette.border,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Palette.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.primary,
  },
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
