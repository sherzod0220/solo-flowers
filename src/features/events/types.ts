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
  /** Faqat `/events/admin` javobida keladi. */
  deleted_at?: string | null;
}

export interface CreateEventPayload {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  category_id: string;
  is_root?: boolean;
  image: File;
}

export interface UpdateEventPayload {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  category_id?: string;
  is_root?: boolean;
}
