/** Ommaviy (public) javob — `?lang=` bo'yicha bitta tildagi nom/tavsif/tag bilan qaytadi. */
export interface Product {
  id: string;
  name: string;
  description: string;
  /** Ixtiyoriy belgi/badge, masalan `"bestseller"`. Bo'lmasa maydon javobda umuman ko'rinmaydi. */
  tag?: string | null;
  /** Cloudinary CDN URL'lari, eng ko'pi bilan 5 ta. Bo'sh bo'lishi mumkin. */
  images: string[];
  category_id: string;
  /** Barcha narx maydonlari to'g'ridan-to'g'ri so'mda (konversiya kerak emas). */
  price_amount: number;
  price_currency: string;
  /** Chegirma bo'lmasa bu maydon javobda umuman ko'rinmaydi. */
  discount_amount?: number;
  /** Narxni ko'rsatishda har doim shundan foydalaning — chegirma bor-yo'qligidan qat'iy nazar "hozir to'lanadigan narx". */
  final_price_amount: number;
  slug: string;
  is_available: boolean;
  rating: number;
  stock: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

/** Faqat `/products/admin` javobi — har doim barcha 3 tilni birga qaytaradi. */
export interface ProductAdmin {
  id: string;
  name_uz: string;
  name_eng: string;
  name_ru: string;
  description_uz: string;
  description_eng: string;
  description_ru: string;
  tag_uz?: string | null;
  tag_eng?: string | null;
  tag_ru?: string | null;
  images: string[];
  category_id: string;
  price_amount: number;
  price_currency: string;
  discount_amount?: number;
  final_price_amount: number;
  slug: string;
  is_available: boolean;
  rating: number;
  stock: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateProductPayload {
  name_uz: string;
  name_eng: string;
  name_ru: string;
  description_uz?: string;
  description_eng?: string;
  description_ru?: string;
  category_id: string;
  /** So'mda, butun son. */
  amount: number;
  currency: string;
  discount_amount?: number;
  slug?: string;
  is_available?: boolean;
  rating?: number;
  stock?: number;
  tag_uz?: string;
  tag_eng?: string;
  tag_ru?: string;
  /** Eng ko'pi bilan 5 ta. */
  images?: File[];
}

export interface UpdateProductPayload {
  name_uz?: string;
  name_eng?: string;
  name_ru?: string;
  description_uz?: string;
  description_eng?: string;
  description_ru?: string;
  category_id?: string;
  amount?: number;
  currency?: string;
  discount_amount?: number;
  /** `true` — chegirmani `discount_amount` yubormasdan butunlay o'chiradi. */
  clear_discount?: boolean;
  slug?: string;
  is_available?: boolean;
  rating?: number;
  stock?: number;
  sold_count?: number;
  tag_uz?: string;
  tag_eng?: string;
  tag_ru?: string;
  /** `true` — mos tildagi tag'ni `null` qiladi. */
  clear_tag_uz?: boolean;
  clear_tag_eng?: boolean;
  clear_tag_ru?: boolean;
}
