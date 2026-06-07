import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CarCard } from '@/components/CarCard';
import { mockRentalCars } from '@/lib/mock-data';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function RentalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.h2]}>{t('rentals.title')}</Text>
        <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
          {mockRentalCars.filter((c) => c.available).length} available
        </Text>
      </View>
      <FlatList
        data={mockRentalCars}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxl }}
        renderItem={({ item }) => (
          <CarCard car={item} onPress={() => router.push(`/rental/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: Spacing.xxs },
});
