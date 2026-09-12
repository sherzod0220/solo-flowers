import { useEffect, useRef, useState } from 'react';

/**
 * Pastga scroll qilinganda `true` (yashirish kerak), yuqoriga — hatto ozgina — scroll
 * qilinganda yoki sahifa boshiga yaqin bo'lganda `true` qaytaradi.
 * `threshold` — sahifa boshidan shuncha piksel ichida navbar doim ko'rinib turadi.
 */
export function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    function handleScroll() {
      const currentY = window.scrollY;
      const diff = currentY - lastY.current;

      if (currentY < threshold) {
        setHidden(false);
      } else if (diff > 4) {
        setHidden(true);
      } else if (diff < -4) {
        setHidden(false);
      }

      lastY.current = currentY;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return hidden;
}
