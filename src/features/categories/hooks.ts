import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Lang } from '@/shared/lib/apiClient';
import { useLangStore } from '@/shared/store/langStore';
import * as categoriesApi from './api';
import type { CreateCategoryPayload, UpdateCategoryPayload } from './types';

const categoryKeys = {
  all: ['categories'] as const,
  list: (search?: string, lang?: Lang) => [...categoryKeys.all, 'list', search, lang] as const,
  admin: (search?: string) => [...categoryKeys.all, 'admin', search] as const,
  detail: (id: string, lang?: Lang) => [...categoryKeys.all, 'detail', id, lang] as const,
};

export function useCategories(search?: string, lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: categoryKeys.list(search, resolvedLang),
    queryFn: () => categoriesApi.getCategories(search, resolvedLang),
  });
}

export function useCategory(id: string, lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: categoryKeys.detail(id, resolvedLang),
    queryFn: () => categoriesApi.getCategory(id, resolvedLang),
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
