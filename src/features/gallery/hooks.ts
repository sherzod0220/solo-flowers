import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as galleryApi from './api';
import type { GetGalleryParams } from './api';

const galleryKeys = {
  all: ['gallery'] as const,
  list: (params: GetGalleryParams) => [...galleryKeys.all, 'list', params] as const,
};

export function useGallery(params: GetGalleryParams = {}) {
  return useQuery({
    queryKey: galleryKeys.list(params),
    queryFn: () => galleryApi.getGallery(params),
    // Sahifalash paytida eski ro'yxat ekranda turadi, "yaltillash" bo'lmaydi.
    placeholderData: keepPreviousData,
  });
}

function useInvalidateGallery() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: galleryKeys.all });
}

export function useCreateGalleryPost() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: ({ images, description }: { images: File[]; description?: string }) =>
      galleryApi.createGalleryPost(images, description),
    onSuccess: invalidate,
  });
}

export function useDeleteGalleryPost() {
  const invalidate = useInvalidateGallery();
  return useMutation({
    mutationFn: (id: string) => galleryApi.deleteGalleryPost(id),
    onSuccess: invalidate,
  });
}
