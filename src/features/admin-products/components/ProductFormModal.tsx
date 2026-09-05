import { useState } from 'react';
import { App, Modal, Form, Input, InputNumber, Upload, Switch, Divider, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useCreateProduct, useUpdateProduct } from '@/features/admin-products/hooks';
import type { ProductAdmin, UpdateProductPayload } from '@/features/products/types';
import { CategorySelect } from '@/features/categories/components/CategorySelect';
import { useT } from '@/shared/i18n/useT';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 3;
const MAX_IMAGES = 5;

interface ProductFormModalProps {
  open: boolean;
  /** `null`/`undefined` — yaratish rejimi, aks holda tahrirlash rejimi. */
  product?: ProductAdmin | null;
  onClose: () => void;
}

interface ProductFormValues {
  name_uz: string;
  name_eng: string;
  name_ru: string;
  description_uz?: string;
  description_eng?: string;
  description_ru?: string;
  category_id: string;
  amount: number;
  discount_amount?: number;
  slug?: string;
  is_available: boolean;
  rating: number;
  stock: number;
  tag_uz?: string;
  tag_eng?: string;
  tag_ru?: string;
}

export function ProductFormModal({ open, product, onClose }: ProductFormModalProps) {
  const [form] = Form.useForm<ProductFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!product;
  const t = useT();
  const { notification } = App.useApp();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({
      name_uz: product?.name_uz ?? '',
      name_eng: product?.name_eng ?? '',
      name_ru: product?.name_ru ?? '',
      description_uz: product?.description_uz ?? '',
      description_eng: product?.description_eng ?? '',
      description_ru: product?.description_ru ?? '',
      category_id: product?.category_id,
      amount: product?.price_amount,
      discount_amount: product?.discount_amount,
      slug: product?.slug ?? '',
      is_available: product?.is_available ?? true,
      rating: product?.rating ?? 1,
      stock: product?.stock ?? 0,
      tag_uz: product?.tag_uz ?? '',
      tag_eng: product?.tag_eng ?? '',
      tag_ru: product?.tag_ru ?? '',
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
      if (isEdit && product) {
        const payload: UpdateProductPayload = {
          name_uz: values.name_uz,
          name_eng: values.name_eng,
          name_ru: values.name_ru,
          description_uz: values.description_uz,
          description_eng: values.description_eng,
          description_ru: values.description_ru,
          category_id: values.category_id,
          amount: values.amount,
          currency: 'UZS',
          slug: values.slug || undefined,
          is_available: values.is_available,
          rating: values.rating,
          stock: values.stock,
        };

        // Maydon bo'shatilgan bo'lsa — avval qiymati bo'lgan bo'lsa, buni "o'chirish" deb talqin qilamiz.
        if (values.discount_amount) {
          payload.discount_amount = values.discount_amount;
        } else if (product.discount_amount !== undefined) {
          payload.clear_discount = true;
        }

        if (values.tag_uz) {
          payload.tag_uz = values.tag_uz;
        } else if (product.tag_uz) {
          payload.clear_tag_uz = true;
        }

        if (values.tag_eng) {
          payload.tag_eng = values.tag_eng;
        } else if (product.tag_eng) {
          payload.clear_tag_eng = true;
        }

        if (values.tag_ru) {
          payload.tag_ru = values.tag_ru;
        } else if (product.tag_ru) {
          payload.clear_tag_ru = true;
        }

        await updateMutation.mutateAsync({ id: product.id, payload });
      } else {
        const imageFiles = fileList
          .map((file) => file.originFileObj as File | undefined)
          .filter((file): file is File => !!file);

        await createMutation.mutateAsync({
          name_uz: values.name_uz,
          name_eng: values.name_eng,
          name_ru: values.name_ru,
          description_uz: values.description_uz,
          description_eng: values.description_eng,
          description_ru: values.description_ru,
          category_id: values.category_id,
          amount: values.amount,
          currency: 'UZS',
          discount_amount: values.discount_amount,
          slug: values.slug || undefined,
          is_available: values.is_available,
          rating: values.rating,
          stock: values.stock,
          tag_uz: values.tag_uz,
          tag_eng: values.tag_eng,
          tag_ru: values.tag_ru,
          images: imageFiles.length > 0 ? imageFiles : undefined,
        });
      }
      notification.success({
        title: isEdit ? t('product.update_success') : t('product.create_success'),
        placement: 'top',
      });
      onClose();
    } catch (error) {
      notification.error({
        title: isEdit ? t('product.update_error') : t('product.create_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  return (
    <Modal
      title={isEdit ? t('product.edit_title') : t('product.new')}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isSubmitting}
      okText={isEdit ? t('common.save') : t('common.add')}
      cancelText={t('common.cancel')}
      destroyOnHidden
      width={680}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical">
        <Divider titlePlacement="left" plain>
          {t('product.section_name')}
        </Divider>
        <Form.Item name="name_uz" label={t('common.name_uz')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('product.name_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="name_eng" label={t('common.name_eng')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('product.name_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="name_ru" label={t('common.name_ru')} rules={[{ required: true, message: t('common.name_required') }]}>
          <Input placeholder={t('product.name_placeholder_ru')} />
        </Form.Item>

        <Divider titlePlacement="left" plain>
          {t('product.section_description')}
        </Divider>
        <Form.Item name="description_uz" label={t('product.description_uz')}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="description_eng" label={t('product.description_eng')}>
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="description_ru" label={t('product.description_ru')}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <Divider titlePlacement="left" plain>
          {t('product.section_tag')}
        </Divider>
        <Form.Item name="tag_uz" label={t('product.tag_uz')}>
          <Input placeholder={t('product.tag_placeholder_uz')} />
        </Form.Item>
        <Form.Item name="tag_eng" label={t('product.tag_eng')}>
          <Input placeholder={t('product.tag_placeholder_eng')} />
        </Form.Item>
        <Form.Item name="tag_ru" label={t('product.tag_ru')}>
          <Input placeholder={t('product.tag_placeholder_ru')} />
        </Form.Item>

        <Divider titlePlacement="left" plain>
          {t('product.section_price')}
        </Divider>
        <Form.Item name="category_id" label={t('common.category')} rules={[{ required: true, message: t('common.category_required') }]}>
          <CategorySelect />
        </Form.Item>
        <Form.Item name="amount" label={t('product.price')} rules={[{ required: true, message: t('product.price_required') }]}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="discount_amount" label={t('product.discount')}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="stock" label={t('product.stock')}>
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="rating" label={t('product.rating')}>
          <InputNumber min={1} max={5} step={0.1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="slug" label={t('product.slug')}>
          <Input placeholder={t('product.slug_placeholder')} />
        </Form.Item>
        <Form.Item name="is_available" label={t('product.is_available')} valuePropName="checked">
          <Switch />
        </Form.Item>

        {!isEdit && (
          <>
            <Divider titlePlacement="left" plain>
              {t('product.section_images', { max: String(MAX_IMAGES) })}
            </Divider>
            <Form.Item>
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
                    <div style={{ marginTop: 8 }}>{t('product.add_image')}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
