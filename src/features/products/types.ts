export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: ProductCategory;
  stock: number;        // omborda qolgan soni
  isFeatured?: boolean;  // bosh sahifada "tavsiya etilgan" sifatida ko'rsatish uchun
}

export type ProductCategory = 'bouquet' | 'potted' | 'gift-set' | 'wedding';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  bouquet: 'Guldasta',
  potted: 'Tuvakdagi gul',
  'gift-set': 'Sovg\'a to\'plami',
  wedding: 'To\'y uchun',
};