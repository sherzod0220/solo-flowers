import { Drawer, Button, InputNumber, Empty } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined } from '@ant-design/icons';
import { useCartItems, useCartTotal, useCartActions } from '../hooks';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartItems();
  const total = useCartTotal();
  const { removeItem, setQuantity } = useCartActions();
  const t = useT();

  return (
    <Drawer title={t('cart.title')} open={open} onClose={onClose} size={380}>
      {items.length === 0 ? (
        <Empty description={t('cart.empty')} />
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'var(--color-primary-light)',
                  }}
                >
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    to={ROUTES.PRODUCT_DETAIL.replace(':slug', item.slug)}
                    onClick={onClose}
                    style={{
                      color: 'var(--color-text)',
                      fontWeight: 500,
                      display: 'block',
                      marginBottom: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ color: 'var(--color-primary)', fontWeight: 600, marginBottom: 8 }}>
                    {formatPrice(item.price, item.currency)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <InputNumber
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(value) => setQuantity(item.productId, value ?? 1)}
                      size="small"
                      style={{ width: 64 }}
                    />
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => removeItem(item.productId)} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
              <span>{t('cart.total')}</span>
              <span>{formatPrice(total)}</span>
            </div>
            <Link to={ROUTES.CART} onClick={onClose}>
              <Button type="primary" block size="large">
                {t('cart.view_cart')}
              </Button>
            </Link>
          </div>
        </>
      )}
    </Drawer>
  );
}
