import { Select } from 'antd';
import { useCategories } from '../hooks';

interface CategorySelectProps {
  value?: string;
  /** AntD `Form.Item` ichida ishlatilganda forma bu prop'ni o'zi in'ektsiya qiladi. */
  onChange?: (value?: string) => void;
  placeholder?: string;
}

/** Kategoriya bo'yicha filtrlash/tanlash uchun umumiy dropdown (mahsulot formasi va filter panelida ishlatiladi). */
export function CategorySelect({ value, onChange, placeholder = 'Kategoriya' }: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories();

  return (
    <Select
      allowClear
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      loading={isLoading}
      style={{ minWidth: 200 }}
      options={categories?.map((category) => ({ value: category.id, label: category.name }))}
    />
  );
}
