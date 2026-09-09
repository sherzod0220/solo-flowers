import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { CartView } from './types';

/** Faqat tizimga kirgan foydalanuvchi uchun. */
export function getCart() {
  return unwrap<CartView>(apiClient.get('/cart'));
}

export function addCartItem(productId: string, quantity: number) {
  return unwrap<null>(apiClient.post('/cart/items', { product_id: productId, quantity }));
}

/** Miqdorni yangi qiymatga o'rnatadi (increment/decrement emas). */
export function updateCartItemQuantity(productId: string, quantity: number) {
  return unwrap<null>(apiClient.put(`/cart/items/${productId}`, { quantity }));
}

export function removeCartItem(productId: string) {
  return unwrap<null>(apiClient.delete(`/cart/items/${productId}`));
}
