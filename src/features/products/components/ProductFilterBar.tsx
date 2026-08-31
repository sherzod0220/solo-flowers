import { useEffect, useState } from 'react';
import { Input } from 'antd';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { CategorySelect } from '@/features/categories/components/CategorySelect';

interface ProductFilterBarProps {
  categoryId?: string;
  onSearchChange: (search: string) => void;
  onCategoryChange: (categoryId?: string) => void;
}

export function ProductFilterBar({ categoryId, onSearchChange, onCategoryChange }: ProductFilterBarProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    onSearchChange(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      <Input.Search
        placeholder="Mahsulot qidirish..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        allowClear
        style={{ maxWidth: 320 }}
      />
      <CategorySelect value={categoryId} onChange={onCategoryChange} placeholder="Barcha kategoriyalar" />
    </div>
  );
}
