import { useMemo, useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminEvents, useDeleteEvent } from '@/features/events/hooks';
import { useCategories } from '@/features/categories/hooks';
import type { Event } from '@/features/events/types';
import { formatDate } from '@/shared/lib/utils';
import { EventFormModal } from './EventFormModal';

export function EventTable() {
  const { data: events, isLoading } = useAdminEvents();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteEvent();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  function openCreate() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEdit(event: Event) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  async function handleDelete(event: Event) {
    try {
      await deleteMutation.mutateAsync(event.id);
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    }
  }

  const columns = [
    {
      title: 'Rasm',
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
      ),
    },
    { title: 'Sarlavha', dataIndex: 'title', key: 'title' },
    {
      title: 'Kategoriya',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: string) => categoryNameById.get(categoryId) ?? '—',
    },
    {
      title: 'Bosh banner',
      dataIndex: 'is_root',
      key: 'is_root',
      render: (isRoot: boolean) => (isRoot ? <Tag color="gold">Ha</Tag> : '—'),
    },
    {
      title: 'Holati',
      key: 'status',
      render: (_: unknown, record: Event) =>
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
      render: (_: unknown, record: Event) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} disabled={!!record.deleted_at}>
            Tahrirlash
          </Button>
          <Popconfirm
            title="Eventni o'chirish"
            description={`"${record.title}"ni o'chirmoqchimisiz?`}
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
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Yangi event
        </Button>
      </Space>

      <Table rowKey="id" loading={isLoading} dataSource={events} columns={columns} pagination={false} />

      <EventFormModal open={formOpen} event={editingEvent} onClose={() => setFormOpen(false)} />
    </div>
  );
}
