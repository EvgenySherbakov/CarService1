import { getSupabase, isSupabaseEnabled } from './supabase';
import { mockAdminProfile, mockProfile } from './mock-data';
import type { Profile } from '@/types';

export type AuthProvider = 'google' | 'apple';

export async function signInWithProvider(
  provider: AuthProvider,
): Promise<{ profile: Profile } | { error: string }> {
  if (!isSupabaseEnabled()) {
    await new Promise((r) => setTimeout(r, 700));
    return { profile: mockProfile };
  }

  const sb = getSupabase()!;
  const { error } = await sb.auth.signInWithOAuth({
    provider,
    options: { redirectTo: 'carservice1://auth-callback' },
  });
  if (error) return { error: error.message };

  return { profile: mockProfile };
}

export async function signOut(): Promise<void> {
  const sb = getSupabase();
  if (sb) await sb.auth.signOut();
}

export async function fetchProfile(asAdmin = false): Promise<Profile> {
  if (!isSupabaseEnabled()) {
    return asAdmin ? mockAdminProfile : mockProfile;
  }
  const sb = getSupabase()!;
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return mockProfile;

  const { data } = await sb
    .from('profiles')
    .select('*')
    .eq('id', u.user.id)
    .single();

  return (data as Profile) ?? mockProfile;
}
