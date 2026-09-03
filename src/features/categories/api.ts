import { apiClient, unwrap, type Lang } from '@/shared/lib/apiClient';
import type { Category, CategoryAdmin, CreateCategoryPayload, UpdateCategoryPayload } from './types';

/** Diqqat: bu endpoint boshqa ro'yxatlardan farqli — pagination yo'q, to'g'ridan-to'g'ri massiv qaytaradi. */
export function getCategories(search?: string, lang?: Lang) {
  return unwrap<Category[]>(apiClient.get('/categories', { params: { search, lang } }));
}

export function getCategory(id: string, lang?: Lang) {
  return unwrap<Category>(apiClient.get(`/categories/${id}`, { params: { lang } }));
}

/** Faqat admin — o'chirilgan kategoriyalarni ham, har doim barcha 3 tilni ham qaytaradi (`lang` qabul qilinmaydi). */
export function getAdminCategories(search?: string) {
  return unwrap<CategoryAdmin[]>(apiClient.get('/categories/admin', { params: { search } }));
}

export function createCategory(payload: CreateCategoryPayload) {
  const formData = new FormData();
  formData.append('name_uz', payload.name_uz);
  formData.append('name_eng', payload.name_eng);
  formData.append('name_ru', payload.name_ru);
  formData.append('image', payload.image);
  return unwrap<Category>(apiClient.post('/categories', formData));
}

/** Faqat nomlarni yangilaydi — rasm yangilash uchun alohida endpoint hozircha yo'q. */
export function updateCategory(id: string, payload: UpdateCategoryPayload) {
  return unwrap<null>(apiClient.put(`/categories/${id}`, payload));
}

/** Soft delete. */
export function deleteCategory(id: string) {
  return unwrap<string>(apiClient.delete(`/categories/${id}`));
}
