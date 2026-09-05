import { Link } from 'react-router-dom';
import { Tag } from 'antd';
import { StarFilled } from '@ant-design/icons';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useT();
  const hasDiscount = product.discount_amount !== undefined;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.final_price_amount / product.price_amount) * 100)
    : 0;
  const cover = product.images[0];

  return (
    <Link to={ROUTES.PRODUCT_DETAIL.replace(':slug', product.slug)}>
      <div
        className="shadow-card"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div
          className="image-pedestal"
          style={{
            position: 'relative',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          {cover ? (
            <img src={cover} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: 32 }}>🌸</div>
          )}

          {hasDiscount && (
            <span
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'var(--color-primary)',
                color: '#fff',
                borderRadius: 999,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              -{discountPercent}%
            </span>
          )}

          {!product.is_available && (
            <Tag color="default" style={{ position: 'absolute', top: 10, right: 10 }}>
              {t('product.out_of_stock')}
            </Tag>
          )}
        </div>

        <div style={{ padding: 16 }}>
          {product.tag && (
            <div style={{ fontSize: 11, letterSpacing: 0.4, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase' }}>
              {product.tag}
            </div>
          )}

          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16,
              marginBottom: 6,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {product.name}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
            <StarFilled style={{ color: '#e8a33d', fontSize: 13 }} />
            <span style={{ fontSize: 13, color: '#8a7a6a' }}>{product.rating.toFixed(1)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>
              {formatPrice(product.final_price_amount, product.price_currency)}
            </span>
            {hasDiscount && (
              <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 13 }}>
                {formatPrice(product.price_amount, product.price_currency)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
