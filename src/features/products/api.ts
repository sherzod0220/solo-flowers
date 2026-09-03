import { apiClient, unwrap, type Lang, type PaginatedResponse } from '@/shared/lib/apiClient';
import type { Product } from './types';

export interface GetProductsParams {
  search?: string;
  category_id?: string;
  lang?: Lang;
  page?: number;
  page_size?: number;
}

export function getProducts(params: GetProductsParams = {}) {
  return unwrap<PaginatedResponse<Product>>(apiClient.get('/products', { params }));
}

export function getProductById(id: string, lang?: Lang) {
  return unwrap<Product>(apiClient.get(`/products/${id}`, { params: { lang } }));
}

/** SEO-friendly mahsulot sahifasi (`/product/{slug}`) uchun. */
export function getProductBySlug(slug: string, lang?: Lang) {
  return unwrap<Product>(apiClient.get(`/products/slug/${slug}`, { params: { lang } }));
}
