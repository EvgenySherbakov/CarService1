import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Grid } from '@/components/layout/Grid';
import { ServiceCard } from '@/components/ServiceCard';
import { useResponsive } from '@/hooks/useResponsive';
import { mockServices } from '@/lib/mock-data';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { ServiceType } from '@/types';

type Filter = 'all' | ServiceType;

export default function ServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const params = useLocalSearchParams<{ type?: ServiceType }>();
  const [filter, setFilter] = useState<Filter>(params.type ?? 'all');

  const services = useMemo(
    () => (filter === 'all' ? mockServices : mockServices.filter((s) => s.type === filter)),
    [filter],
  );

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('services.all') },
    { key: 'repair', label: t('services.repair') },
    { key: 'wash', label: t('services.wash') },
  ];

  return (
    <Page>
      <PageHeader title={t('services.title')} subtitle={`${services.length} ${t('common.all').toLowerCase()}`} />

      <View style={styles.tabs}>
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text
                style={[
                  Typography.bodyBold,
                  { color: active ? Palette.white : Palette.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: Spacing.md }} />

      <Grid
        data={services}
        columns={isDesktop ? 3 : 1}
        keyExtractor={(s) => s.id}
        renderItem={(item) => (
          <ServiceCard service={item} onPress={() => router.push(`/booking/${item.id}`)} />
        )}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: Spacing.xs, flexWrap: 'wrap' },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.card,
  },
  tabActive: { backgroundColor: Palette.primary, borderColor: Palette.primary },
});
