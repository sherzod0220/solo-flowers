import { useState } from 'react';
import { Card, Col, Row } from 'antd';
import { EventBanner } from '@/features/events/components/EventBanner';
import { ProductFilterBar } from '@/features/products/components/ProductFilterBar';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useProducts } from '@/features/products/hooks';
import { Pagination } from '@/shared/ui/Pagination';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

const PAGE_SIZE = 12;
const SKELETON_COUNT = 8;

export function HomePage() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string>();
  const [page, setPage] = useState(1);
  const t = useT();

  const { data, isLoading } = useProducts({
    search: search || undefined,
    category_id: categoryId,
    page,
    page_size: PAGE_SIZE,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(value?: string) {
    setCategoryId(value);
    setPage(1);
  }

  return (
    <div>
      <PageMeta title={t('meta.home_title')} description={t('meta.home_description')} />

      <EventBanner />

      <ProductFilterBar categoryId={categoryId} onSearchChange={handleSearchChange} onCategoryChange={handleCategoryChange} />

      {isLoading ? (
        <Row gutter={[16, 16]}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Col key={index} xs={12} sm={8} md={6}>
              <Card loading style={{ borderRadius: 12 }} />
            </Col>
          ))}
        </Row>
      ) : data && data.items.length > 0 ? (
        <>
          <Row gutter={[16, 16]}>
            {data.items.map((product) => (
              <Col key={product.id} xs={12} sm={8} md={6}>
                <ProductCard product={product} />
              </Col>
            ))}
          </Row>

          <Pagination meta={data.pagination} onPageChange={setPage} />
        </>
      ) : (
        <EmptyState description={t('common.products_not_found')} />
      )}
    </div>
  );
}
