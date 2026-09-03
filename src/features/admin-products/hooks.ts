import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateProductPayload, UpdateProductPayload } from '@/features/products/types';
import * as adminProductsApi from './api';
import type { GetAdminProductsParams } from './api';

const adminProductKeys = {
  all: ['admin-products'] as const,
  list: (params: GetAdminProductsParams) => [...adminProductKeys.all, 'list', params] as const,
};

export function useAdminProducts(params: GetAdminProductsParams = {}) {
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => adminProductsApi.getAdminProducts(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateAdminProducts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    // Public mahsulot ro'yxati (storefront) ham eskirmasin.
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: (payload: CreateProductPayload) => adminProductsApi.createProduct(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProductPayload }) =>
      adminProductsApi.updateProduct(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateAdminProducts();
  return useMutation({
    mutationFn: (id: string) => adminProductsApi.deleteProduct(id),
    onSuccess: invalidate,
  });
}
