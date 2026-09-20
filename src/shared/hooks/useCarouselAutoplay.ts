import { useEffect, useRef, type PointerEvent, type RefObject } from 'react';
import type { CarouselRef } from 'antd';

/** Odatiy holatda avtomatik keyingi slaydga shu oraliqda o'tadi — doimiy, bir xil ritm. */
const AUTOPLAY_INTERVAL_MS = 3500;
/** Qo'l/sichqoncha bilan tortilgandan yoki strelka bosilgandan keyin avtomatik aylanish shuncha kutadi. */
const INTERACTION_PAUSE_MS = 5000;
/** Shundan kamrog'i tortilsa — navigatsiya bo'lmaydi, joyiga qaytadi (tasodifiy bosishdan himoya). */
const SWIPE_THRESHOLD_PX = 50;

/**
 * AntD `Carousel`ning o'z ichki `autoplay`si va `draggable`/`swipeToSlide`i o'rniga to'liq
 * qo'lda boshqariladigan autoplay + tortish (`<Carousel autoplay={false} draggable={false}
 * swipeToSlide={false}>` bilan ishlatiladi).
 *
 * Ikkala sabab ham bitta joyda: slick o'zining ichki `pause()` metodini tashqariga chiqarmaydi
 * (faqat `next`/`prev`/`autoPlay` bor), shuning uchun standart `autoplay` bilan qo'lda tortish
 * bir vaqtda pozitsiyani o'zgartirishga urinib to'qnashardi. Buni oldini olish uchun tashqi
 * `onPointerDown`ni slick'ning o'z draggable'i BILAN BIRGA ishlatib ko'rilganda esa, ikkalasi
 * (mening tashqi pauza va slick'ning ichki drag'i) bir-biriga xalaqit berib, tortish umuman
 * ishlamay qoldi — shuning uchun slick'ning drag'i butunlay o'chirilib, tortish ham shu yerda,
 * pointer hodisalari orqali, yagona manba sifatida amalga oshiriladi.
 *
 * Ishlash tartibi: doimiy bir xil ritmda (`AUTOPLAY_INTERVAL_MS`) keyingi slaydga o'tadi;
 * foydalanuvchi tortishni boshlasa (`handlePointerDown`) yoki strelka bossa (`handleInteraction`)
 * — avtomatik aylanish darhol to'xtaydi va `INTERACTION_PAUSE_MS` (5 soniya) jim turgandan
 * keyin o'zi qayta boshlaydi. Shu oraliqda yana interaksiya bo'lsa, kutish vaqti yangidan
 * boshlanadi — ikkita harakat hech qachon to'qnashib qolmaydi.
 */
export function useCarouselAutoplay(carouselRef: RefObject<CarouselRef | null>, enabled: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragStartXRef = useRef<number | null>(null);

  function stopInterval() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function startInterval() {
    stopInterval();
    intervalRef.current = setInterval(() => {
      carouselRef.current?.next();
    }, AUTOPLAY_INTERVAL_MS);
  }

  useEffect(() => {
    if (!enabled) return undefined;
    startInterval();
    return () => {
      stopInterval();
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  function pauseAndScheduleResume() {
    if (!enabled) return;
    stopInterval();
    if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = setTimeout(startInterval, INTERACTION_PAUSE_MS);
  }

  /** Strelka tugmalari uchun — faqat pauzani ishga tushiradi, navigatsiyani tugmaning o'zi qiladi. */
  function handleInteraction() {
    pauseAndScheduleResume();
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartXRef.current = e.clientX;
    pauseAndScheduleResume();
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    dragStartXRef.current = null;
    if (deltaX < -SWIPE_THRESHOLD_PX) carouselRef.current?.next();
    else if (deltaX > SWIPE_THRESHOLD_PX) carouselRef.current?.prev();
  }

  return { handleInteraction, handlePointerDown, handlePointerUp };
}
