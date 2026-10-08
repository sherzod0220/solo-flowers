// Butun saytdagi animatsiyalar uchun umumiy egri chiziq (ease-out) — tez boshlanib, yumshoq to'xtaydi.
// Barcha animatsiyalar shu bitta ritmda bo'lsa, sayt "bir butun" va professional ko'rinadi.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const SITE_INTRO_KEY = 'solo-intro-seen';

/**
 * Logo intro'si sessiya davomida faqat bir marta (birinchi kirishda) ko'rsatiladi — har sahifa
 * yangilanishida qayta chiqib, foydalanuvchini kuttirmasligi uchun. "Harakatni kamaytirish"
 * yoqilgan bo'lsa umuman ko'rsatilmaydi. Storage bloklangan bo'lsa (private rejim) — xavfsiz ravishda o'tkaziladi.
 */
export function shouldShowSiteIntro(): boolean {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return sessionStorage.getItem(SITE_INTRO_KEY) !== '1';
  } catch {
    return false;
  }
}

export function markSiteIntroSeen() {
  try {
    sessionStorage.setItem(SITE_INTRO_KEY, '1');
  } catch {
    // Storage mavjud bo'lmasa — intro keyingi safar yana ko'rinadi, bu xato emas.
  }
}
