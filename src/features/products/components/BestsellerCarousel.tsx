import { Carousel, Skeleton } from 'antd';
import { useProducts } from '../hooks';
import { ProductCard } from './ProductCard';
import { useT } from '@/shared/i18n/useT';

const FETCH_SIZE = 20;
const SHOW_COUNT = 10;
const DESKTOP_SHOW = 4;
const TABLET_SHOW = 3;
const SMALL_TABLET_SHOW = 2;
const MOBILE_SHOW = 1;
const CARD_MAX_WIDTH = 260;

/** Bosh sahifadagi "Ommabop mahsulotlar" qatori — `sold_count` bo'yicha eng ko'p sotilganlar, avtomatik aylanadi. */
export function BestsellerCarousel() {
  const { data, isLoading } = useProducts({ page_size: FETCH_SIZE });
  const t = useT();

  const bestsellers = [...(data?.items ?? [])].sort((a, b) => b.sold_count - a.sold_count).slice(0, SHOW_COUNT);

  if (isLoading) {
    return (
      <div style={{ background: 'var(--color-primary-light)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 3 }} style={{ maxWidth: 260 }} />
          ))}
        </div>
      </div>
    );
  }

  if (bestsellers.length === 0) return null;

  // Mahsulotlar soni bitta qatorga (DESKTOP_SHOW) sig'sa, kartalarni cho'zib-kattalashtirmaslik uchun
  // carusel o'rniga oddiy qator ishlatiladi — carusel faqat haqiqatan aylantirish kerak bo'lganda ishga tushadi.
  if (bestsellers.length <= DESKTOP_SHOW) {
    return (
      <div style={{ background: 'var(--color-primary-light)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
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
    <div style={{ background: 'var(--color-primary-light)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
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
        slidesToShow={DESKTOP_SHOW}
        slidesToScroll={DESKTOP_SHOW}
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: TABLET_SHOW, slidesToScroll: TABLET_SHOW } },
          { breakpoint: 768, settings: { slidesToShow: SMALL_TABLET_SHOW, slidesToScroll: SMALL_TABLET_SHOW } },
          { breakpoint: 480, settings: { slidesToShow: MOBILE_SHOW, slidesToScroll: MOBILE_SHOW } },
        ]}
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
