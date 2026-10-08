import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';

/**
 * Global animatsiya sozlamasi — foydalanuvchi OS'da "harakatni kamaytirish" (reduced motion)
 * yoqqan bo'lsa, siljish/kattalashish animatsiyalari o'chadi, faqat yumshoq paydo bo'lish qoladi.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
