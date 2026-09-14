/**
 * `cancelled` Swagger'dagi `UpdateDeliveryStatusRequest`/tavsiflarda hujjatlashtirilmagan, lekin
 * `PATCH /admin/orders/{id}/cancel` chaqirilgandan keyin `delivery_status` haqiqatda shu qiymatga
 * o'tishi haqiqiy backend bilan sinovda aniqlandi — admin buni o'zi qo'lda TANLAY olmaydi
 * (faqat "Bekor qilish" amali orqali yuzaga keladi), shuning uchun forward-progression ro'yxatida yo'q.
 */
export type DeliveryStatus = 'preparing' | 'handed_to_courier' | 'delivered' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid';

export interface OrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  currency: string;
}

export interface Order {
  id: string;
  user_id: string;
  address: string;
  phone: string;
  note?: string;
  items: OrderItem[];
  total_amount: number;
  total_currency: string;
  delivery_status: DeliveryStatus;
  payment_status: PaymentStatus;
  created_at: string;
}

export interface CheckoutPayload {
  address: string;
  phone: string;
  note?: string;
}

export interface ManualOrderItemPayload {
  product_id: string;
  quantity: number;
}

/** Admin tomonidan cart'siz, to'g'ridan-to'g'ri (masalan telefon/offline savdo) buyurtma yaratish. */
export interface CreateManualOrderPayload {
  address: string;
  phone: string;
  note?: string;
  items: ManualOrderItemPayload[];
  payment_status: PaymentStatus;
}
