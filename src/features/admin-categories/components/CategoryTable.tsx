import { useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminCategories, useDeleteCategory } from '@/features/categories/hooks';
import type { CategoryAdmin } from '@/features/categories/types';
import { formatDate } from '@/shared/lib/utils';
import { useT } from '@/shared/i18n/useT';
import { CategoryFormModal } from './CategoryFormModal';

export function CategoryTable() {
  const [search, setSearch] = useState<string>();
  const { data: categories, isLoading } = useAdminCategories(search);
  const deleteMutation = useDeleteCategory();
  const t = useT();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryAdmin | null>(null);

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: CategoryAdmin) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function handleDelete(category: CategoryAdmin) {
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('common.error'));
    }
  }

  const columns = [
    { title: t('category.col_name_uz'), dataIndex: 'name_uz', key: 'name_uz' },
    { title: t('category.col_name_eng'), dataIndex: 'name_eng', key: 'name_eng' },
    { title: t('category.col_name_ru'), dataIndex: 'name_ru', key: 'name_ru' },
    {
      title: t('category.col_status'),
      key: 'status',
      render: (_: unknown, record: CategoryAdmin) =>
        record.deleted_at ? <Tag color="red">{t('common.deleted')}</Tag> : <Tag color="green">{t('common.active')}</Tag>,
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
      render: (_: unknown, record: CategoryAdmin) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} disabled={!!record.deleted_at}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('category.delete_title')}
            description={t('category.delete_confirm', { name: record.name_uz })}
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
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder={t('category.search_placeholder')}
          allowClear
          onSearch={setSearch}
          style={{ width: 280 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('category.new')}
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        dataSource={categories}
        columns={columns}
        pagination={false}
      />

      <CategoryFormModal open={formOpen} category={editingCategory} onClose={() => setFormOpen(false)} />
    </div>
  );
}
