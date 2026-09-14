import { useState } from 'react';
import { App, Table, Select, Tag, Button, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useAdminOrders, useCancelOrder, useUpdateDeliveryStatus, useUpdatePaymentStatus } from '@/features/orders/hooks';
import { CreateManualOrderModal } from '@/features/orders/components/CreateManualOrderModal';
import type { DeliveryStatus, Order, PaymentStatus } from '@/features/orders/types';
import { formatDate, formatPrice } from '@/shared/lib/utils';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useT } from '@/shared/i18n/useT';

// Yetkazish holati faqat shu tartibda OLDINGA o'zgaradi (backend tekshiradi) — shuning uchun har bir
// qatorning Select'i joriy holatdan OLDINGI bosqichlarni umuman ko'rsatmaydi (orqaga urinish 409'ga olib keladi).
// `cancelled` bu ro'yxatda YO'Q — admin buni to'g'ridan-to'g'ri tanlay olmaydi, faqat "Bekor qilish"
// amali orqali yuzaga keladi (haqiqiy backend bilan sinovda aniqlandi, Swagger'da hujjatlashtirilmagan edi).
const DELIVERY_STATUS_ORDER: DeliveryStatus[] = ['preparing', 'handed_to_courier', 'delivered'];

const DELIVERY_STATUS_LABEL_KEY = {
  preparing: 'orders.delivery_status.preparing',
  handed_to_courier: 'orders.delivery_status.handed_to_courier',
  delivered: 'orders.delivery_status.delivered',
  cancelled: 'orders.delivery_status.cancelled',
} as const satisfies Record<DeliveryStatus, string>;

const PAYMENT_STATUS_LABEL_KEY = {
  unpaid: 'orders.payment_status.unpaid',
  paid: 'orders.payment_status.paid',
} as const satisfies Record<PaymentStatus, string>;

export function OrdersListPage() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateDelivery = useUpdateDeliveryStatus();
  const updatePayment = useUpdatePaymentStatus();
  const cancelMutation = useCancelOrder();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { notification } = App.useApp();
  const t = useT();

  function handleDeliveryChange(order: Order, status: DeliveryStatus) {
    updateDelivery.mutate(
      { id: order.id, status },
      {
        onError: (error) =>
          notification.error({
            title: t('orders.status_update_error'),
            description: error instanceof Error ? error.message : t('common.error'),
            placement: 'top',
          }),
      },
    );
  }

  function handlePaymentChange(order: Order, status: PaymentStatus) {
    updatePayment.mutate(
      { id: order.id, status },
      {
        onError: (error) =>
          notification.error({
            title: t('orders.status_update_error'),
            description: error instanceof Error ? error.message : t('common.error'),
            placement: 'top',
          }),
      },
    );
  }

  async function handleCancel(order: Order) {
    try {
      await cancelMutation.mutateAsync(order.id);
      notification.success({ title: t('orders.cancel_success'), placement: 'top' });
    } catch (error) {
      notification.error({
        title: t('orders.cancel_error'),
        description: error instanceof Error ? error.message : t('common.error'),
        placement: 'top',
      });
    }
  }

  const columns = [
    {
      title: t('orders.order_number'),
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => `№${id.slice(0, 8)}`,
    },
    { title: t('checkout.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('checkout.address'), dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: t('checkout.order_summary'),
      key: 'items',
      render: (_: unknown, record: Order) => (
        <div>
          {record.items.map((item) => (
            <div key={item.product_id} style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
              {item.product_name} × {item.quantity}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('cart.total'),
      key: 'total',
      render: (_: unknown, record: Order) => formatPrice(record.total_amount, record.total_currency),
    },
    {
      title: t('orders.delivery_status'),
      key: 'delivery_status',
      render: (_: unknown, record: Order) => {
        // Bekor qilingan buyurtma holati endi o'zgarmaydi (backend ham qabul qilmaydi) — oddiy
        // (tahrirlanmaydigan) Tag ko'rsatiladi, Select emas.
        if (record.delivery_status === 'cancelled') {
          return <Tag color="red">{t(DELIVERY_STATUS_LABEL_KEY.cancelled)}</Tag>;
        }
        const currentIndex = DELIVERY_STATUS_ORDER.indexOf(record.delivery_status);
        const options = DELIVERY_STATUS_ORDER.slice(currentIndex).map((status) => ({
          value: status,
          label: t(DELIVERY_STATUS_LABEL_KEY[status]),
        }));
        return (
          <Select
            value={record.delivery_status}
            options={options}
            style={{ minWidth: 160 }}
            onChange={(value) => handleDeliveryChange(record, value)}
          />
        );
      },
    },
    {
      title: t('orders.payment_status'),
      key: 'payment_status',
      render: (_: unknown, record: Order) => (
        <Select
          value={record.payment_status}
          disabled={record.delivery_status === 'cancelled'}
          style={{ minWidth: 130 }}
          options={[
            { value: 'unpaid', label: t(PAYMENT_STATUS_LABEL_KEY.unpaid) },
            { value: 'paid', label: t(PAYMENT_STATUS_LABEL_KEY.paid) },
          ]}
          onChange={(value) => handlePaymentChange(record, value)}
        />
      ),
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
      render: (_: unknown, record: Order) => (
        <Popconfirm
          title={t('orders.cancel_confirm_title')}
          description={t('orders.cancel_confirm_desc')}
          okText={t('orders.cancel')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true }}
          onConfirm={() => handleCancel(record)}
          disabled={record.delivery_status !== 'preparing'}
        >
          <Button size="small" danger disabled={record.delivery_status !== 'preparing'}>
            {t('orders.cancel')}
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateOpen(true)}>
          {t('orders.create_manual')}
        </Button>
      </div>

      {!isLoading && (!orders || orders.length === 0) ? (
        <EmptyState description={t('orders.empty')} />
      ) : (
        <Table rowKey="id" loading={isLoading} dataSource={orders} columns={columns} pagination={false} />
      )}

      <CreateManualOrderModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
