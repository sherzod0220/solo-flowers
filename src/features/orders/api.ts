import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { CheckoutPayload, CreateManualOrderPayload, DeliveryStatus, Order, PaymentStatus } from './types';

/** Joriy foydalanuvchining savatini buyurtmaga aylantiradi — mahsulotlar ro'yxati kerak emas, backend savatning o'zini oladi. */
export function checkout(payload: CheckoutPayload) {
  return unwrap<Order>(apiClient.post('/checkout', payload));
}

export function getMyOrders() {
  return unwrap<Order[]>(apiClient.get('/orders'));
}

export function getOrderById(id: string) {
  return unwrap<Order>(apiClient.get(`/orders/${id}`));
}

/** Faqat admin. */
export function getAdminOrders() {
  return unwrap<Order[]>(apiClient.get('/orders/admin'));
}

/** Faqat oldinga qarab o'zgaradi (backend tekshiradi) — faqat admin. */
export function updateDeliveryStatus(id: string, status: DeliveryStatus) {
  return unwrap<Order>(apiClient.patch(`/orders/${id}/delivery-status`, { status }));
}

/** Faqat admin. */
export function updatePaymentStatus(id: string, status: PaymentStatus) {
  return unwrap<Order>(apiClient.patch(`/orders/${id}/payment-status`, { status }));
}

/** Faqat `preparing` bosqichida ishlaydi (backend tekshiradi), zaxirani avtomatik qaytaradi — faqat admin. */
export function cancelOrder(id: string) {
  return unwrap<Order>(apiClient.patch(`/admin/orders/${id}/cancel`));
}

/** Cart'siz, to'g'ridan-to'g'ri buyurtma yaratadi (telefon/offline savdo) — faqat admin. */
export function createManualOrder(payload: CreateManualOrderPayload) {
  return unwrap<Order>(apiClient.post('/admin/orders', payload));
}
