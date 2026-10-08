import type { CSSProperties, ReactNode } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '@/shared/lib/motion';

interface RevealProps {
  children: ReactNode;
  /** Kechikish (soniya) — panjaradagi kartalarni ketma-ket (stagger) chiqarish uchun. */
  delay?: number;
  /** Boshlang'ich siljish: musbat y — pastdan, musbat/manfiy x — o'ng/chapdan kirib keladi. */
  y?: number;
  x?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Element ekranga (viewport) kirganda bir marta yumshoq paydo bo'ladi (fade + siljish).
 * Bo'limlar, kartalar va matn bloklari uchun saytdagi asosiy "scroll reveal" komponenti.
 */
export function Reveal({ children, delay = 0, y = 24, x = 0, duration = 0.6, className, style }: RevealProps) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
