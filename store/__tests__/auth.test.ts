import { useAuthStore } from '../auth';
import { mockProfile } from '@/lib/mock-data';

describe('useAuthStore', () => {
  beforeEach(() => {
    // reset state between tests
    useAuthStore.setState({ profile: null, hydrated: false });
  });

  it('starts with no profile and not hydrated', () => {
    const s = useAuthStore.getState();
    expect(s.profile).toBeNull();
    expect(s.hydrated).toBe(false);
  });

  it('setProfile stores a profile', () => {
    useAuthStore.getState().setProfile(mockProfile);
    expect(useAuthStore.getState().profile).toEqual(mockProfile);
  });

  it('setProfile(null) signs out', () => {
    useAuthStore.getState().setProfile(mockProfile);
    useAuthStore.getState().setProfile(null);
    expect(useAuthStore.getState().profile).toBeNull();
  });

  it('setHydrated flips the flag', () => {
    useAuthStore.getState().setHydrated(true);
    expect(useAuthStore.getState().hydrated).toBe(true);
  });
});
