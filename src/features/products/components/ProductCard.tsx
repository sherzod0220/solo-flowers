import { Link } from 'react-router-dom';
import { Card, Tag } from 'antd';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.discount_amount !== undefined;
  const cover = product.images[0];

  return (
    <Link to={ROUTES.PRODUCT_DETAIL.replace(':id', product.id)}>
      <Card
        hoverable
        styles={{ body: { padding: 16 } }}
        cover={
          <div
            style={{
              position: 'relative',
              aspectRatio: '1 / 1',
              overflow: 'hidden',
              background: 'var(--color-primary-light)',
            }}
          >
            {cover ? (
              <img src={cover} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  fontSize: 32,
                }}
              >
                🌸
              </div>
            )}
            {!product.is_available && (
              <Tag color="default" style={{ position: 'absolute', top: 8, left: 8 }}>
                Tugadi
              </Tag>
            )}
          </div>
        }
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 8 }}>{product.name}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
            {formatPrice(product.final_price_amount, product.price_currency)}
          </span>
          {hasDiscount && (
            <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 13 }}>
              {formatPrice(product.price_amount, product.price_currency)}
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
