import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Grid } from '@/components/layout/Grid';
import { BookingCard } from '@/components/BookingCard';
import { useResponsive } from '@/hooks/useResponsive';
import { useBookingStore } from '@/store/booking';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Tab = 'upcoming' | 'past';

export default function BookingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();
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
    <Page>
      <PageHeader title={t('bookings.title')} />

      <View style={styles.tabs}>
        {(['upcoming', 'past'] as Tab[]).map((tk) => {
          const active = tab === tk;
          return (
            <Pressable
              key={tk}
              onPress={() => setTab(tk)}
              style={[styles.tab, active && styles.tabActive]}
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

      <View style={{ height: Spacing.md }} />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 56 }}>📭</Text>
          <Text style={[Typography.body, { color: Palette.textSecondary }]}>
            {t('bookings.empty')}
          </Text>
        </View>
      ) : (
        <Grid
          data={filtered}
          columns={isDesktop ? 2 : 1}
          keyExtractor={(b) => b.id}
          renderItem={(item) => (
            <BookingCard booking={item} onPress={() => router.push(`/booking/${item.serviceId}`)} />
          )}
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
  },
  tabActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
  empty: { alignItems: 'center', marginTop: Spacing.xxl, gap: Spacing.sm },
});
