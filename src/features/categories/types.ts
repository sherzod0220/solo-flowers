export interface Category {
  id: string;
  name: string;
  /** Backendda hozircha har doim `null` — ierarxiya (parent/child) hali ishlamaydi. */
  parent_id?: string | null;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  /** Faqat `/categories/admin` javobida keladi — o'chirilgan (soft-delete) kategoriyalarda to'ldirilgan. */
  deleted_at?: string | null;
}

export interface CreateCategoryPayload {
  name: string;
  image: File;
}

export interface UpdateCategoryPayload {
  name: string;
}
