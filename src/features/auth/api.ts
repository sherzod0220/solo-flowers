import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { AuthTokens, LoginPayload, RegisterPayload, RegisterResponse, User } from './types';

export function register(payload: RegisterPayload) {
  return unwrap<RegisterResponse>(apiClient.post('/auth/register', payload));
}

export function login(payload: LoginPayload) {
  return unwrap<AuthTokens>(apiClient.post('/auth/login', payload));
}

export function refresh(refreshToken: string) {
  return unwrap<AuthTokens>(apiClient.post('/auth/refresh', { refresh_token: refreshToken }));
}

export function getMe() {
  return unwrap<User>(apiClient.get('/auth/me'));
}
