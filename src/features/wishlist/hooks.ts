import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import * as wishlistApi from './api';

const wishlistKeys = {
  all: ['wishlist'] as const,
};

/** Faqat tizimga kirgan foydalanuvchi uchun so'rov yuboradi (backend BearerAuth talab qiladi). */
export function useWishlist() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: wishlistKeys.all,
    queryFn: wishlistApi.getWishlist,
    enabled: !!user,
  });
}

function useInvalidateWishlist() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: wishlistKeys.all });
}

export function useAddToWishlist() {
  const invalidate = useInvalidateWishlist();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: invalidate,
  });
}

export function useRemoveFromWishlist() {
  const invalidate = useInvalidateWishlist();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: invalidate,
  });
}

/** Berilgan mahsulot joriy foydalanuvchi wishlist'ida bor-yo'qligini tekshiradi (masalan yurakcha holatini bilish uchun). */
export function useIsInWishlist(productId: string): boolean {
  const { data } = useWishlist();
  return !!data?.items.some((item) => item.product_id === productId);
}

export function useWishlistCount(): number {
  const { data } = useWishlist();
  return data?.items.length ?? 0;
}
