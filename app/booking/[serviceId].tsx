import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlowHeader } from '@/components/layout/FlowHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/RatingStars';
import { mockServices, mockVehicles } from '@/lib/mock-data';
import { useBookingStore } from '@/store/booking';
import { useAuthStore } from '@/store/auth';
import { formatAmount } from '@/lib/currency';
import { scheduleBookingReminder } from '@/lib/notifications';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { Booking, Vehicle } from '@/types';

type PaymentMode = 'now' | 'office';

function getDateChips() {
  const out: { value: string; label: string; sub: string }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      value: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      sub: `${d.getDate()}`,
    });
  }
  return out;
}

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { setBookingDraft, addBooking, clearBookingDraft } = useBookingStore();
  const profile = useAuthStore((s) => s.profile);

  const service = useMemo(() => mockServices.find((s) => s.id === serviceId), [serviceId]);

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(mockVehicles[0]);
  const [date, setDate] = useState(getDateChips()[1].value);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('office');

  if (!service) {
    return (
      <View style={{ flex: 1, backgroundColor: Palette.background }}>
        <FlowHeader title={t('common.error')} />
      </View>
    );
  }

  const handleContinue = async () => {
    const scheduledAt = `${date}T${time}:00`;
    setBookingDraft({ service, vehicle, date, time, notes });

    if (paymentMode === 'now') {
      router.push({
        pathname: '/checkout/[type]',
        params: {
          type: 'booking',
          amount: service.priceFrom.toString(),
          when: scheduledAt,
          title: service.name,
        },
      });
      return;
    }

    const booking: Booking = {
      id: `b_${Date.now()}`,
      clientId: profile?.id ?? 'demo',
      serviceId: service.id,
      service,
      vehicleId: vehicle?.id,
      scheduledAt,
      status: 'pending',
      notes,
      totalAmount: service.priceFrom,
      createdAt: new Date().toISOString(),
    };
    addBooking(booking);
    clearBookingDraft();
    await scheduleBookingReminder(
      t('brand.name'),
      `${service.name} — ${date} ${time}`,
      scheduledAt,
    );
    router.replace({
      pathname: '/booking-success',
      params: { paid: '0', title: service.name, amount: service.priceFrom.toString() },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Palette.background }}>
      <FlowHeader title={service.name} />
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.lg,
          gap: Spacing.md,
          paddingBottom: 120,
          width: '100%',
          maxWidth: 720,
          alignSelf: 'center',
        }}
      >
        <Image source={{ uri: service.imageUrl }} style={styles.hero} />

        <View>
          <View style={styles.rowBetween}>
            <Badge
              label={service.type === 'wash' ? t('services.wash') : t('services.repair')}
              tone={service.type === 'wash' ? 'info' : 'brand'}
            />
            <RatingStars value={service.rating} size={16} showValue />
          </View>
          <Text style={[Typography.h2, { marginTop: Spacing.xs }]}>{service.name}</Text>
          <Text style={[Typography.body, { color: Palette.textSecondary, marginTop: Spacing.xs }]}>
            {service.description}
          </Text>
        </View>

        <Card>
          <View style={styles.rowBetween}>
            <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
              {t('common.duration')}
            </Text>
            <Text style={[Typography.bodyBold]}>
              {service.durationMinutes} {t('common.minutes')}
            </Text>
          </View>
          <View style={[styles.rowBetween, { marginTop: Spacing.xs }]}>
            <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
              {t('common.price')}
            </Text>
            <Text style={[Typography.h4, { color: Palette.primary }]}>
              {t('common.from')} {formatAmount(service.priceFrom)}
            </Text>
          </View>
        </Card>

        <Text style={[Typography.h4]}>{t('services.selectVehicle')}</Text>
        <View style={{ gap: Spacing.xs }}>
          {mockVehicles.map((v) => {
            const active = v.id === vehicle?.id;
            return (
              <Pressable
                key={v.id}
                onPress={() => setVehicle(v)}
                style={[
                  styles.vehicle,
                  active && { borderColor: Palette.primary, backgroundColor: '#F0FDF4' },
                ]}
              >
                <Text style={{ fontSize: 24 }}>🚗</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.body]}>
                    {v.make} {v.model}
                  </Text>
                  <Text style={[Typography.small, { color: Palette.textSecondary }]}>
                    {v.year} · {v.plate}
                  </Text>
                </View>
                {active && <Text style={{ color: Palette.primary, fontSize: 18 }}>✓</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={[Typography.h4]}>{t('services.selectDate')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            {getDateChips().map((c) => {
              const active = c.value === date;
              return (
                <Pressable
                  key={c.value}
                  onPress={() => setDate(c.value)}
                  style={[
                    styles.dateChip,
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
                    {c.label}
                  </Text>
                  <Text
                    style={{
                      color: active ? Palette.white : Palette.text,
                      fontSize: 20,
                      fontWeight: '700',
                    }}
                  >
                    {c.sub}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Text style={[Typography.h4]}>{t('services.selectTime')}</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => {
            const active = slot === time;
            return (
              <Pressable
                key={slot}
                onPress={() => setTime(slot)}
                style={[
                  styles.timeChip,
                  active && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                ]}
              >
                <Text style={{ color: active ? Palette.white : Palette.text }}>{slot}</Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label={t('services.notes')}
          placeholder={t('services.notesPlaceholder')}
          multiline
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Text style={[Typography.h4]}>{t('booking.paymentMethod')}</Text>
        <PaymentChoice
          icon="🏢"
          title={t('booking.payAtOffice')}
          description={t('booking.payAtOfficeDescription')}
          active={paymentMode === 'office'}
          onPress={() => setPaymentMode('office')}
        />
        <PaymentChoice
          icon="💳"
          title={t('booking.payNow')}
          description={t('booking.payNowDescription')}
          active={paymentMode === 'now'}
          onPress={() => setPaymentMode('now')}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>{t('common.price')}</Text>
          <Text style={[Typography.h3, { color: Palette.primary }]}>
            {formatAmount(service.priceFrom)}
          </Text>
        </View>
        <Button
          title={
            paymentMode === 'now'
              ? t('booking.continueToPayment')
              : t('booking.confirmBooking')
          }
          variant="gradient"
          onPress={handleContinue}
        />
      </View>
    </View>
  );
}

function PaymentChoice({
  icon,
  title,
  description,
  active,
  onPress,
}: {
  icon: string;
  title: string;
  description: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        choiceStyles.row,
        active && { borderColor: Palette.primary, backgroundColor: '#F0FDF4' },
      ]}
    >
      <View style={choiceStyles.iconBubble}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[Typography.bodyBold]}>{title}</Text>
        <Text
          style={[Typography.small, { color: Palette.textSecondary, marginTop: 2 }]}
          numberOfLines={3}
        >
          {description}
        </Text>
      </View>
      <View style={[choiceStyles.radio, active && { borderColor: Palette.primary }]}>
        {active && <View style={choiceStyles.radioDot} />}
      </View>
    </Pressable>
  );
}

const choiceStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.background,
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
});

const styles = StyleSheet.create({
  hero: { width: '100%', height: 180, borderRadius: Radius.lg, backgroundColor: Palette.surface },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  vehicle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Palette.border,
    borderRadius: Radius.md,
    backgroundColor: Palette.surface,
  },
  dateChip: {
    width: 56,
    paddingVertical: Spacing.xs,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  timeChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
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
