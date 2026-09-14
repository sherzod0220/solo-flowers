/** `ReviewResponse`da foydalanuvchi ismi/emaili yo'q — faqat `user_id`, shuning uchun UI'da muallif ko'rsatilmaydi. */
export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface SubmitReviewPayload {
  product_id: string;
  rating: number;
  comment?: string;
}
