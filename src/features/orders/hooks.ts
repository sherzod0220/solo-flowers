import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store';
import * as ordersApi from './api';
import type { CheckoutPayload, CreateManualOrderPayload, DeliveryStatus, PaymentStatus } from './types';

const orderKeys = {
  all: ['orders'] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
  admin: ['orders', 'admin'] as const,
};

/** Faqat tizimga kirgan foydalanuvchi uchun so'rov yuboradi (backend BearerAuth talab qiladi). */
export function useMyOrders() {
  const user = useAuthStore((state) => state.user);

  return useQuery({
    queryKey: orderKeys.all,
    queryFn: ordersApi.getMyOrders,
    enabled: !!user,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
  });
}

/** Muvaffaqiyatdan keyin savat (endi bo'sh) va buyurtmalar ro'yxati cache'larini yangilaydi. */
export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => ordersApi.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Faqat admin — `OrdersListPage`da ishlatiladi (route allaqachon `RequireAdmin` bilan himoyalangan). */
export function useAdminOrders() {
  return useQuery({
    queryKey: orderKeys.admin,
    queryFn: ordersApi.getAdminOrders,
  });
}

/** Mijoz o'z buyurtmalarini ko'rib turgan bo'lsa ham eskirmasin deb, ikkala ro'yxat (mijoz + admin) birga yangilanadi. */
function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: orderKeys.all });
}

export function useUpdateDeliveryStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DeliveryStatus }) => ordersApi.updateDeliveryStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useUpdatePaymentStatus() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) => ordersApi.updatePaymentStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useCancelOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: invalidate,
  });
}

export function useCreateManualOrder() {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (payload: CreateManualOrderPayload) => ordersApi.createManualOrder(payload),
    onSuccess: invalidate,
  });
}
