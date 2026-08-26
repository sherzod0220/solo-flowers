import type { ReactNode } from 'react';

// TODO: Backend ulanganda bu yerga haqiqiy auth logikasi (token tekshirish,
// foydalanuvchi ma'lumotini yuklash) qo'shiladi.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}