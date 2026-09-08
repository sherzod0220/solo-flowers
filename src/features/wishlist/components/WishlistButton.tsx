import type { CSSProperties, MouseEvent } from 'react';
import { App, Button } from 'antd';
import { HeartFilled, HeartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { useAddToWishlist, useIsInWishlist, useRemoveFromWishlist } from '../hooks';

interface WishlistButtonProps {
  productId: string;
  size?: 'small' | 'middle' | 'large';
  style?: CSSProperties;
}

/** Mahsulot kartasi/sahifasida ishlatiladigan yurakcha tugma — bosilganda wishlist'ga qo'shadi/olib tashlaydi. */
export function WishlistButton({ productId, size = 'middle', style }: WishlistButtonProps) {
  const { isAuthenticated } = useMe();
  const navigate = useNavigate();
  const isInWishlist = useIsInWishlist(productId);
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();
  const { notification } = App.useApp();
  const t = useT();
  const isLoading = addMutation.isPending || removeMutation.isPending;

  async function handleClick(event: MouseEvent) {
    // ProductCard butun karta bo'ylab <Link> bo'lgani uchun, bosilganda mahsulot sahifasiga o'tib
    // ketmasligi kerak.
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      if (isInWishlist) {
        await removeMutation.mutateAsync(productId);
        notification.success({ title: t('wishlist.removed'), placement: 'top' });
      } else {
        await addMutation.mutateAsync(productId);
        notification.success({ title: t('wishlist.added'), placement: 'top' });
      }
    } catch (error) {
      notification.error({
        title: t('common.error'),
        description: error instanceof Error ? error.message : t('common.unknown_error'),
        placement: 'top',
      });
    }
  }

  return (
    <Button
      type="text"
      shape="circle"
      size={size}
      loading={isLoading}
      onClick={handleClick}
      icon={
        isInWishlist ? (
          <HeartFilled style={{ color: 'var(--color-primary)' }} />
        ) : (
          <HeartOutlined style={{ color: 'var(--color-primary)' }} />
        )
      }
      aria-label={isInWishlist ? t('wishlist.remove') : t('wishlist.add')}
      title={isInWishlist ? t('wishlist.remove') : t('wishlist.add')}
      style={style}
    />
  );
}
