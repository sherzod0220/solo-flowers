import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export interface Envelope<T> {
  data?: T;
  error?: string;
  message?: string;
}

/** `categories`/`products`/`events` ommaviy endpointlari qabul qiladigan `?lang=` qiymati. */
export type Lang = 'uz' | 'eng' | 'ru';

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

const ACCESS_TOKEN_KEY = 'solo_shop_access_token';
const REFRESH_TOKEN_KEY = 'solo_shop_refresh_token';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Bir vaqtning o'zida bir nechta so'rov 401 qaytarsa ham, /auth/refresh faqat bitta marta chaqirilishi uchun.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post<Envelope<{ access_token: string; refresh_token: string }>>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      { refresh_token: refreshToken },
    );
    const tokens = response.data.data;
    if (!tokens) return null;

    tokenStorage.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens.access_token;
  } catch {
    return null;
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<Envelope<unknown>>) => {
    const originalRequest = error.config as RetryableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });

      const newAccessToken = await refreshPromise;
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }

      // Refresh ham muvaffaqiyatsiz — sessiya tugagan.
      // TODO(1-bosqich, auth store qo'shilgach): shu yerda auth store'ni tozalab,
      // foydalanuvchini login sahifasiga yo'naltirish kerak bo'ladi.
      tokenStorage.clearTokens();
    }

    const message = error.response?.data?.error || error.message;
    return Promise.reject(new Error(message));
  },
);

/** Envelope'dan (`{ data, error, message }`) faqat `data` qismini chiqarib beradi. */
export function unwrap<T>(promise: Promise<{ data: Envelope<T> }>): Promise<T> {
  return promise.then((res) => res.data.data as T);
}
