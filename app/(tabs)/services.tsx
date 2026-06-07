import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ServiceCard } from '@/components/ServiceCard';
import { mockServices } from '@/lib/mock-data';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';
import type { ServiceType } from '@/types';

type Filter = 'all' | ServiceType;

export default function ServicesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: ServiceType }>();
  const [filter, setFilter] = useState<Filter>(params.type ?? 'all');

  const services = useMemo(() => {
    if (filter === 'all') return mockServices;
    return mockServices.filter((s) => s.type === filter);
  }, [filter]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.h2]}>{t('services.title')}</Text>
        <View style={styles.tabs}>
          {(['all', 'repair', 'wash'] as Filter[]).map((f) => {
            const active = filter === f;
            const label =
              f === 'all' ? t('services.all') : f === 'repair' ? t('services.repair') : t('services.wash');
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[
                  styles.tab,
                  active && { backgroundColor: Palette.primary, borderColor: Palette.primary },
                ]}
              >
                <Text
                  style={[
                    Typography.small,
                    { color: active ? Palette.white : Palette.textSecondary },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={services}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl }}
        renderItem={({ item }) => (
          <ServiceCard service={item} onPress={() => router.push(`/booking/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.md },
  tabs: { flexDirection: 'row', gap: Spacing.xs },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
});
