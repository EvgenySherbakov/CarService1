import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { RatingStars } from '@/components/RatingStars';
import { mockServices, mockVehicles } from '@/lib/mock-data';
import { useBookingStore } from '@/store/booking';
import { formatAmount } from '@/lib/stripe';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { Vehicle } from '@/types';

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
  const { setBookingDraft, bookingDraft } = useBookingStore();

  const service = useMemo(() => mockServices.find((s) => s.id === serviceId), [serviceId]);

  const [vehicle, setVehicle] = useState<Vehicle | undefined>(mockVehicles[0]);
  const [date, setDate] = useState(getDateChips()[1].value);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  if (!service) {
    return (
      <SafeAreaView style={{ flex: 1, padding: Spacing.lg }}>
        <Text>{t('common.error')}</Text>
      </SafeAreaView>
    );
  }

  const handleContinue = () => {
    const scheduledAt = `${date}T${time}:00`;
    setBookingDraft({ service, vehicle, date, time, notes });
    router.push({
      pathname: '/checkout/[type]',
      params: {
        type: 'booking',
        amount: service.priceFrom.toString(),
        when: scheduledAt,
        title: service.name,
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['bottom']}>
      <Stack.Screen options={{ title: service.name, headerTintColor: Palette.text }} />
      <ScrollView contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: 120 }}>
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
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[Typography.small, { color: Palette.textSecondary }]}>{t('common.price')}</Text>
          <Text style={[Typography.h3, { color: Palette.primary }]}>
            {formatAmount(service.priceFrom)}
          </Text>
        </View>
        <Button title={t('services.bookNow')} variant="gradient" onPress={handleContinue} />
      </View>
    </SafeAreaView>
  );
}

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
