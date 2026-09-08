import { useQueries } from '@tanstack/react-query';
import { Card, Col, Row } from 'antd';
import { useWishlist } from '@/features/wishlist/hooks';
import * as productsApi from '@/features/products/api';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useLangStore } from '@/shared/store/langStore';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

const SKELETON_COUNT = 8;

/**
 * `GET /wishlist` faqat `product_id` + `added_at` qaytaradi (to'liq mahsulot ma'lumoti emas),
 * shuning uchun har bir ID uchun alohida (lekin parallel) `getProductById` so'rovi yuboriladi.
 */
export function WishlistPage() {
  const t = useT();
  const lang = useLangStore((state) => state.lang);
  const { data: wishlist, isLoading: isWishlistLoading } = useWishlist();

  const productQueries = useQueries({
    queries: (wishlist?.items ?? []).map((item) => ({
      queryKey: ['products', 'detail', item.product_id, lang],
      queryFn: () => productsApi.getProductById(item.product_id, lang),
    })),
  });

  const isProductsLoading = productQueries.length > 0 && productQueries.some((query) => query.isLoading);
  const products = productQueries.map((query) => query.data).filter((product) => !!product);

  return (
    <div>
      <PageMeta title={`${t('wishlist.title')} — Solo`} />

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 24 }}>
        {t('wishlist.title')}
      </h1>

      {isWishlistLoading || isProductsLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Col key={index} xs={12} sm={8} md={6}>
              <Card loading style={{ borderRadius: 12 }} />
            </Col>
          ))}
        </Row>
      ) : products.length > 0 ? (
        <Row gutter={[16, 16]}>
          {products.map((product) => (
            <Col key={product.id} xs={12} sm={8} md={6}>
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      ) : (
        <EmptyState description={t('wishlist.empty')} />
      )}
    </div>
  );
}
