/**
 * Backend narxni to'g'ridan-to'g'ri so'mda qaytaradi (konversiya kerak emas) —
 * shu funksiya uni valyuta bilan formatlab beradi (masalan 150000 -> "150 000 UZS").
 */
export function formatPrice(amount: number, currency = 'UZS'): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(isoString));
}
