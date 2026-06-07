import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/auth';

export default function Index() {
  const profile = useAuthStore((s) => s.profile);
  return <Redirect href={profile ? '/(tabs)' : '/(auth)/welcome'} />;
}
