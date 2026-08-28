import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/shared/constants/routes';

/** Faqat `role: 'admin'` bo'lgan foydalanuvchilarga admin bo'limini ochadi. */
export function RequireAdmin() {
  const user = useAuthStore((state) => state.user);

  if (!user || user.role !== 'admin') {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
