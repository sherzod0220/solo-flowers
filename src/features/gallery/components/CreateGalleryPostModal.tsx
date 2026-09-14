import { useState } from 'react';
import { App, Modal, Input, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateGalleryPost } from '../hooks';
import { useT } from '@/shared/i18n/useT';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;
const MAX_IMAGES = 3;

interface CreateGalleryPostModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateGalleryPostModal({ open, onClose }: CreateGalleryPostModalProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [description, setDescription] = useState('');
  const createMutation = useCreateGalleryPost();
  const { notification } = App.useApp();
  const t = useT();

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    setFileList([]);
    setDescription('');
  }

  function beforeUpload(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      notification.error({
        title: t('common.upload_type_error'),
        description: `${file.name} (${file.type || 'unknown type'})`,
        placement: 'top',
      });
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      notification.error({
        title: t('common.upload_size_error'),
        description: `${file.name} — ${(file.size / 1024 / 1024).toFixed(1)}MB`,
        placement: 'top',
      });
      return Upload.LIST_IGNORE;
    }
    // false — Upload'ning o'zi yubormaydi, faylni submit paytida biz o'zimiz yuboramiz.
    return false;
  }

  async function handleSubmit() {
    const images = fileList.map((file) => file.originFileObj as File | undefined).filter((file): file is File => !!file);

    if (images.length === 0) {
      notification.error({ title: t('gallery.images_required'), placement: 'top' });
      return;
    }

    try {
      await createMutation.mutateAsync({ images, description: description || undefined });
      notification.success({ title: t('gallery.create_success'), placement: 'top' });
      onClose();
    } catch (error) {
      notification.error({
        title: t('gallery.create_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  return (
    <Modal
      title={t('gallery.new_post')}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending}
      okText={t('common.add')}
      cancelText={t('common.cancel')}
      destroyOnHidden
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('gallery.images_label')}</div>
        <Upload
          beforeUpload={beforeUpload}
          fileList={fileList}
          onChange={({ fileList: newList }) => setFileList(newList.slice(-MAX_IMAGES))}
          onRemove={(file) => setFileList((prev) => prev.filter((item) => item.uid !== file.uid))}
          accept="image/jpeg,image/png,image/webp"
          maxCount={MAX_IMAGES}
          multiple
          listType="picture-card"
        >
          {fileList.length < MAX_IMAGES && (
            <div>
              <PlusOutlined />
            </div>
          )}
        </Upload>
      </div>

      <div>
        <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('gallery.description_label')}</div>
        <Input.TextArea
          rows={3}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('gallery.description_placeholder')}
        />
      </div>
    </Modal>
  );
}
