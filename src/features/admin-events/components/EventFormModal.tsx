import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Switch, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateEvent, useUpdateEvent } from '@/features/events/hooks';
import type { Event } from '@/features/events/types';
import { CategorySelect } from '@/features/categories/components/CategorySelect';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;

interface EventFormModalProps {
  open: boolean;
  /** `null`/`undefined` — yaratish rejimi, aks holda tahrirlash rejimi. */
  event?: Event | null;
  onClose: () => void;
}

interface EventFormValues {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  cta?: string;
  category_id: string;
  is_root: boolean;
}

export function EventFormModal({ open, event, onClose }: EventFormModalProps) {
  const [form] = Form.useForm<EventFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!event;

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({
      eyebrow: event?.eyebrow ?? '',
      title: event?.title ?? '',
      subtitle: event?.subtitle ?? '',
      cta: event?.cta ?? '',
      category_id: event?.category_id,
      is_root: event?.is_root ?? false,
    });
    setFileList([]);
  }

  function beforeUpload(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error('Faqat JPEG, PNG yoki WEBP formatidagi rasm yuklash mumkin');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error('Rasm hajmi 3MB dan oshmasligi kerak');
      return Upload.LIST_IGNORE;
    }
    return false;
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    try {
      if (isEdit && event) {
        await updateMutation.mutateAsync({
          id: event.id,
          payload: {
            eyebrow: values.eyebrow,
            title: values.title,
            subtitle: values.subtitle,
            cta: values.cta,
            category_id: values.category_id,
            is_root: values.is_root,
          },
        });
      } else {
        const imageFile = fileList[0]?.originFileObj as File | undefined;
        if (!imageFile) {
          message.error('Rasm tanlang');
          return;
        }
        await createMutation.mutateAsync({
          eyebrow: values.eyebrow,
          title: values.title,
          subtitle: values.subtitle,
          cta: values.cta,
          category_id: values.category_id,
          is_root: values.is_root,
          image: imageFile,
        });
      }
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    }
  }

  return (
    <Modal
      title={isEdit ? 'Eventni tahrirlash' : 'Yangi event'}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? 'Saqlash' : "Qo'shish"}
      cancelText="Bekor qilish"
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="eyebrow" label="Eyebrow (kichik ustki matn)">
          <Input placeholder="Masalan: Bugungi taklif" />
        </Form.Item>

        <Form.Item name="title" label="Sarlavha" rules={[{ required: true, message: 'Sarlavha kiritilishi shart' }]}>
          <Input placeholder="Masalan: Sevimlilar uchun gullar" />
        </Form.Item>

        <Form.Item name="subtitle" label="Subtitle">
          <Input placeholder="Masalan: Bugun buyurtma bering, bugun yetkazamiz" />
        </Form.Item>

        <Form.Item name="cta" label="Tugma matni (CTA)">
          <Input placeholder="Masalan: Mahsulotlarni ko'rish" />
        </Form.Item>

        <Form.Item name="category_id" label="Kategoriya" rules={[{ required: true, message: 'Kategoriya tanlanishi shart' }]}>
          <CategorySelect />
        </Form.Item>

        <Form.Item name="is_root" label="Bosh bannerda birinchi chiqsinmi?" valuePropName="checked">
          <Switch />
        </Form.Item>

        {!isEdit && (
          <Form.Item label="Rasm" required>
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={({ fileList: newList }) => setFileList(newList.slice(-1))}
              onRemove={() => setFileList([])}
              accept="image/jpeg,image/png,image/webp"
              maxCount={1}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Rasm tanlash</Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
