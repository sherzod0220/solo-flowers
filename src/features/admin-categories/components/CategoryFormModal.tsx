import { useState } from 'react';
import { Modal, Form, Input, Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateCategory, useUpdateCategory } from '@/features/categories/hooks';
import type { Category } from '@/features/categories/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;

interface CategoryFormModalProps {
  open: boolean;
  /** `null`/`undefined` — yaratish rejimi, aks holda tahrirlash rejimi. */
  category?: Category | null;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: CategoryFormModalProps) {
  const [form] = Form.useForm<{ name: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!category;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({ name: category?.name ?? '' });
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
    // false — Upload'ning o'zi yubormaydi, faylni submit paytida biz formaga qo'shib yuboramiz.
    return false;
  }

  async function handleSubmit() {
    const values = await form.validateFields();

    try {
      if (isEdit && category) {
        await updateMutation.mutateAsync({ id: category.id, payload: { name: values.name } });
      } else {
        const imageFile = fileList[0]?.originFileObj as File | undefined;
        if (!imageFile) {
          message.error('Rasm tanlang');
          return;
        }
        await createMutation.mutateAsync({ name: values.name, image: imageFile });
      }
      onClose();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Xatolik yuz berdi');
    }
  }

  return (
    <Modal
      title={isEdit ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
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
        <Form.Item name="name" label="Nomi" rules={[{ required: true, message: 'Nom kiritilishi shart' }]}>
          <Input placeholder="Masalan: Guldastalar" />
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
