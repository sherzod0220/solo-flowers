/**
 * Admin yuklaydigan rasmlarni backendga yuborishdan oldin brauzerning o'zida (Canvas orqali)
 * kichraytirish + WebP'ga aylantirish — telefon kamerasidan tushirilgan asl fayl (ko'pincha
 * 4-8MB, 3000-4000px) sahifada aslida 100-1500px oralig'ida ko'rsatiladi va WebP formatida
 * JPEG'ga qaraganda odatda 25-35% kichikroq chiqadi. Hech qanday tashqi kutubxona ishlatilmagan
 * — faqat brauzer API'lari (`createImageBitmap` + `<canvas>.toBlob`).
 */

const DEFAULT_MAX_DIMENSION = 1920;
const DEFAULT_QUALITY = 0.8;
const COMPRESSIBLE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export interface CompressImageOptions {
  /** Eng uzun tomonining piksel chegarasi — undan katta bo'lsa, nisbati saqlab kichraytiriladi. */
  maxDimension?: number;
  /** WebP siqish sifati (0–1). */
  quality?: number;
}

/**
 * Bitta faylni WebP'ga aylantirib siqadi. Format qo'llab-quvvatlanmasa, dekodlab bo'lmasa yoki
 * natija asl fayldan KATTA chiqsa (kichik/allaqachon optimallashgan rasmlarda bo'lishi mumkin)
 * — asl faylning o'zi qaytariladi, hech qachon xatolik tashlamaydi.
 */
export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<File> {
  const { maxDimension = DEFAULT_MAX_DIMENSION, quality = DEFAULT_QUALITY } = options;

  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);

    // Har doim WebP'ga aylantirishga harakat qilamiz. Brauzer WebP kodlashni qo'llamasa, `toBlob`
    // avtomatik PNG'ga tushib qoladi — shuning uchun qaror `blob.type`ning o'ziga qarab qilinadi.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
    if (!blob || blob.size >= file.size) return file;

    const ext = blob.type === 'image/webp' ? 'webp' : blob.type === 'image/png' ? 'png' : 'jpg';
    const newName = file.name.replace(/\.\w+$/, '') + '.' + ext;
    return new File([blob], newName, { type: blob.type, lastModified: Date.now() });
  } finally {
    bitmap.close();
  }
}

/** Bir nechta faylni parallel siqadi — tartib saqlanadi. */
export async function compressImages(files: File[], options?: CompressImageOptions): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}
