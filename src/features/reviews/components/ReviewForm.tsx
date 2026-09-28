import { useState } from 'react';
import { Link } from 'react-router-dom';
import { App, Button, Input, Rate } from 'antd';
import { useMe } from '@/features/auth/hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { useSubmitReview } from '../hooks';

interface ReviewFormProps {
  productId: string;
}

/**
 * Backend faqat shu mahsulotni sotib olib, "Delivered" holatidagi buyurtmasi bo'lgan foydalanuvchiga
 * ruxsat beradi (403) va bitta mahsulotga faqat 1 marta (409) — frontend bularni oldindan bilolmaydi
 * (buning uchun foydalanuvchining buyurtmalarini alohida tekshirish kerak bo'lardi), shuning uchun
 * forma tizimga kirgan har bir foydalanuvchiga ko'rsatiladi, ruxsat yo'qligi/takroriyligi esa
 * backend javobidagi xato xabari orqali ko'rsatiladi.
 */
export function ReviewForm({ productId }: ReviewFormProps) {
  const { isAuthenticated } = useMe();
  const submitMutation = useSubmitReview();
  const { notification } = App.useApp();
  const t = useT();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  async function handleSubmit() {
    if (rating === 0) {
      notification.error({ title: t('reviews.rating_required'), placement: 'top' });
      return;
    }

    try {
      await submitMutation.mutateAsync({ product_id: productId, rating, comment: comment || undefined });
      notification.success({ title: t('reviews.submit_success'), placement: 'top' });
      setRating(0);
      setComment('');
    } catch (error) {
      notification.error({
        title: t('reviews.submit_error'),
        description: error instanceof Error ? error.message : t('common.unknown_error'),
        placement: 'top',
      });
    }
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 16, background: 'var(--color-surface)', borderRadius: 12, boxShadow: '0 2px 10px rgba(42, 18, 24, 0.14)' }}>
        {t('reviews.login_required')} — <Link to={ROUTES.LOGIN}>{t('nav.login')}</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: 'var(--color-surface)', borderRadius: 12, boxShadow: '0 2px 10px rgba(42, 18, 24, 0.14)' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>{t('reviews.rating_label')}</div>
        <Rate value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ marginBottom: 6, fontWeight: 500 }}>{t('reviews.comment_label')}</div>
        <Input.TextArea
          rows={3}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder={t('reviews.comment_placeholder')}
        />
      </div>

      <Button type="primary" loading={submitMutation.isPending} onClick={handleSubmit}>
        {t('reviews.submit')}
      </Button>
    </div>
  );
}
