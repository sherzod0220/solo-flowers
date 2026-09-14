import { Link } from 'react-router-dom';
import { Skeleton, Tag } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useMyOrders } from '@/features/orders/hooks';
import type { DeliveryStatus, PaymentStatus } from '@/features/orders/types';
import { formatDate, formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

const DELIVERY_STATUS_COLOR: Record<DeliveryStatus, string> = {
  preparing: 'gold',
  handed_to_courier: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

const PAYMENT_STATUS_COLOR: Record<PaymentStatus, string> = {
  unpaid: 'default',
  paid: 'green',
};

// `useT` faqat `translations`dagi aniq (literal) kalitlarni qabul qiladi — shablon satr orqali
// dinamik kalit qurib bo'lmaydi, shuning uchun har bir holat qiymati o'z tarjima kalitiga xarita qilinadi.
// `cancelled` — Swagger'da hujjatlashtirilmagan, admin buyurtmani bekor qilgandan keyin haqiqiy
// backend bilan sinovda aniqlangan qiymat.
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

export function OrdersPage() {
  const { data: orders, isLoading } = useMyOrders();
  const t = useT();

  return (
    <div>
      <PageMeta title={`${t('orders.title')} — Solo`} />

      <Link
        to={ROUTES.HOME}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}
      >
        <ArrowLeftOutlined /> {t('common.back_to_home')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 24 }}>{t('orders.title')}</h1>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !orders || orders.length === 0 ? (
        <EmptyState description={t('orders.empty')} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid var(--color-border)' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {t('orders.order_number')} №{order.id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text)', opacity: 0.65 }}>{formatDate(order.created_at)}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag color={DELIVERY_STATUS_COLOR[order.delivery_status]}>
                    {t(DELIVERY_STATUS_LABEL_KEY[order.delivery_status])}
                  </Tag>
                  <Tag color={PAYMENT_STATUS_COLOR[order.payment_status]}>
                    {t(PAYMENT_STATUS_LABEL_KEY[order.payment_status])}
                  </Tag>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                {order.items.map((item) => (
                  <div
                    key={item.product_id}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}
                  >
                    <span>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span style={{ whiteSpace: 'nowrap' }}>{formatPrice(item.unit_price * item.quantity, item.currency)}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontWeight: 700,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span>{t('cart.total')}</span>
                <span>{formatPrice(order.total_amount, order.total_currency)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
