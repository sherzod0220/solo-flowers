import { apiClient, unwrap } from '@/shared/lib/apiClient';
import type { CreateEventPayload, Event, UpdateEventPayload } from './types';

export function getEvents() {
  return unwrap<Event[]>(apiClient.get('/events'));
}

export function getEvent(id: string) {
  return unwrap<Event>(apiClient.get(`/events/${id}`));
}

/** Faqat admin — o'chirilgan eventlarni ham qaytaradi. */
export function getAdminEvents() {
  return unwrap<Event[]>(apiClient.get('/events/admin'));
}

export function createEvent(payload: CreateEventPayload) {
  const formData = new FormData();
  if (payload.eyebrow) formData.append('eyebrow', payload.eyebrow);
  formData.append('title', payload.title);
  if (payload.subtitle) formData.append('subtitle', payload.subtitle);
  if (payload.cta) formData.append('cta', payload.cta);
  formData.append('category_id', payload.category_id);
  if (payload.is_root !== undefined) formData.append('is_root', String(payload.is_root));
  formData.append('image', payload.image);
  return unwrap<Event>(apiClient.post('/events', formData));
}

/** Faqat matn maydonlarini yangilaydi — rasm yangilash uchun alohida endpoint hozircha yo'q. */
export function updateEvent(id: string, payload: UpdateEventPayload) {
  return unwrap<null>(apiClient.put(`/events/${id}`, payload));
}

/** Soft delete. */
export function deleteEvent(id: string) {
  return unwrap<string>(apiClient.delete(`/events/${id}`));
}
