export type Role = 'customer' | 'admin';

export interface User {
  user_id: string;
  email: string;
  role: Role;
}

export interface RegisterPayload {
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}
