import { create } from 'zustand';
import { tokenStorage } from '@/shared/lib/apiClient';
import type { AuthTokens, User } from './types';

interface AuthState {
  user: User | null;
  /** `/auth/me` orqali dastlabki tekshiruv tugaganini bildiradi — AuthProvider shu bayroqni boshqaradi. */
  isInitialized: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  setUser: (user: User | null) => void;
  setInitialized: (value: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,
  setSession: (user, tokens) => {
    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    set({ user });
  },
  setUser: (user) => set({ user }),
  setInitialized: (value) => set({ isInitialized: value }),
  clearAuth: () => {
    tokenStorage.clearTokens();
    set({ user: null });
  },
}));
