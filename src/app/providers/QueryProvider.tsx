import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 daqiqa — bu vaqt ichida data "eski" hisoblanmaydi, qayta so'rov yubormaydi
      retry: 1,             // xato bo'lsa, faqat 1 marta qayta urinib ko'radi
    },
  },
});

export function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}