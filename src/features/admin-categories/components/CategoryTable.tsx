import { useState } from 'react';
import { Table, Button, Space, Tag, Input, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminCategories, useDeleteCategory } from '@/features/categories/hooks';
import type { Category } from '@/features/categories/types';
import { formatDate } from '@/shared/lib/utils';
import { CategoryFormModal } from './CategoryFormModal';

export function CategoryTable() {
  const [search, setSearch] = useState<string>();
  const { data: categories, isLoading } = useAdminCategories(search);
  const deleteMutation = useDeleteCategory();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  function openCreate() {
    setEditingCategory(null);
    setFormOpen(true);
  }

  function openEdit(category: Category) {
    setEditingCategory(category);
    setFormOpen(true);
  }

  async function handleDelete(category: Category) {
    try {
      await deleteMutation.mutateAsync(category.id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    }
  }

  const columns = [
    { title: 'Nomi', dataIndex: 'name', key: 'name' },
    {
      title: 'Holati',
      key: 'status',
      render: (_: unknown, record: Category) =>
        record.deleted_at ? <Tag color="red">O'chirilgan</Tag> : <Tag color="green">Faol</Tag>,
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => formatDate(value),
    },
    {
      title: '',
      key: 'actions',
      render: (_: unknown, record: Category) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} disabled={!!record.deleted_at}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Kategoriyani o'chirish"
            description={`"${record.name}"ni o'chirmoqchimisiz?`}
            okText="O'chirish"
            cancelText="Bekor qilish"
            okButtonProps={{ danger: true }}
            onConfirm={() => handleDelete(record)}
            disabled={!!record.deleted_at}
          >
            <Button size="small" danger disabled={!!record.deleted_at}>
              O'chirish
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
          placeholder="Kategoriya nomi bo'yicha qidirish"
          allowClear
          onSearch={setSearch}
          style={{ width: 280 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Yangi kategoriya
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
