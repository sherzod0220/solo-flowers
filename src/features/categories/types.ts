/** Ommaviy (public) javob — `?lang=` bo'yicha bitta tildagi nom bilan qaytadi. */
export interface Category {
  id: string;
  name: string;
  image_url: string;
  image_public_id: string;
  created_at: string;
  updated_at: string;
}

/** Faqat `/categories/admin` javobi — har doim barcha 3 tilni birga qaytaradi. */
export interface CategoryAdmin {
  id: string;
  name_uz: string;
  name_eng: string;
  name_ru: string;
  image_url: string;
  image_public_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateCategoryPayload {
  name_uz: string;
  name_eng: string;
  name_ru: string;
  image: File;
}

export interface UpdateCategoryPayload {
  name_uz?: string;
  name_eng?: string;
  name_ru?: string;
}
