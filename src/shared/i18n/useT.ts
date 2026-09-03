import { useLangStore } from '@/shared/store/langStore';
import { translations, type TranslationKey } from './translations';

/** Joriy tanlangan tilga qarab interfeys matnini qaytaradi. `{var}` shaklidagi joy egalarini `vars` bilan almashtiradi. */
export function useT() {
  const lang = useLangStore((state) => state.lang);

  return (key: TranslationKey, vars?: Record<string, string>) => {
    let text: string = translations[key][lang];
    if (vars) {
      for (const [name, value] of Object.entries(vars)) {
        text = text.replace(`{${name}}`, value);
      }
    }
    return text;
  };
}
