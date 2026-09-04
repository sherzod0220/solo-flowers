import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Image, Rate, Tag, Button, InputNumber, Skeleton, Row, Col, App } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useProductBySlug } from '@/features/products/hooks';
import { useCartActions } from '@/features/cart/hooks';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { PageMeta } from '@/shared/ui/PageMeta';
import { EmptyState } from '@/shared/ui/EmptyState';
import { useT } from '@/shared/i18n/useT';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug ?? '');
  const { addItem } = useCartActions();
  const { message } = App.useApp();
  const t = useT();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  function handleAddToCart() {
    if (!product) return;
    addItem(product, quantity);
    message.success(t('cart.added'));
  }

  if (isLoading) {
    return (
      <Row gutter={[32, 24]}>
        <Col xs={24} md={12}>
          <Skeleton.Image active style={{ width: '100%', aspectRatio: '1 / 1' }} />
        </Col>
        <Col xs={24} md={12}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Col>
      </Row>
    );
  }

  if (!product) {
    return <EmptyState description={t('common.products_not_found')} />;
  }

  const hasDiscount = product.discount_amount !== undefined;
  const images = product.images;

  return (
    <div>
      <PageMeta title={`${product.name} — Solo`} description={product.description || undefined} />

      <Link to={ROUTES.HOME} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}>
        <ArrowLeftOutlined /> {t('common.back_to_home')}
      </Link>

      <Row gutter={[32, 24]}>
        <Col xs={24} md={12}>
          {images.length > 0 ? (
            <Image.PreviewGroup items={images}>
              <div
                style={{
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  borderRadius: 16,
                  background: 'var(--color-primary-light)',
                }}
              >
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      style={{
                        width: 64,
                        height: 64,
                        padding: 0,
                        borderRadius: 8,
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: index === activeImage ? '2px solid var(--color-primary)' : '2px solid transparent',
                        background: 'none',
                      }}
                    >
                      <img src={image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              )}
            </Image.PreviewGroup>
          ) : (
            <div
              style={{
                aspectRatio: '1 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                background: 'var(--color-primary-light)',
                borderRadius: 16,
              }}
            >
              🌸
            </div>
          )}
        </Col>

        <Col xs={24} md={12}>
          {product.tag && (
            <Tag color="gold" style={{ marginBottom: 12 }}>
              {product.tag}
            </Tag>
          )}

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 8, marginTop: 0 }}>{product.name}</h1>

          <Rate disabled allowHalf value={product.rating} style={{ fontSize: 16, marginBottom: 16 }} />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>
              {formatPrice(product.final_price_amount, product.price_currency)}
            </span>
            {hasDiscount && (
              <span style={{ textDecoration: 'line-through', color: '#999', fontSize: 16 }}>
                {formatPrice(product.price_amount, product.price_currency)}
              </span>
            )}
          </div>

          {!product.is_available && (
            <Tag color="default" style={{ marginBottom: 16 }}>
              {t('product.out_of_stock')}
            </Tag>
          )}

          {product.description && (
            <p style={{ color: 'var(--color-text)', lineHeight: 1.7, marginBottom: 24 }}>{product.description}</p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <InputNumber
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(value) => setQuantity(value ?? 1)}
              disabled={!product.is_available}
              size="large"
            />
            <Button type="primary" size="large" disabled={!product.is_available} onClick={handleAddToCart}>
              {t('product.add_to_cart')}
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
}
