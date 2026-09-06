import { Link } from 'react-router-dom';
import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';

interface CategoryNavMenuProps {
  /** `dropdown` — desktop navbar uchun, `list` — mobil Drawer menyusi uchun tekis ro'yxat. */
  variant?: 'dropdown' | 'list';
  onNavigate?: () => void;
}

/** Navbar'dagi "Katalog" bo'limi — kategoriyalar ro'yxatini ko'rsatadi, bosilsa shu kategoriyaga o'tadi. */
export function CategoryNavMenu({ variant = 'dropdown', onNavigate }: CategoryNavMenuProps) {
  const { data: categories } = useCategories();
  const t = useT();

  if (variant === 'list') {
    return (
      <div>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--color-primary)' }}>{t('nav.catalog')}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {categories?.map((category) => (
            <Link
              key={category.id}
              to={ROUTES.CATEGORY.replace(':id', category.id)}
              onClick={onNavigate}
              style={{ padding: '6px 0', color: 'var(--color-text)' }}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const items = (categories ?? []).map((category) => ({
    key: category.id,
    label: <Link to={ROUTES.CATEGORY.replace(':id', category.id)}>{category.name}</Link>,
  }));

  return (
    <Dropdown menu={{ items }} trigger={['hover', 'click']}>
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {t('nav.catalog')} <DownOutlined style={{ fontSize: 10 }} />
      </span>
    </Dropdown>
  );
}
