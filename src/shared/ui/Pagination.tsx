import { Pagination as AntPagination } from 'antd';
import type { PaginationMeta } from '@/shared/lib/apiClient';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.total_pages <= 1) return null;

  return (
    <AntPagination
      current={meta.page}
      pageSize={meta.page_size}
      total={meta.total_items}
      onChange={onPageChange}
      showSizeChanger={false}
      style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}
    />
  );
}
