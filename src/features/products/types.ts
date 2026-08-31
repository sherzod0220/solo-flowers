export type PackagingType = 'bucket' | 'box' | 'vase';

export const PACKAGING_LABELS: Record<PackagingType, string> = {
  bucket: "Chelakda",
  box: 'Qutida',
  vase: 'Vazada',
};

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Cloudinary CDN URL'lari, eng ko'pi bilan 5 ta. Bo'sh bo'lishi mumkin. */
  images: string[];
  video_url_youtube: string;
  video_url_instagram: string;
  category_id: string;
  /** Barcha narx maydonlari eng kichik pul birligida (tiyin). */
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
  flower_types: string[];
  color: string;
  stem_count: number;
  packaging_type: PackagingType;
  freshness_lifespan: number;
  care_instructions: string | null;
  occasions: string[];
  /** Hozircha backendda doim `null` — kelajakdagi funksiya uchun joy. */
  allow_custom_card: null;
  compatible_addons: string[];
  created_at: string;
  updated_at: string;
  /** Faqat `/products/admin` javobida keladi. */
  deleted_at?: string | null;
}
