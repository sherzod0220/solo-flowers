import { useState } from 'react';
import { App, Button, Popconfirm, Skeleton } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useDeleteGalleryPost, useGallery } from '@/features/gallery/hooks';
import { CreateGalleryPostModal } from '@/features/gallery/components/CreateGalleryPostModal';
import { formatDate } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Pagination } from '@/shared/ui/Pagination';
import { useT } from '@/shared/i18n/useT';

const PAGE_SIZE = 12;

export function GalleryListPage() {
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { data, isLoading } = useGallery({ page, page_size: PAGE_SIZE });
  const deleteMutation = useDeleteGalleryPost();
  const { notification } = App.useApp();
  const t = useT();

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
      notification.success({ title: t('gallery.delete_success'), placement: 'top' });
    } catch (error) {
      notification.error({
        title: t('gallery.delete_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)}>
          {t('gallery.new_post')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !data || data.items.length === 0 ? (
        <EmptyState description={t('gallery.empty')} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {data.items.map((post) => (
              <div key={post.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 2, aspectRatio: '1 / 1' }}>
                  {post.image_urls.map((url) => (
                    <img key={url} src={url} alt="" style={{ flex: 1, height: '100%', objectFit: 'cover', minWidth: 0 }} />
                  ))}
                </div>
                <div style={{ padding: 12 }}>
                  {post.description && (
                    <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--color-text)' }}>{post.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, opacity: 0.6 }}>{formatDate(post.created_at)}</span>
                    <Popconfirm
                      title={t('gallery.delete_title')}
                      description={t('gallery.delete_confirm')}
                      okText={t('common.delete')}
                      cancelText={t('common.cancel')}
                      okButtonProps={{ danger: true }}
                      onConfirm={() => handleDelete(post.id)}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.pagination && <Pagination meta={data.pagination} onPageChange={setPage} />}
        </>
      )}

      <CreateGalleryPostModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
