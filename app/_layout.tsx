import 'react-native-gesture-handler';
import '@/i18n';
import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

const queryClient = new QueryClient();

function AuthGate() {
  const { profile, hydrated, setHydrated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) setHydrated(true);
  }, [hydrated, setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const first = segments[0];
    const inAuth = first === '(auth)';
    if (!profile && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (profile && inAuth) {
      router.replace('/(tabs)');
    }
  }, [profile, hydrated, segments, router]);

  return (
    <ResponsiveContainer>
      <Slot />
    </ResponsiveContainer>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthGate />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
