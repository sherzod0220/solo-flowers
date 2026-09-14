import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reviewsApi from './api';
import type { GetProductReviewsParams } from './api';
import type { SubmitReviewPayload } from './types';

const reviewKeys = {
  all: ['reviews'] as const,
  product: (productId: string) => [...reviewKeys.all, 'product', productId] as const,
  productList: (productId: string, params: GetProductReviewsParams) => [...reviewKeys.product(productId), params] as const,
};

export function useProductReviews(productId: string, params: GetProductReviewsParams = {}) {
  return useQuery({
    queryKey: reviewKeys.productList(productId, params),
    queryFn: () => reviewsApi.getProductReviews(productId, params),
    enabled: !!productId,
    // Sahifalash paytida eski ro'yxat ekranda turadi, "yaltillash" bo'lmaydi.
    placeholderData: keepPreviousData,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitReviewPayload) => reviewsApi.submitReview(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.product(variables.product_id) });
    },
  });
}
