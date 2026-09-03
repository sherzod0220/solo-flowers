import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '@/shared/lib/apiClient';

interface LangState {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

/** Storefront'da tanlangan til — localStorage'da saqlanadi, sahifa yangilansa ham eslab qoladi. */
export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'uz',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'solo_shop_lang' },
  ),
);
