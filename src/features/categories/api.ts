import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from './types';

/** Diqqat: bu endpoint boshqa ro'yxatlardan farqli — pagination yo'q, to'g'ridan-to'g'ri massiv qaytaradi. */
export function getCategories(search?: string) {
  return unwrap<Category[]>(apiClient.get('/categories', { params: { search } }));
}

export function getCategory(id: string) {
  return unwrap<Category>(apiClient.get(`/categories/${id}`));
}

/** Faqat admin — o'chirilgan kategoriyalarni ham qaytaradi. */
export function getAdminCategories(search?: string) {
  return unwrap<Category[]>(apiClient.get('/categories/admin', { params: { search } }));
}

export function createCategory(payload: CreateCategoryPayload) {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('image', payload.image);
  return unwrap<Category>(apiClient.post('/categories', formData));
}

/** Faqat `name`ni yangilaydi — rasm yangilash uchun alohida endpoint hozircha yo'q. */
export function updateCategory(id: string, payload: UpdateCategoryPayload) {
  return unwrap<null>(apiClient.put(`/categories/${id}`, payload));
}

/** Soft delete. */
export function deleteCategory(id: string) {
  return unwrap<string>(apiClient.delete(`/categories/${id}`));
}
