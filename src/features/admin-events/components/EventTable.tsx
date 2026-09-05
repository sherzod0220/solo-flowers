import { useMemo, useState } from 'react';
import { App, Table, Button, Space, Tag, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminEvents, useDeleteEvent } from '@/features/events/hooks';
import { useCategories } from '@/features/categories/hooks';
import type { EventAdmin } from '@/features/events/types';
import { formatDate } from '@/shared/lib/utils';
import { useT } from '@/shared/i18n/useT';
import { EventFormModal } from './EventFormModal';

export function EventTable() {
  const { data: events, isLoading } = useAdminEvents();
  const { data: categories } = useCategories();
  const deleteMutation = useDeleteEvent();
  const t = useT();
  const { notification } = App.useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventAdmin | null>(null);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    categories?.forEach((category) => map.set(category.id, category.name));
    return map;
  }, [categories]);

  function openCreate() {
    setEditingEvent(null);
    setFormOpen(true);
  }

  function openEdit(event: EventAdmin) {
    setEditingEvent(event);
    setFormOpen(true);
  }

  async function handleDelete(event: EventAdmin) {
    try {
      await deleteMutation.mutateAsync(event.id);
      notification.success({ title: t('event.delete_success'), placement: 'top' });
    } catch (error) {
      notification.error({
        title: t('event.delete_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  const columns = [
    {
      title: t('event.col_image'),
      dataIndex: 'image',
      key: 'image',
      render: (image: string) => (
        <img src={image} alt="" style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8 }} />
      ),
    },
    { title: t('event.col_title_uz'), dataIndex: 'title_uz', key: 'title_uz' },
    {
      title: t('event.col_category'),
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: string) => categoryNameById.get(categoryId) ?? '—',
    },
    {
      title: t('event.col_root'),
      dataIndex: 'is_root',
      key: 'is_root',
      render: (isRoot: boolean) => (isRoot ? <Tag color="gold">{t('event.yes')}</Tag> : '—'),
    },
    {
      title: t('event.col_status'),
      key: 'status',
      render: (_: unknown, record: EventAdmin) =>
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
      render: (_: unknown, record: EventAdmin) => (
        <Space>
          <Button size="small" onClick={() => openEdit(record)} disabled={!!record.deleted_at}>
            {t('common.edit')}
          </Button>
          <Popconfirm
            title={t('event.delete_title')}
            description={t('event.delete_confirm', { name: record.title_uz })}
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
      <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          {t('event.new')}
        </Button>
      </Space>

      <Table rowKey="id" loading={isLoading} dataSource={events} columns={columns} pagination={false} />

      <EventFormModal open={formOpen} event={editingEvent} onClose={() => setFormOpen(false)} />
    </div>
  );
}
