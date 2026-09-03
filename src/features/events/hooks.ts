import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Lang } from '@/shared/lib/apiClient';
import { useLangStore } from '@/shared/store/langStore';
import * as eventsApi from './api';
import type { CreateEventPayload, UpdateEventPayload } from './types';

const eventKeys = {
  all: ['events'] as const,
  list: (lang?: Lang) => [...eventKeys.all, 'list', lang] as const,
  admin: () => [...eventKeys.all, 'admin'] as const,
  detail: (id: string, lang?: Lang) => [...eventKeys.all, 'detail', id, lang] as const,
};

export function useEvents(lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: eventKeys.list(resolvedLang),
    queryFn: () => eventsApi.getEvents(resolvedLang),
  });
}

export function useEvent(id: string, lang?: Lang) {
  const activeLang = useLangStore((state) => state.lang);
  const resolvedLang = lang ?? activeLang;

  return useQuery({
    queryKey: eventKeys.detail(id, resolvedLang),
    queryFn: () => eventsApi.getEvent(id, resolvedLang),
    enabled: !!id,
  });
}

export function useAdminEvents() {
  return useQuery({
    queryKey: eventKeys.admin(),
    queryFn: () => eventsApi.getAdminEvents(),
  });
}

function useInvalidateEvents() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: eventKeys.all });
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (payload: CreateEventPayload) => eventsApi.createEvent(payload),
    onSuccess: invalidate,
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateEventPayload }) =>
      eventsApi.updateEvent(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: (id: string) => eventsApi.deleteEvent(id),
    onSuccess: invalidate,
  });
}
