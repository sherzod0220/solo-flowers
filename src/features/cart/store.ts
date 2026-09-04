import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/features/products/types';
import type { CartItem } from './types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
}

/** Savat — backendda hali savat/buyurtma endpointi yo'qligi sababli faqat client-side (localStorage) saqlanadi. */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existing = items.find((item) => item.productId === product.id);

        if (existing) {
          const nextQuantity = Math.min(existing.quantity + quantity, product.stock);
          set({
            items: items.map((item) =>
              item.productId === product.id ? { ...item, quantity: nextQuantity } : item,
            ),
          });
          return;
        }

        set({
          items: [
            ...items,
            {
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0] ?? null,
              price: product.final_price_amount,
              currency: product.price_currency,
              stock: product.stock,
              quantity: Math.min(quantity, product.stock),
            },
          ],
        });
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.productId !== productId) });
      },

      setQuantity: (productId, quantity) => {
        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) }
              : item,
          ),
        });
      },

      clear: () => set({ items: [] }),
    }),
    { name: 'solo_shop_cart' },
  ),
);
