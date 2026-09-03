import { Select } from 'antd';
import { useT } from '@/shared/i18n/useT';
import { useCategories } from '../hooks';

interface CategorySelectProps {
  value?: string;
  /** AntD `Form.Item` ichida ishlatilganda forma bu prop'larni o'zi in'ektsiya qiladi. */
  onChange?: (value?: string) => void;
  placeholder?: string;
  id?: string;
}

/** Kategoriya bo'yicha filtrlash/tanlash uchun umumiy dropdown (mahsulot formasi va filter panelida ishlatiladi). */
export function CategorySelect({ value, onChange, placeholder, id }: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories();
  const t = useT();

  return (
    <Select
      id={id}
      allowClear
      placeholder={placeholder ?? t('common.category')}
      value={value}
      onChange={onChange}
      loading={isLoading}
      style={{ minWidth: 200 }}
      options={categories?.map((category) => ({ value: category.id, label: category.name }))}
    />
  );
}
