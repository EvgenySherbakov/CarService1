import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BookingCard } from '@/components/BookingCard';
import { useBookingStore } from '@/store/booking';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Tab = 'upcoming' | 'past';

export default function BookingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const bookings = useBookingStore((s) => s.bookings);
  const [tab, setTab] = useState<Tab>('upcoming');

  const filtered = useMemo(() => {
    const now = Date.now();
    return bookings.filter((b) => {
      const ts = new Date(b.scheduledAt).getTime();
      const isUpcoming = ts >= now && b.status !== 'completed' && b.status !== 'cancelled';
      return tab === 'upcoming' ? isUpcoming : !isUpcoming;
    });
  }, [bookings, tab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.h2]}>{t('bookings.title')}</Text>
        <View style={styles.tabs}>
          {(['upcoming', 'past'] as Tab[]).map((tk) => {
            const active = tab === tk;
            return (
              <Pressable
                key={tk}
                onPress={() => setTab(tk)}
                style={[
                  styles.tab,
                  active && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                ]}
              >
                <Text
                  style={[
                    Typography.bodyBold,
                    { color: active ? Palette.white : Palette.textSecondary },
                  ]}
                >
                  {t(`bookings.${tk}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm, paddingBottom: Spacing.xxl }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={[Typography.body, { color: Palette.textSecondary }]}>
              {t('bookings.empty')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard booking={item} onPress={() => router.push(`/booking/${item.serviceId}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md },
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  empty: { alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.sm },
});
