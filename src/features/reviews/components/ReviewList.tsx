import { useState } from 'react';
import { Rate, Skeleton } from 'antd';
import { useProductReviews } from '../hooks';
import { formatDate } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Pagination } from '@/shared/ui/Pagination';
import { useT } from '@/shared/i18n/useT';

const PAGE_SIZE = 10;

interface ReviewListProps {
  productId: string;
}

export function ReviewList({ productId }: ReviewListProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProductReviews(productId, { page, page_size: PAGE_SIZE });
  const t = useT();

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 3 }} />;
  }

  if (!data || data.items.length === 0) {
    return <EmptyState description={t('reviews.empty')} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.items.map((review) => (
          <div
            key={review.id}
            style={{ padding: 16, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
              <span style={{ fontSize: 13, color: 'var(--color-text)', opacity: 0.65 }}>{formatDate(review.created_at)}</span>
            </div>
            {review.comment && <p style={{ margin: 0, color: 'var(--color-text)', lineHeight: 1.6 }}>{review.comment}</p>}
          </div>
        ))}
      </div>

      <Pagination meta={data.pagination} onPageChange={setPage} />
    </div>
  );
}
