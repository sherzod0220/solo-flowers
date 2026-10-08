import { EventBanner } from '@/features/events/components/EventBanner';
import { CategoryCarousel } from '@/features/categories/components/CategoryCarousel';
import { BestsellerCarousel } from '@/features/products/components/BestsellerCarousel';
import { GallerySection } from '@/features/gallery/components/GallerySection';
import { PageMeta } from '@/shared/ui/PageMeta';
import { Reveal } from '@/shared/ui/Reveal';
import { useT } from '@/shared/i18n/useT';

export function HomePage() {
  const t = useT();

  return (
    <div>
      <PageMeta title={t('meta.home_title')} description={t('meta.home_description')} />

      <EventBanner />

      {/* Har bir bo'lim skroll qilinib ekranga kirganda pastdan yumshoq ko'tariladi. */}
      <Reveal y={40}>
        <CategoryCarousel />
      </Reveal>

      <Reveal y={40}>
        <BestsellerCarousel />
      </Reveal>

      <Reveal y={40}>
        <GallerySection />
      </Reveal>
    </div>
  );
}
