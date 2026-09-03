import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateCategory, useUpdateCategory } from '@/features/categories/hooks';
import type { CategoryAdmin } from '@/features/categories/types';
import { useT } from '@/shared/i18n/useT';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;

interface CategoryFormModalProps {
  open: boolean;
  /** `null`/`undefined` — yaratish rejimi, aks holda tahrirlash rejimi. */
  category?: CategoryAdmin | null;
  onClose: () => void;
}

interface CategoryFormValues {
  name_uz: string;
  name_eng: string;
  name_ru: string;
}

export function CategoryFormModal({ open, category, onClose }: CategoryFormModalProps) {
  const [form] = Form.useForm<CategoryFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!category;
  const t = useT();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({
      name_uz: category?.name_uz ?? '',
      name_eng: category?.name_eng ?? '',
      name_ru: category?.name_ru ?? '',
    });
    setFileList([]);
  }

  function beforeUpload(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error(t('common.upload_type_error'));
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(t('common.upload_size_error'));
      return Upload.LIST_IGNORE;
    }
    // false — Upload'ning o'zi yubormaydi, faylni submit paytida biz formaga qo'shib yuboramiz.
    return false;
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({
          id: category.id,
          payload: { name_uz: values.name_uz, name_eng: values.name_eng, name_ru: values.name_ru },
        });
      } else {
        const imageFile = fileList[0]?.originFileObj as File | undefined;
        if (!imageFile) {
          message.error(t('common.choose_image_required'));
          return;
        }
        await createMutation.mutateAsync({
          name_uz: values.name_uz,
          name_eng: values.name_eng,
          name_ru: values.name_ru,
          image: imageFile,
        });
      }
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('common.error'));
    }
  }

  return (
    <Modal
      title={isEdit ? t('category.edit_title') : t('category.new')}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? t('common.save') : t('common.add')}
      cancelText={t('common.cancel')}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name_uz" label={t('common.name_uz')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('category.name_placeholder_uz')} />
        </Form.Item>

        <Form.Item name="name_eng" label={t('common.name_eng')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('category.name_placeholder_eng')} />
        </Form.Item>

        <Form.Item name="name_ru" label={t('common.name_ru')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('category.name_placeholder_ru')} />
        </Form.Item>

        {!isEdit && (
          <Form.Item label={t('common.image')} required>
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList.slice(-1))}
              onRemove={() => setFileList([])}
              accept="image/jpeg,image/png,image/webp"
              maxCount={1}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>{t('common.choose_image')}</Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
