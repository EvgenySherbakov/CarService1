import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import { mockRentalCars, mockServices } from '@/lib/mock-data';
import { ServiceCard } from '@/components/ServiceCard';
import { CarCard } from '@/components/CarCard';
import { SectionHeader } from '@/components/SectionHeader';
import { Palette, Radius, Shadow, Spacing, Typography } from '@/constants/theme';

const quickActions = [
  { key: 'bookRepair', icon: '🔧', route: '/(tabs)/services?type=repair' },
  { key: 'bookWash', icon: '💧', route: '/(tabs)/services?type=wash' },
  { key: 'rentCar', icon: '🚗', route: '/(tabs)/rentals' },
] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const profile = useAuthStore((s) => s.profile);

  const featuredServices = mockServices.slice(0, 4);
  const availableCars = mockRentalCars.filter((c) => c.available).slice(0, 4);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Palette.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: Spacing.md }}>
          <Text style={[Typography.h2, { color: Palette.text }]}>
            {t('home.greeting', {
              name: profile?.fullName?.split(' ')[0] ?? t('home.guest'),
            })}
          </Text>
          <Text style={[Typography.caption, { color: Palette.textSecondary }]}>
            {t('brand.tagline')}
          </Text>
        </View>

        <LinearGradient
          colors={[Palette.primary, Palette.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h3, { color: Palette.white }]}>
              {t('home.promoTitle')}
            </Text>
            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.85)', marginTop: 4 }]}>
              {t('home.promoSubtitle')}
            </Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={{ fontSize: 28 }}>🦆</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={[Typography.h3, { marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            {t('home.quickActions')}
          </Text>
          <View style={styles.actionsRow}>
            {quickActions.map((a) => (
              <Pressable
                key={a.key}
                onPress={() => router.push(a.route as never)}
                style={styles.actionCard}
              >
                <Text style={{ fontSize: 28 }}>{a.icon}</Text>
                <Text
                  style={[Typography.small, { color: Palette.text, textAlign: 'center' }]}
                  numberOfLines={2}
                >
                  {t(`home.${a.key}` as const)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionHeader
            title={t('home.featuredServices')}
            actionLabel={t('home.viewAll')}
            onAction={() => router.push('/(tabs)/services')}
          />
        </View>
        <FlatList
          data={featuredServices}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              horizontal
              onPress={() => router.push(`/booking/${item.id}`)}
            />
          )}
        />

        <View style={{ paddingHorizontal: Spacing.lg }}>
          <SectionHeader
            title={t('home.featuredCars')}
            actionLabel={t('home.viewAll')}
            onAction={() => router.push('/(tabs)/rentals')}
          />
        </View>
        <FlatList
          data={availableCars}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}
          renderItem={({ item }) => (
            <CarCard car={item} horizontal onPress={() => router.push(`/rental/${item.id}`)} />
          )}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.md,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  actionCard: {
    flex: 1,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Palette.border,
  },
});
