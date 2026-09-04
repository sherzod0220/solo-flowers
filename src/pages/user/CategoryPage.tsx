import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, Col, Input, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCategory } from '@/features/categories/hooks';
import { useProducts } from '@/features/products/hooks';
import { ProductCard } from '@/features/products/components/ProductCard';
import { Pagination } from '@/shared/ui/Pagination';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { ROUTES } from '@/shared/constants/routes';

const PAGE_SIZE = 12;
const SKELETON_COUNT = 8;

export function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const t = useT();
  const debouncedSearch = useDebounce(search, 400);

  const { data: category, isLoading: isCategoryLoading } = useCategory(id ?? '');
  const { data, isLoading: isProductsLoading } = useProducts({
    category_id: id,
    search: debouncedSearch || undefined,
    page,
    page_size: PAGE_SIZE,
  });

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  if (!isCategoryLoading && !category) {
    return <EmptyState description={t('common.products_not_found')} />;
  }

  return (
    <div>
      {category && <PageMeta title={`${category.name} — Solo`} />}

      <Link
        to={ROUTES.HOME}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}
      >
        <ArrowLeftOutlined /> {t('common.back_to_home')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 16 }}>
        {category?.name ?? ' '}
      </h1>

      <Input.Search
        placeholder={t('common.search_in_category')}
        value={search}
        onChange={(event) => handleSearchChange(event.target.value)}
        allowClear
        style={{ maxWidth: 320, marginBottom: 24 }}
      />

      {isProductsLoading ? (
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
