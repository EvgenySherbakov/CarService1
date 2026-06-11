import { getSupabase, isSupabaseEnabled } from '../supabase';

describe('supabase client (mock mode)', () => {
  it('isSupabaseEnabled is false when EXPO_PUBLIC_USE_MOCK=true and URL is empty', () => {
    expect(isSupabaseEnabled()).toBe(false);
  });

  it('getSupabase returns null in mock mode (no client instantiated)', () => {
    expect(getSupabase()).toBeNull();
  });
});
