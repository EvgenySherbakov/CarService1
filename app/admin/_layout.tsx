import { Stack } from 'expo-router';
import { Palette } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Palette.secondary },
        headerTintColor: Palette.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    />
  );
}
