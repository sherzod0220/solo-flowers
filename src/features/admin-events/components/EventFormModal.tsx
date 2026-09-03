import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Switch, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateEvent, useUpdateEvent } from '@/features/events/hooks';
import type { EventAdmin } from '@/features/events/types';
import { CategorySelect } from '@/features/categories/components/CategorySelect';
import { useT } from '@/shared/i18n/useT';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;

interface EventFormModalProps {
  open: boolean;
  /** `null`/`undefined` — yaratish rejimi, aks holda tahrirlash rejimi. */
  event?: EventAdmin | null;
  onClose: () => void;
}

interface EventFormValues {
  eyebrow_uz?: string;
  eyebrow_eng?: string;
  eyebrow_ru?: string;
  title_uz: string;
  title_eng: string;
  title_ru: string;
  subtitle_uz?: string;
  subtitle_eng?: string;
  subtitle_ru?: string;
  cta_uz?: string;
  cta_eng?: string;
  cta_ru?: string;
  category_id: string;
  is_root: boolean;
}

export function EventFormModal({ open, event, onClose }: EventFormModalProps) {
  const [form] = Form.useForm<EventFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!event;
  const t = useT();

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({
      eyebrow_uz: event?.eyebrow_uz ?? '',
      eyebrow_eng: event?.eyebrow_eng ?? '',
      eyebrow_ru: event?.eyebrow_ru ?? '',
      title_uz: event?.title_uz ?? '',
      title_eng: event?.title_eng ?? '',
      title_ru: event?.title_ru ?? '',
      subtitle_uz: event?.subtitle_uz ?? '',
      subtitle_eng: event?.subtitle_eng ?? '',
      subtitle_ru: event?.subtitle_ru ?? '',
      cta_uz: event?.cta_uz ?? '',
      cta_eng: event?.cta_eng ?? '',
      cta_ru: event?.cta_ru ?? '',
      category_id: event?.category_id,
      is_root: event?.is_root ?? false,
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
    return false;
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    try {
      if (isEdit && event) {
        await updateMutation.mutateAsync({ id: event.id, payload: values });
      } else {
        const imageFile = fileList[0]?.originFileObj as File | undefined;
        if (!imageFile) {
          message.error(t('common.choose_image_required'));
          return;
        }
        await createMutation.mutateAsync({ ...values, image: imageFile });
      }
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t('common.error'));
    }
  }

  return (
    <Modal
      title={isEdit ? t('event.edit_title') : t('event.new')}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? t('common.save') : t('common.add')}
      cancelText={t('common.cancel')}
      destroyOnHidden
      width={640}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title_uz" label={t('event.title_uz')} rules={[{ required: true, message: t('event.title_required') }]}>
          <Input placeholder={t('event.title_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="title_eng" label={t('event.title_eng')} rules={[{ required: true, message: t('event.title_required') }]}>
          <Input placeholder={t('event.title_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="title_ru" label={t('event.title_ru')} rules={[{ required: true, message: t('event.title_required') }]}>
          <Input placeholder={t('event.title_placeholder_ru')} />
        </Form.Item>

        <Form.Item name="eyebrow_uz" label={t('event.eyebrow_uz')}>
          <Input placeholder={t('event.eyebrow_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="eyebrow_eng" label={t('event.eyebrow_eng')}>
          <Input placeholder={t('event.eyebrow_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="eyebrow_ru" label={t('event.eyebrow_ru')}>
          <Input placeholder={t('event.eyebrow_placeholder_ru')} />
        </Form.Item>

        <Form.Item name="subtitle_uz" label={t('event.subtitle_uz')}>
          <Input placeholder={t('event.subtitle_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="subtitle_eng" label={t('event.subtitle_eng')}>
          <Input placeholder={t('event.subtitle_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="subtitle_ru" label={t('event.subtitle_ru')}>
          <Input placeholder={t('event.subtitle_placeholder_ru')} />
        </Form.Item>

        <Form.Item name="cta_uz" label={t('event.cta_uz')}>
          <Input placeholder={t('event.cta_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="cta_eng" label={t('event.cta_eng')}>
          <Input placeholder={t('event.cta_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="cta_ru" label={t('event.cta_ru')}>
          <Input placeholder={t('event.cta_placeholder_ru')} />
        </Form.Item>

        <Form.Item name="category_id" label={t('common.category')} rules={[{ required: true, message: t('common.category_required') }]}>
          <CategorySelect />
        </Form.Item>

        <Form.Item name="is_root" label={t('event.is_root_label')} valuePropName="checked">
          <Switch />
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
