import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useAuthStore } from '@/features/auth/store';
import * as productsApi from '@/features/products/api';
import { useLangStore } from '@/shared/store/langStore';
import { useT } from '@/shared/i18n/useT';
import * as cartApi from './api';
import type { CartItemView } from './types';

const cartKeys = {
  all: ['cart'] as const,
};

/** Faqat tizimga kirgan foydalanuvchi uchun so'rov yuboradi (backend BearerAuth talab qiladi). */
export function useCart() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: cartKeys.all,
    queryFn: cartApi.getCart,
    enabled: !!user,
  });
}

function useInvalidateCart() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: cartKeys.all });
}

/**
 * Uchala mutatsiya (qo'shish/yangilash/o'chirish) uchun umumiy xato ko'rsatkichi — masalan
 * backend "requested quantity exceeds available stock" (409) qaytarsa, foydalanuvchi buni
 * ko'rmasa, InputNumber shunchaki eski qiymatga "sirli tarzda" qaytib qolgandek tuyuladi.
 */
function useCartMutationErrorHandler() {
  const { message } = App.useApp();
  const t = useT();
  return (error: unknown) => {
    message.error(error instanceof Error ? error.message : t('common.unknown_error'));
  };
}

export function useAddCartItem() {
  const invalidate = useInvalidateCart();
  const onError = useCartMutationErrorHandler();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.addCartItem(productId, quantity),
    onSuccess: invalidate,
    onError,
  });
}

export function useUpdateCartItemQuantity() {
  const invalidate = useInvalidateCart();
  const onError = useCartMutationErrorHandler();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartApi.updateCartItemQuantity(productId, quantity),
    onSuccess: invalidate,
    onError,
  });
}

export function useRemoveCartItem() {
  const invalidate = useInvalidateCart();
  const onError = useCartMutationErrorHandler();
  return useMutation({
    mutationFn: (productId: string) => cartApi.removeCartItem(productId),
    onSuccess: invalidate,
    onError,
  });
}

/** Navbar'dagi savat belgisi (badge) uchun — tizimga kirmagan foydalanuvchida har doim 0. */
export function useCartCount(): number {
  const { data } = useCart();
  return data?.total_items ?? 0;
}

export interface CartItemWithProduct extends CartItemView {
  image: string | null;
  slug: string | null;
  /** `CartItemView`da yo'q — miqdor inputiga `max` sifatida berish uchun to'liq mahsulotdan olinadi. */
  stock: number | null;
}

/**
 * `GET /cart` faqat `product_id` + narx/miqdor qaytaradi (rasm/slug yo'q), shuning uchun har bir
 * item uchun alohida (lekin parallel) `getProductById` so'rovi yuboriladi — Wishlist'dagi
 * `useQueries` yondashuvi bilan bir xil. `CartDrawer` va `CartPage`da qayta ishlatiladi.
 */
export function useCartItemsWithProducts() {
  const { data: cart, isLoading: isCartLoading } = useCart();
  const lang = useLangStore((state) => state.lang);

  const productQueries = useQueries({
    queries: (cart?.items ?? []).map((item) => ({
      queryKey: ['products', 'detail', item.product_id, lang],
      queryFn: () => productsApi.getProductById(item.product_id, lang),
    })),
  });

  const isProductsLoading = productQueries.length > 0 && productQueries.some((query) => query.isLoading);

  const items: CartItemWithProduct[] = (cart?.items ?? []).map((item, index) => ({
    ...item,
    image: productQueries[index]?.data?.images[0] ?? null,
    slug: productQueries[index]?.data?.slug ?? null,
    stock: productQueries[index]?.data?.stock ?? null,
  }));

  return {
    items,
    totalItems: cart?.total_items ?? 0,
    totalPrice: cart?.total_price ?? 0,
    isLoading: isCartLoading || isProductsLoading,
  };
}
