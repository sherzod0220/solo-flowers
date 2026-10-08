import { useEffect } from 'react';
import { motion } from 'motion/react';
import { EASE_OUT } from '@/shared/lib/motion';

const INTRO_DURATION_MS = 1700;

interface SiteIntroProps {
  onFinish: () => void;
}

/**
 * Saytga birinchi kirganda chiqadigan brend intro — logotip kattalashib paydo bo'ladi, "Solo"
 * yozuvi harflar orasi torayib yig'iladi, ostida vino chiziq chiziladi. So'ng butun qatlam
 * parda kabi yuqoriga ko'tarilib, ostidagi sahifa ochiladi. Chiqish (exit) animatsiyasi
 * ishlashi uchun ota komponent buni `AnimatePresence` ichida render qilishi shart.
 */
export function SiteIntro({ onFinish }: SiteIntroProps) {
  useEffect(() => {
    // Intro vaqtida orqadagi sahifa skroll bo'lib ketmasligi uchun.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(onFinish, INTRO_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [onFinish]);

  return (
    <motion.div
      aria-hidden
      onClick={onFinish}
      initial={{ y: 0 }}
      exit={{ y: '-100%', opacity: 0.6, transition: { duration: 0.8, ease: EASE_OUT } }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        background: 'var(--color-bg)',
        boxShadow: '0 12px 40px rgba(92, 26, 48, 0.18)',
        cursor: 'pointer',
      }}
    >
      <motion.img
        src="/logo-S.PNG"
        alt=""
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: EASE_OUT }}
        style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover' }}
      />

      <motion.span
        initial={{ opacity: 0, letterSpacing: '0.6em' }}
        animate={{ opacity: 1, letterSpacing: '0.15em' }}
        transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
        style={{ fontFamily: 'var(--font-brand)', fontSize: 34, fontWeight: 700, color: 'var(--color-primary)' }}
      >
        Solo
      </motion.span>

      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: 0.55, ease: EASE_OUT }}
        style={{ width: 72, height: 2, background: 'var(--color-primary)', transformOrigin: 'center' }}
      />
    </motion.div>
  );
}
