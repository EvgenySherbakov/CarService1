import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { Config } from '@/constants/config';

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (Config.useMock || !Config.supabaseUrl || !Config.supabaseAnonKey) {
    return null;
  }
  if (cached) return cached;
  cached = createClient(Config.supabaseUrl, Config.supabaseAnonKey, {
    auth: {
      storage: AsyncStorage as never,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return cached;
}

export const isSupabaseEnabled = () => !Config.useMock && !!Config.supabaseUrl;
