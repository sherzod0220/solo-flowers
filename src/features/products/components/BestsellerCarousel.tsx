import { Carousel, Skeleton } from 'antd';
import { useProducts } from '../hooks';
import { ProductCard } from './ProductCard';
import { useT } from '@/shared/i18n/useT';
import { useResponsiveCount } from '@/shared/hooks/useResponsiveCount';

const FETCH_SIZE = 20;
const SHOW_COUNT = 10;
const CARD_MAX_WIDTH = 260;

// Banner/kategoriya bilan bir xil chegaralar (xs/sm/md/lg/xl/2xl: 640/768/1024/1280/1536).
const PRODUCT_BREAKPOINTS = [
  { minWidth: 1536, count: 6 },
  { minWidth: 1280, count: 5 },
  { minWidth: 1024, count: 4 },
  { minWidth: 768, count: 3 },
  { minWidth: 640, count: 2 },
];
const PRODUCT_BASE_COUNT = 1;

/** Bosh sahifadagi "Ommabop mahsulotlar" qatori — `sold_count` bo'yicha eng ko'p sotilganlar, avtomatik aylanadi. */
export function BestsellerCarousel() {
  const { data, isLoading } = useProducts({ page_size: FETCH_SIZE });
  const t = useT();
  const responsiveCount = useResponsiveCount(PRODUCT_BREAKPOINTS, PRODUCT_BASE_COUNT);

  const bestsellers = [...(data?.items ?? [])].sort((a, b) => b.sold_count - a.sold_count).slice(0, SHOW_COUNT);

  if (isLoading) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 3 }} style={{ maxWidth: 260 }} />
          ))}
        </div>
      </div>
    );
  }

  if (bestsellers.length === 0) return null;

  // Mahsulotlar soni joriy breakpointning slotlariga (responsiveCount) sig'sa, kartalarni
  // cho'zib-kattalashtirmaslik uchun carusel o'rniga oddiy qator ishlatiladi — carusel faqat
  // haqiqatan aylantirish kerak bo'lganda (ma'lumot slotlardan ko'p bo'lganda) ishga tushadi.
  if (bestsellers.length <= responsiveCount) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 0, marginBottom: 16 }}>
          {t('home.bestsellers_title')}
        </h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {bestsellers.map((product) => (
            <div key={product.id} style={{ width: '100%', maxWidth: CARD_MAX_WIDTH, flex: '1 1 200px' }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 0, marginBottom: 16 }}>
        {t('home.bestsellers_title')}
      </h2>
      <Carousel
        arrows
        dots={false}
        draggable
        autoplay
        autoplaySpeed={4000}
        infinite
        slidesToShow={responsiveCount}
        slidesToScroll={responsiveCount}
      >
        {bestsellers.map((product) => (
          <div key={product.id} style={{ margin: '0 8px' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </Carousel>
    </div>
  );
}
