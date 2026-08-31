import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as eventsApi from './api';
import type { CreateEventPayload, UpdateEventPayload } from './types';

const eventKeys = {
  all: ['events'] as const,
  list: () => [...eventKeys.all, 'list'] as const,
  admin: () => [...eventKeys.all, 'admin'] as const,
  detail: (id: string) => [...eventKeys.all, 'detail', id] as const,
};

export function useEvents() {
  return useQuery({
    queryKey: eventKeys.list(),
    queryFn: () => eventsApi.getEvents(),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getEvent(id),
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
