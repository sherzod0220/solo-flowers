/** `GET /cart` javobidagi bitta savat elementi — rasm va slug bu shaklda yo'q (`hooks.ts`dagi `useCartItemsWithProducts` qarang). */
export interface CartItemView {
  product_id: string;
  product_name: string;
  unit_price: number;
  discount_price?: number;
  quantity: number;
  /** Discount bo'lsa discount narxidan, aks holda asl narxdan hisoblangan (serverda hisoblanadi). */
  subtotal: number;
  available: boolean;
  currency: string;
}

export interface CartView {
  items: CartItemView[];
  total_items: number;
  total_price: number;
}
