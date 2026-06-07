import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Page } from '@/components/layout/Page';
import { PageHeader } from '@/components/layout/PageHeader';
import { Grid } from '@/components/layout/Grid';
import { CarCard } from '@/components/CarCard';
import { useResponsive } from '@/hooks/useResponsive';
import { mockRentalCars } from '@/lib/mock-data';

export default function RentalsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isDesktop } = useResponsive();

  const available = mockRentalCars.filter((c) => c.available).length;

  return (
    <Page>
      <PageHeader title={t('rentals.title')} subtitle={`${available} available`} />
      <Grid
        data={mockRentalCars}
        columns={isDesktop ? 3 : 1}
        keyExtractor={(c) => c.id}
        renderItem={(item) => (
          <CarCard car={item} onPress={() => router.push(`/rental/${item.id}`)} />
        )}
      />
    </Page>
  );
}
