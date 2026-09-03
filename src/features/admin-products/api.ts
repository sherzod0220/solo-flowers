import { apiClient, unwrap, type PaginatedResponse } from '@/shared/lib/apiClient';
import type { CreateProductPayload, Product, ProductAdmin, UpdateProductPayload } from '@/features/products/types';

export interface GetAdminProductsParams {
  search?: string;
  category_id?: string;
  page?: number;
  page_size?: number;
}

/** Faqat admin — o'chirilgan mahsulotlarni ham, har doim barcha 3 tilni ham qaytaradi (`lang` qabul qilinmaydi). */
export function getAdminProducts(params: GetAdminProductsParams = {}) {
  return unwrap<PaginatedResponse<ProductAdmin>>(apiClient.get('/products/admin', { params }));
}

export function createProduct(payload: CreateProductPayload) {
  const formData = new FormData();
  formData.append('name_uz', payload.name_uz);
  formData.append('name_eng', payload.name_eng);
  formData.append('name_ru', payload.name_ru);
  if (payload.description_uz) formData.append('description_uz', payload.description_uz);
  if (payload.description_eng) formData.append('description_eng', payload.description_eng);
  if (payload.description_ru) formData.append('description_ru', payload.description_ru);
  formData.append('category_id', payload.category_id);
  formData.append('amount', String(payload.amount));
  formData.append('currency', payload.currency);
  if (payload.discount_amount !== undefined) formData.append('discount_amount', String(payload.discount_amount));
  if (payload.slug) formData.append('slug', payload.slug);
  if (payload.is_available !== undefined) formData.append('is_available', String(payload.is_available));
  if (payload.rating !== undefined) formData.append('rating', String(payload.rating));
  if (payload.stock !== undefined) formData.append('stock', String(payload.stock));
  if (payload.tag_uz) formData.append('tag_uz', payload.tag_uz);
  if (payload.tag_eng) formData.append('tag_eng', payload.tag_eng);
  if (payload.tag_ru) formData.append('tag_ru', payload.tag_ru);
  payload.images?.forEach((file) => formData.append('images', file));
  return unwrap<Product>(apiClient.post('/products', formData));
}

/** Faqat matn/raqam maydonlarini yangilaydi — rasmlarni yangilash uchun alohida endpoint hozircha yo'q. */
export function updateProduct(id: string, payload: UpdateProductPayload) {
  return unwrap<null>(apiClient.put(`/products/${id}`, payload));
}

/** Soft delete. */
export function deleteProduct(id: string) {
  return unwrap<string>(apiClient.delete(`/products/${id}`));
}
