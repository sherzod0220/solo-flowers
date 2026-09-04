/** Backendda savat/buyurtma endpointi hali yo'q — savat faqat client-side (localStorage) saqlanadi. */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  /** Qo'shilgan paytdagi `final_price_amount` — narx keyin o'zgarsa ham savatdagi narx o'zgarmaydi. */
  price: number;
  currency: string;
  stock: number;
  quantity: number;
}
