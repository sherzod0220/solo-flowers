/** Ommaviy (public) javob — `?lang=` bo'yicha bitta tildagi matnlar bilan qaytadi. */
export interface Event {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  /** Cloudinary CDN URL'i — to'g'ridan-to'g'ri `<img src>` sifatida ishlatiladi. */
  image: string;
  category_id: string;
  /** `true` bo'lsa `GET /events`da birinchi bo'lib chiqadi — saralash backendda bajariladi. */
  is_root: boolean;
  created_at: string;
  updated_at: string;
}

/** Faqat `/events/admin` javobi — har doim barcha 3 tilni birga qaytaradi. */
export interface EventAdmin {
  id: string;
  eyebrow_uz: string;
  eyebrow_eng: string;
  eyebrow_ru: string;
  title_uz: string;
  title_eng: string;
  title_ru: string;
  subtitle_uz: string;
  subtitle_eng: string;
  subtitle_ru: string;
  cta_uz: string;
  cta_eng: string;
  cta_ru: string;
  image: string;
  category_id: string;
  is_root: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateEventPayload {
  eyebrow_uz?: string;
  eyebrow_eng?: string;
  eyebrow_ru?: string;
  title_uz: string;
  title_eng: string;
  title_ru: string;
  subtitle_uz?: string;
  subtitle_eng?: string;
  subtitle_ru?: string;
  cta_uz?: string;
  cta_eng?: string;
  cta_ru?: string;
  category_id: string;
  is_root?: boolean;
  image: File;
}

export interface UpdateEventPayload {
  eyebrow_uz?: string;
  eyebrow_eng?: string;
  eyebrow_ru?: string;
  title_uz?: string;
  title_eng?: string;
  title_ru?: string;
  subtitle_uz?: string;
  subtitle_eng?: string;
  subtitle_ru?: string;
  cta_uz?: string;
  cta_eng?: string;
  cta_ru?: string;
  category_id?: string;
  is_root?: boolean;
}
