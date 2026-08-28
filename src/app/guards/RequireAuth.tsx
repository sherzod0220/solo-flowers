import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { ROUTES } from '@/shared/constants/routes';

/** Tizimga kirmagan foydalanuvchilarni bloklaydi (masalan checkout sahifasi uchun). */
export function RequireAuth() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
