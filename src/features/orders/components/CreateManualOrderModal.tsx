import { App, Modal, Form, Input, InputNumber, Select, Button } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCreateManualOrder } from '../hooks';
import type { PaymentStatus } from '../types';
import { useProducts } from '@/features/products/hooks';
import { useT } from '@/shared/i18n/useT';

interface CreateManualOrderModalProps {
  open: boolean;
  onClose: () => void;
}

interface ManualOrderFormValues {
  address: string;
  phone: string;
  note?: string;
  payment_status: PaymentStatus;
  items: { product_id?: string; quantity: number }[];
}

const PRODUCT_FETCH_SIZE = 100;

/** Admin panelidan telefon/offline savdo uchun cart'siz to'g'ridan-to'g'ri buyurtma yaratadi. */
export function CreateManualOrderModal({ open, onClose }: CreateManualOrderModalProps) {
  const [form] = Form.useForm<ManualOrderFormValues>();
  const { data: productsData } = useProducts({ page_size: PRODUCT_FETCH_SIZE });
  const createMutation = useCreateManualOrder();
  const { notification } = App.useApp();
  const t = useT();

  function handleAfterOpenChange(visible: boolean) {
    if (!visible) return;
    form.setFieldsValue({
      address: '',
      phone: '',
      note: '',
      payment_status: 'unpaid',
      items: [{ product_id: undefined, quantity: 1 }],
    });
  }

  async function handleSubmit() {
    const values = await form.validateFields();
    const items = values.items
      .filter((item) => item.product_id)
      .map((item) => ({ product_id: item.product_id as string, quantity: item.quantity }));

    if (items.length === 0) {
      notification.error({ title: t('orders.items_required'), placement: 'top' });
      return;
    }

    try {
      await createMutation.mutateAsync({
        address: values.address,
        phone: values.phone,
        note: values.note || undefined,
        payment_status: values.payment_status,
        items,
      });
      notification.success({ title: t('orders.create_manual_success'), placement: 'top' });
      onClose();
    } catch (error) {
      notification.error({
        title: t('orders.create_manual_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  const productOptions = productsData?.items.map((product) => ({ value: product.id, label: product.name })) ?? [];

  return (
    <Modal
      title={t('orders.create_manual')}
      open={open}
      afterOpenChange={handleAfterOpenChange}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={createMutation.isPending}
      okText={t('common.add')}
      cancelText={t('common.cancel')}
      destroyOnHidden
      width={640}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="address" label={t('checkout.address')} rules={[{ required: true, message: t('checkout.address_required') }]}>
          <Input.TextArea rows={2} />
        </Form.Item>

        <Form.Item name="phone" label={t('checkout.phone')} rules={[{ required: true, message: t('checkout.phone_required') }]}>
          <Input placeholder="+998 90 123 45 67" />
        </Form.Item>

        <Form.Item name="note" label={t('checkout.note')}>
          <Input.TextArea rows={2} placeholder={t('checkout.note_placeholder')} />
        </Form.Item>

        <Form.Item name="payment_status" label={t('orders.payment_status')} rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'unpaid', label: t('orders.payment_status.unpaid') },
              { value: 'paid', label: t('orders.payment_status.paid') },
            ]}
          />
        </Form.Item>

        <Form.List name="items">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <div key={field.key} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                  <Form.Item
                    name={[field.name, 'product_id']}
                    rules={[{ required: true, message: t('orders.select_product') }]}
                    style={{ flex: 1, marginBottom: 0 }}
                  >
                    <Select showSearch placeholder={t('orders.select_product')} options={productOptions} optionFilterProp="label" />
                  </Form.Item>
                  <Form.Item
                    name={[field.name, 'quantity']}
                    initialValue={1}
                    rules={[{ required: true }]}
                    style={{ width: 90, marginBottom: 0 }}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                  <Button icon={<DeleteOutlined />} danger onClick={() => remove(field.name)} disabled={fields.length <= 1} />
                </div>
              ))}
              <Button type="dashed" onClick={() => add({ quantity: 1 })} icon={<PlusOutlined />} block>
                {t('orders.add_item_row')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
