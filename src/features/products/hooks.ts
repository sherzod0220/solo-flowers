import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { Lang } from '@/shared/lib/apiClient';
import { useLangStore } from '@/shared/store/langStore';
import * as productsApi from './api';
import type { GetProductsParams } from './api';

const productKeys = {
  all: ['products'] as const,
  list: (params: GetProductsParams) => [...productKeys.all, 'list', params] as const,
  detail: (id: string, lang?: Lang) => [...productKeys.all, 'detail', id, lang] as const,
  bySlug: (slug: string, lang?: Lang) => [...productKeys.all, 'slug', slug, lang] as const,
};

export function useProducts(params: GetProductsParams = {}) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedParams = { ...params, lang: params.lang ?? activeLang };

  return useQuery({
    queryKey: productKeys.list(resolvedParams),
    queryFn: () => productsApi.getProducts(resolvedParams),
    // Sahifalash paytida eski ro'yxat ekranda turadi, "yaltillash" bo'lmaydi.
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string, lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: productKeys.detail(id, resolvedLang),
    queryFn: () => productsApi.getProductById(id, resolvedLang),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string, lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: productKeys.bySlug(slug, resolvedLang),
    queryFn: () => productsApi.getProductBySlug(slug, resolvedLang),
    enabled: !!slug,
  });
}
