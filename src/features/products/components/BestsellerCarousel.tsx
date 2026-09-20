import { useRef, useState } from 'react';
import { Button, Carousel, Skeleton, type CarouselRef } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useProducts } from '../hooks';
import { ProductCard } from './ProductCard';
import { useT } from '@/shared/i18n/useT';
import { useResponsiveCount } from '@/shared/hooks/useResponsiveCount';
import { useCarouselAutoplay } from '@/shared/hooks/useCarouselAutoplay';

// Backend'da `sold_count` bo'yicha saralash (`?sort=`) yo'q — saralash shu yerda, frontendda
// amalga oshiriladi, shuning uchun to'g'ri natija uchun butun katalogni (yoki unga imkon qadar
// yaqinini) olib kelish kerak. `page_size`ning backend tomonidan ruxsat etilgan maksimal qiymati — 100.
// Diqqat: bu yerda KATEGORIYA bo'yicha filtr yo'q (`category_id` yuborilmaydi) — demak saralash
// bitta kategoriyaga emas, BUTUN KATALOG (barcha kategoriyalar birga) bo'yicha amalga oshadi.
const FETCH_SIZE = 100;
const SHOW_COUNT = 30;
const GRID_MIN_CARD_WIDTH = 200;

// Banner/kategoriya bilan bir xil chegaralar (xs/sm/md/lg/xl/2xl: 640/768/1024/1280/1536).
const PRODUCT_BREAKPOINTS = [
  { minWidth: 1536, count: 6 },
  { minWidth: 1280, count: 5 },
  { minWidth: 1024, count: 4 },
  { minWidth: 768, count: 3 },
  { minWidth: 640, count: 2 },
];
const PRODUCT_BASE_COUNT = 1;

interface ProductArrowProps {
  direction: 'prev' | 'next';
  onClick?: () => void;
  /** Avtomatik aylanishni 5 soniyaga pauza qilish uchun — qo'lda tortishda ham xuddi shunday ishlaydi. */
  onInteract?: () => void;
}

/** Karta chegarasidan biroz "chiqib turadigan" dumaloq, romkali tugma — kartalar bilan orasida doim bo'shliq bor. */
function ProductArrow({ direction, onClick, onInteract }: ProductArrowProps) {
  const t = useT();
  return (
    <button
      type="button"
      className={`carousel-arrow-button carousel-arrow-button--${direction}`}
      onClick={() => {
        onClick?.();
        onInteract?.();
      }}
      aria-label={direction === 'prev' ? t('common.prev') : t('common.next')}
    >
      {direction === 'prev' ? <LeftOutlined /> : <RightOutlined />}
    </button>
  );
}

/** Bosh sahifadagi "Ommabop mahsulotlar" qatori — `sold_count` bo'yicha eng ko'p sotilganlar, avtomatik aylanadi. */
export function BestsellerCarousel() {
  const { data, isLoading } = useProducts({ page_size: FETCH_SIZE });
  const t = useT();
  const responsiveCount = useResponsiveCount(PRODUCT_BREAKPOINTS, PRODUCT_BASE_COUNT);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef<CarouselRef>(null);
  const { handleInteraction, handlePointerDown, handlePointerUp } = useCarouselAutoplay(carouselRef, !isExpanded);

  const bestsellers = [...(data?.items ?? [])].sort((a, b) => b.sold_count - a.sold_count).slice(0, SHOW_COUNT);

  if (isLoading) {
    return (
      <div className="section-panel">
        <div style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} active paragraph={{ rows: 3 }} style={{ maxWidth: 260 }} />
          ))}
        </div>
      </div>
    );
  }

  if (bestsellers.length === 0) return null;

  // Real ma'lumot slotlardan kam bo'lsa ham qator to'liq ko'rinishi uchun, slidesToShow mavjud
  // mahsulot soniga moslanadi (Kategoriyalar karuseli bilan bir xil naqsh).
  const slidesToShow = Math.min(responsiveCount, bestsellers.length);
  // "Barchasi" tugmasi 1 tadan ortiq mahsulot bo'lsa doim ko'rinadi — `bestsellers.length > slidesToShow`
  // shartiga bog'lansa, aynan eng katta breakpoint slotlar soniga teng mahsulot bo'lganda tugma
  // "tasodifan" g'oyib bo'lib qolishi mumkin edi (Kategoriyalar karuselida katta ekranda topilgan bug).
  const canExpand = bestsellers.length > 1;

  return (
    <div className="section-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{t('home.bestsellers_title')}</h2>
        {canExpand && (
          <Button type="link" onClick={() => setIsExpanded((prev) => !prev)} style={{ paddingRight: 0 }}>
            {isExpanded ? t('common.show_less') : t('common.view_all')}
          </Button>
        )}
      </div>

      {isExpanded ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${GRID_MIN_CARD_WIDTH}px, 1fr))`,
            gap: 16,
          }}
        >
          {bestsellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        // Tortish (drag) slick'ning o'z draggable/swipeToSlide'i o'rniga to'liq shu yerda, pointer
        // hodisalari orqali amalga oshiriladi (useCarouselAutoplay) — ikkalasini birga ishlatish
        // avtomatik aylanish bilan to'qnashib, tortishning o'zi ishlamay qolishiga sabab bo'lgan edi.
        // Diqqat: onDragStart + userSelect — brauzerning o'zi rasm/link ustida boshlangan tortishni
        // "native drag" (ghost-image tortish) sifatida ilib ketishining oldini oladi. Aks holda
        // pointerup kutilgan tarzda kelmay, qo'lda tortish "ishlamay qoladi".
        <div
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDragStart={(e) => e.preventDefault()}
          style={{
            cursor: 'grab',
            touchAction: 'pan-y',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <Carousel
            ref={carouselRef}
            arrows
            dots={false}
            draggable={false}
            swipeToSlide={false}
            autoplay={false}
            speed={600}
            cssEase="ease-in-out"
            infinite
            prevArrow={<ProductArrow direction="prev" onInteract={handleInteraction} />}
            nextArrow={<ProductArrow direction="next" onInteract={handleInteraction} />}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
          >
            {bestsellers.map((product) => (
              <div key={product.id} className="product-slide">
                <ProductCard product={product} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
}
