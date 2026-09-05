import { useMemo, useState } from 'react';
import { App, Table, Button, Space, Tag, Input, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminProducts, useDeleteProduct } from '@/features/admin-products/hooks';
import { useCategories } from '@/features/categories/hooks';
import type { ProductAdmin } from '@/features/products/types';
import { formatDate, formatPrice } from '@/shared/lib/utils';
import { Pagination } from '@/shared/ui/Pagination';
import { CategorySelect } from '@/features/categories/components/CategorySelect';
import { useT } from '@/shared/i18n/useT';
import { ProductFormModal } from './ProductFormModal';

const PAGE_SIZE = 20;

export function ProductTable() {
  const [search, setSearch] = useState<string>();
  const [categoryId, setCategoryId] = useState<string>();
  const [page, setPage] = useState(1);
  const t = useT();
  const { notification } = App.useApp();

  const { data, isLoading } = useAdminProducts({ search, category_id: categoryId, page, page_size: PAGE_SIZE });
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductAdmin | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  function openCreate() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEdit(product: ProductAdmin) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleDelete(product: ProductAdmin) {
    try {
      await deleteMutation.mutateAsync(product.id);
      notification.success({ title: t('product.delete_success'), placement: 'top' });
    } catch (error) {
      notification.error({
        title: t('product.delete_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  const columns = [
    {
      title: t('product.col_image'),
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) =>
        images[0] ? (
          <img src={images[0]} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
        ) : (
          '—'
        ),
    },
    { title: t('product.col_name_uz'), dataIndex: 'name_uz', key: 'name_uz' },
    {
      title: t('product.col_category'),
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: string) => categoryNameById.get(categoryId) ?? '—',
    },
    {
      title: t('product.col_price'),
      key: 'price',
      render: (_: unknown, record: ProductAdmin) => (
        <Space orientation="vertical" size={0}>
          <span>{formatPrice(record.final_price_amount, record.price_currency)}</span>
          {record.discount_amount !== undefined && (
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 12 }}>
              {formatPrice(record.price_amount, record.price_currency)}
            </span>
          )}
        </Space>
      ),
    },
    { title: t('product.col_stock'), dataIndex: 'stock', key: 'stock' },
    {
      title: t('product.col_status'),
      key: 'status',
      render: (_: unknown, record: ProductAdmin) => (
        <Space orientation="vertical" size={4}>
          {record.deleted_at ? <Tag color="red">{t('common.deleted')}</Tag> : <Tag color="green">{t('common.active')}</Tag>}
          {!record.is_available && <Tag color="default">{t('product.out_of_stock')}</Tag>}
        </Space>
      ),
    },
    {
      title: t('common.created_at'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => formatDate(value),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: ProductAdmin) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} disabled={!!record.deleted_at}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('product.delete_title')}
            description={t('product.delete_confirm', { name: record.name_uz })}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
            disabled={!!record.deleted_at}
          >
            <Button size="small" danger disabled={!!record.deleted_at}>
              {t('common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space>
          <Input.Search
            placeholder={t('product.search_placeholder')}
            allowClear
            onSearch={(value) => {
              setSearch(value);
              setPage(1);
            }}
            style={{ width: 260 }}
          />
          <CategorySelect
            value={categoryId}
            onChange={(value) => {
              setCategoryId(value);
              setPage(1);
            }}
            placeholder={t('common.all_categories')}
          />
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('product.new')}
        </Button>
      </Space>

      <Table rowKey="id" loading={isLoading} dataSource={data?.items} columns={columns} pagination={false} />

      {data?.pagination && <Pagination meta={data.pagination} onPageChange={setPage} />}

      <ProductFormModal open={formOpen} product={editingProduct} onClose={() => setFormOpen(false)} />
    </div>
  );
}
