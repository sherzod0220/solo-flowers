import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/shared/constants/routes';

/** Faqat `role: 'admin'` bo'lgan foydalanuvchilarga admin bo'limini ochadi. */
export function RequireAdmin() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user.role !== 'admin') {
    // Foydalanuvchi tizimga kirgan, lekin admin emas — qayta login taklif qilish ma'nosiz,
    // shuning uchun login sahifasiga emas, bosh sahifaga qaytariladi.
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
}
