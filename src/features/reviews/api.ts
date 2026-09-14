import { apiClient, unwrap, type PaginatedResponse } from '@/shared/lib/apiClient';
import type { Review, SubmitReviewPayload } from './types';

export interface GetProductReviewsParams {
  page?: number;
  page_size?: number;
}

/** Ochiq — autentifikatsiya shart emas. */
export function getProductReviews(productId: string, params: GetProductReviewsParams = {}) {
  return unwrap<PaginatedResponse<Review>>(apiClient.get(`/products/${productId}/reviews`, { params }));
}

/**
 * Faqat shu mahsulotni sotib olib, "Delivered" holatidagi buyurtmasi bo'lgan foydalanuvchi uchun
 * (403 aks holda), va bitta mahsulotga faqat bitta marta (409 takroriy urinishda).
 */
export function submitReview(payload: SubmitReviewPayload) {
  return unwrap<Review>(apiClient.post('/reviews', payload));
}
