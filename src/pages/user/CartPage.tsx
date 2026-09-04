import { Link } from 'react-router-dom';
import { Button, InputNumber, Row, Col, App } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCartItems, useCartTotal, useCartActions } from '@/features/cart/hooks';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/EmptyState';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

export function CartPage() {
  const items = useCartItems();
  const total = useCartTotal();
  const { removeItem, setQuantity } = useCartActions();
  const { message } = App.useApp();
  const t = useT();

  function handleCheckout() {
    message.info(t('cart.checkout_coming_soon'));
  }

  return (
    <div>
      <PageMeta title={`${t('cart.title')} — Solo`} />

      <Link
        to={ROUTES.HOME}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}
      >
        <ArrowLeftOutlined /> {t('common.back_to_home')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 24 }}>{t('cart.title')}</h1>

      {items.length === 0 ? (
        <EmptyState description={t('cart.empty')} />
      ) : (
        <Row gutter={[32, 24]}>
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    gap: 16,
                    padding: 16,
                    background: '#fff',
                    borderRadius: 12,
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <Link
                    to={ROUTES.PRODUCT_DETAIL.replace(':slug', item.slug)}
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 8,
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'var(--color-primary-light)',
                    }}
                  >
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </Link>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      to={ROUTES.PRODUCT_DETAIL.replace(':slug', item.slug)}
                      style={{ color: 'var(--color-text)', fontWeight: 600, fontSize: 16 }}
                    >
                      {item.name}
                    </Link>
                    <div style={{ color: 'var(--color-primary)', fontWeight: 600, margin: '8px 0' }}>
                      {formatPrice(item.price, item.currency)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <InputNumber
                        min={1}
                        max={item.stock}
                        value={item.quantity}
                        onChange={(value) => setQuantity(item.productId, value ?? 1)}
                      />
                      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.productId)}>
                        {t('common.delete')}
                      </Button>
                    </div>
                  </div>

                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {formatPrice(item.price * item.quantity, item.currency)}
                  </div>
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} md={8}>
            <div style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
                <span>{t('cart.total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Button type="primary" size="large" block onClick={handleCheckout}>
                {t('cart.checkout')}
              </Button>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}
