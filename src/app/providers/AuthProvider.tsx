import { useEffect, type ReactNode } from 'react';
import { Spin } from 'antd';
import { getMe } from '@/features/auth/api';
import { useAuthStore } from '@/features/auth/store';
import { tokenStorage } from '@/shared/lib/apiClient';

/**
 * Ilova ochilganda saqlangan access_token asosida foydalanuvchini tiklaydi.
 * Tekshiruv tugamaguncha (isInitialized=true bo'lguncha) bolalarini render qilmaydi —
 * shu bilan "avval mehmon, keyin login qilingan" ko'rinishidagi flicker oldini olinadi.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const setUser = useAuthStore((state) => state.setUser);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    async function bootstrap() {
      if (!tokenStorage.getAccessToken()) {
        setInitialized(true);
        return;
      }

      try {
        const user = await getMe();
        setUser(user);
      } catch {
        tokenStorage.clearTokens();
      } finally {
        setInitialized(true);
      }
    }

    void bootstrap();
  }, [setUser, setInitialized]);

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
