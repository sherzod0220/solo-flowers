import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tokenStorage } from '@/shared/lib/apiClient';
import { getMe, login, register } from './api';
import { useAuthStore } from './store';
import type { LoginPayload, RegisterPayload } from './types';

async function loginAndFetchUser(payload: LoginPayload) {
  const tokens = await login(payload);
  // getMe so'rovi Authorization header kutadi — shuning uchun tokenlar avval xom holda saqlanadi,
  // haqiqiy foydalanuvchi kelgach esa store'ga setSession orqali birgalikda yoziladi (onSuccess'da).
  tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
  const user = await getMe();
  return { user, tokens };
}

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginAndFetchUser,
    onSuccess: ({ user, tokens }) => setSession(user, tokens),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return () => {
    clearAuth();
    queryClient.clear();
  };
}

/** Joriy foydalanuvchi holatini reaktiv o'qish uchun qulay hook (tarmoqqa qayta so'rov yubormaydi). */
export function useMe() {
  const user = useAuthStore((state) => state.user);

  return {
    user,
    isAuthenticated: user !== null,
    isAdmin: user?.role === 'admin',
  };
}
