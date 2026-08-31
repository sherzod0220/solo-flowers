import { keepPreviousData, useQuery } from '@tanstack/react-query';
import * as productsApi from './api';
import type { GetProductsParams } from './api';

const productKeys = {
  all: ['products'] as const,
  list: (params: GetProductsParams) => [...productKeys.all, 'list', params] as const,
  detail: (id: string) => [...productKeys.all, 'detail', id] as const,
  bySlug: (slug: string) => [...productKeys.all, 'slug', slug] as const,
};

export function useProducts(params: GetProductsParams = {}) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    // Sahifalash paytida eski ro'yxat ekranda turadi, "yaltillash" bo'lmaydi.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productKeys.bySlug(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
  });
}
