import { fetchProfile, signInWithProvider, signOut } from '../auth';
import { mockAdminProfile, mockProfile } from '../mock-data';

describe('auth (mock mode)', () => {
  it('signInWithProvider returns the mock client profile for google', async () => {
    const result = await signInWithProvider('google');
    expect('profile' in result).toBe(true);
    if ('profile' in result) {
      expect(result.profile).toEqual(mockProfile);
    }
  });

  it('signInWithProvider also works for apple', async () => {
    const result = await signInWithProvider('apple');
    expect('profile' in result).toBe(true);
    if ('profile' in result) {
      expect(result.profile.id).toBe(mockProfile.id);
    }
  });

  it('signOut is a no-op in mock mode (no Supabase client)', async () => {
    await expect(signOut()).resolves.toBeUndefined();
  });

  it('fetchProfile returns the client mock profile by default', async () => {
    const p = await fetchProfile();
    expect(p).toEqual(mockProfile);
    expect(p.role).toBe('client');
  });

  it('fetchProfile returns the admin mock profile when asked', async () => {
    const p = await fetchProfile(true);
    expect(p).toEqual(mockAdminProfile);
    expect(p.role).toBe('admin');
  });
});
