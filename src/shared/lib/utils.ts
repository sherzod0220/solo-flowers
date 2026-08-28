/**
 * Backend narxlarni eng kichik pul birligida (tiyin) qaytaradi — shu funksiya
 * uni so'mga o'girib, valyuta bilan formatlab beradi (masalan 15000000 -> "150 000 UZS").
 */
export function formatPrice(amountInTiyin: number, currency = 'UZS'): string {
  const amount = amountInTiyin / 100;
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
