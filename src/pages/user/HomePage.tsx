import { EventBanner } from '@/features/events/components/EventBanner';
import { CategoryCarousel } from '@/features/categories/components/CategoryCarousel';
import { BestsellerCarousel } from '@/features/products/components/BestsellerCarousel';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

export function HomePage() {
  const t = useT();

  return (
    <div>
      <PageMeta title={t('meta.home_title')} description={t('meta.home_description')} />

      <EventBanner />

      <CategoryCarousel />

      <BestsellerCarousel />
    </div>
  );
}
