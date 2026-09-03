import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CategorySelect } from '@/features/categories/components/CategorySelect';
import { useT } from '@/shared/i18n/useT';

interface ProductFilterBarProps {
  categoryId?: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId?: string) => void;
}

export function ProductFilterBar({ categoryId, onSearchChange, onCategoryChange }: ProductFilterBarProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const t = useT();

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      <Input.Search
        placeholder={t('common.search_products')}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <CategorySelect value={categoryId} onChange={onCategoryChange} placeholder={t('common.all_categories')} />
    </div>
  );
}
