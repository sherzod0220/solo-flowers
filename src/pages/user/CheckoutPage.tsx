import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { App, Button, Row, Col, Input, Skeleton } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useCartItemsWithProducts } from '@/features/cart/hooks';
import { useCheckout } from '@/features/orders/hooks';
import { formatPrice } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FormField } from '@/shared/ui/FormField';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';
import { useLangStore } from '@/shared/store/langStore';

interface CheckoutFormValues {
  address: string;
  phone: string;
  note?: string;
}

export function CheckoutPage() {
  const { items, totalPrice, isLoading } = useCartItemsWithProducts();
  const checkoutMutation = useCheckout();
  const navigate = useNavigate();
  const { notification } = App.useApp();
  const t = useT();
  const lang = useLangStore((state) => state.lang);

  const checkoutSchema = z.object({
    address: z.string().min(1, t('checkout.address_required')),
    phone: z.string().min(1, t('checkout.phone_required')),
    note: z.string().optional(),
  });

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitted },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { address: '', phone: '', note: '' },
  });

  // Til o'zgarganda, ilgari ko'rsatilgan validatsiya xabarlarini ham yangi tilda qayta hisoblaymiz.
  useEffect(() => {
    if (isSubmitted) {
      void trigger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await checkoutMutation.mutateAsync({
        address: values.address,
        phone: values.phone,
        note: values.note || undefined,
      });
      notification.success({
        title: t('checkout.success_title'),
        description: t('checkout.success_desc'),
        placement: 'top',
      });
      navigate(ROUTES.ORDERS);
    } catch (error) {
      notification.error({
        title: t('checkout.error_title'),
        description: error instanceof Error ? error.message : t('common.unknown_error'),
        placement: 'top',
      });
    }
  });

  return (
    <div>
      <PageMeta title={`${t('checkout.title')} — Solo`} />

      <Link
        to={ROUTES.CART}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}
      >
        <ArrowLeftOutlined /> {t('cart.title')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 24 }}>
        {t('checkout.title')}
      </h1>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center' }}>
          <EmptyState description={t('checkout.empty_cart_desc')} />
          <Link to={ROUTES.HOME} style={{ color: 'var(--color-primary)' }}>
            {t('common.back_to_home')}
          </Link>
        </div>
      ) : (
        <Row gutter={[32, 24]}>
          <Col xs={24} md={14}>
            <form onSubmit={onSubmit}>
              <FormField label={t('checkout.address')} error={errors.address?.message}>
                <Controller
                  name="address"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} status={errors.address ? 'error' : ''} />}
                />
              </FormField>

              <FormField label={t('checkout.phone')} error={errors.phone?.message}>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} status={errors.phone ? 'error' : ''} placeholder="+998 90 123 45 67" />
                  )}
                />
              </FormField>

              <FormField label={t('checkout.note')}>
                <Controller
                  name="note"
                  control={control}
                  render={({ field }) => <Input.TextArea {...field} rows={2} placeholder={t('checkout.note_placeholder')} />}
                />
              </FormField>

              <Button type="primary" htmlType="submit" size="large" block loading={checkoutMutation.isPending}>
                {t('checkout.submit')}
              </Button>
            </form>
          </Col>

          <Col xs={24} md={10}>
            <div style={{ padding: 24, background: '#fff', borderRadius: 12, border: '1px solid var(--color-border)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 0, marginBottom: 16 }}>
                {t('checkout.order_summary')}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                {items.map((item) => (
                  <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}>
                    <span style={{ color: 'var(--color-text)' }}>
                      {item.product_name} × {item.quantity}
                    </span>
                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{formatPrice(item.subtotal, item.currency)}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 18,
                  fontWeight: 700,
                  paddingTop: 16,
                  borderTop: '1px solid var(--color-border)',
                }}
              >
                <span>{t('cart.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}
