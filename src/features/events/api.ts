import { apiClient, unwrap, type Lang } from '@/shared/lib/apiClient';
import type { CreateEventPayload, Event, EventAdmin, UpdateEventPayload } from './types';

export function getEvents(lang?: Lang) {
  return unwrap<Event[]>(apiClient.get('/events', { params: { lang } }));
}

export function getEvent(id: string, lang?: Lang) {
  return unwrap<Event>(apiClient.get(`/events/${id}`, { params: { lang } }));
}

/** Faqat admin — o'chirilgan eventlarni ham, har doim barcha 3 tilni ham qaytaradi (`lang` qabul qilinmaydi). */
export function getAdminEvents() {
  return unwrap<EventAdmin[]>(apiClient.get('/events/admin'));
}

export function createEvent(payload: CreateEventPayload) {
  const formData = new FormData();
  if (payload.eyebrow_uz) formData.append('eyebrow_uz', payload.eyebrow_uz);
  if (payload.eyebrow_eng) formData.append('eyebrow_eng', payload.eyebrow_eng);
  if (payload.eyebrow_ru) formData.append('eyebrow_ru', payload.eyebrow_ru);
  formData.append('title_uz', payload.title_uz);
  formData.append('title_eng', payload.title_eng);
  formData.append('title_ru', payload.title_ru);
  if (payload.subtitle_uz) formData.append('subtitle_uz', payload.subtitle_uz);
  if (payload.subtitle_eng) formData.append('subtitle_eng', payload.subtitle_eng);
  if (payload.subtitle_ru) formData.append('subtitle_ru', payload.subtitle_ru);
  if (payload.cta_uz) formData.append('cta_uz', payload.cta_uz);
  if (payload.cta_eng) formData.append('cta_eng', payload.cta_eng);
  if (payload.cta_ru) formData.append('cta_ru', payload.cta_ru);
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
