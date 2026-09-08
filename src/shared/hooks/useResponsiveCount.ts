import { useEffect, useState } from 'react';

export interface BreakpointCount {
  minWidth: number;
  count: number;
}

/**
 * react-slick'ning o'zining `responsive` propi jiddiy kamchilikka ega: u faqat KEYINGI resize
 * hodisasida ishga tushadi (`matchMedia`ning listener'ini ulaganda joriy holatni bir marta
 * tekshirmaydi) — ya'ni sahifa to'g'ridan-to'g'ri (masalan mobil qurilmada) ochilganda breakpoint
 * hech qachon almashmaydi va doim eng katta (bazaviy) `slidesToShow` ishlatiladi. Shu sababli
 * slidesToShow'ni o'zimiz `matchMedia` orqali hisoblaymiz va Carousel'ga to'g'ridan-to'g'ri uzatamiz.
 */
export function useResponsiveCount(breakpoints: BreakpointCount[], base: number): number {
  const sorted = [...breakpoints].sort((a, b) => b.minWidth - a.minWidth);

  function compute() {
    if (typeof window === 'undefined') return base;
    for (const bp of sorted) {
      if (window.matchMedia(`(min-width: ${bp.minWidth}px)`).matches) return bp.count;
    }
    return base;
  }

  const [count, setCount] = useState(compute);

  useEffect(() => {
    const mqls = sorted.map((bp) => window.matchMedia(`(min-width: ${bp.minWidth}px)`));
    const handleChange = () => setCount(compute());
    mqls.forEach((mql) => mql.addEventListener('change', handleChange));
    return () => mqls.forEach((mql) => mql.removeEventListener('change', handleChange));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return count;
}
