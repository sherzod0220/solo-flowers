import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { Wishlist } from './types';

/** Faqat tizimga kirgan foydalanuvchi uchun. */
export function getWishlist() {
  return unwrap<Wishlist>(apiClient.get('/wishlist'));
}

export function addToWishlist(productId: string) {
  return unwrap<null>(apiClient.post(`/wishlist/items/${productId}`));
}

export function removeFromWishlist(productId: string) {
  return unwrap<null>(apiClient.delete(`/wishlist/items/${productId}`));
}
