import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as categoriesApi from './api';
import type { CreateCategoryPayload, UpdateCategoryPayload } from './types';

const categoryKeys = {
  all: ['categories'] as const,
  list: (search?: string) => [...categoryKeys.all, 'list', search] as const,
  admin: (search?: string) => [...categoryKeys.all, 'admin', search] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

export function useCategories(search?: string) {
  return useQuery({
    queryKey: categoryKeys.list(search),
    queryFn: () => categoriesApi.getCategories(search),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getCategory(id),
    enabled: !!id,
  });
}

export function useAdminCategories(search?: string) {
  return useQuery({
    queryKey: categoryKeys.admin(search),
    queryFn: () => categoriesApi.getAdminCategories(search),
  });
}

function useInvalidateCategories() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: categoryKeys.all });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.createCategory(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesApi.updateCategory(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: invalidate,
  });
}
