import { create } from 'zustand';
import type { Profile } from '@/types';

type AuthState = {
  profile: Profile | null;
  hydrated: boolean;
  setProfile: (p: Profile | null) => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  hydrated: false,
  setProfile: (profile) => set({ profile }),
  setHydrated: (hydrated) => set({ hydrated }),
}));
