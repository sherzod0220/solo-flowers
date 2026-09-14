import { apiClient, unwrap, type PaginatedResponse } from '@/shared/lib/apiClient';
import type { GalleryPost } from './types';

export interface GetGalleryParams {
  page?: number;
  page_size?: number;
}

/** Ochiq — autentifikatsiya shart emas. */
export function getGallery(params: GetGalleryParams = {}) {
  return unwrap<PaginatedResponse<GalleryPost>>(apiClient.get('/gallery', { params }));
}

/** Faqat admin — eng ko'pi bilan 3 ta rasm. */
export function createGalleryPost(images: File[], description?: string) {
  const formData = new FormData();
  images.forEach((file) => formData.append('images', file));
  if (description) formData.append('description', description);
  return unwrap<GalleryPost>(apiClient.post('/admin/gallery', formData));
}

/** Faqat admin — rasmlar S3'dan ham tozalanadi. Tahrirlash (update) endpointi yo'q. */
export function deleteGalleryPost(id: string) {
  return unwrap<null>(apiClient.delete(`/admin/gallery/${id}`));
}
