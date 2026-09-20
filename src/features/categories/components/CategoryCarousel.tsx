import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Carousel, Skeleton, type CarouselRef } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { useResponsiveCount } from '@/shared/hooks/useResponsiveCount';
import { useCarouselAutoplay } from '@/shared/hooks/useCarouselAutoplay';
import type { Category } from '../types';

// Banner/bestseller bilan bir xil chegaralar (xs/sm/md/lg/xl/2xl: 640/768/1024/1280/1536).
const CATEGORY_BREAKPOINTS = [
  { minWidth: 1536, count: 7 },
  { minWidth: 1280, count: 6 },
  { minWidth: 1024, count: 5 },
  { minWidth: 768, count: 4 },
  { minWidth: 640, count: 3 },
];
const CATEGORY_BASE_COUNT = 2;

interface CategoryArrowProps {
  direction: 'prev' | 'next';
  onClick?: () => void;
  /** Avtomatik aylanishni 5 soniyaga pauza qilish uchun — qo'lda tortishda ham xuddi shunday ishlaydi. */
  onInteract?: () => void;
}

/** Karta chegarasidan biroz "chiqib turadigan" dumaloq, romkali tugma — rasm bilan orasida doim bo'shliq bor. */
function CategoryArrow({ direction, onClick, onInteract }: CategoryArrowProps) {
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

/** Bitta kategoriya (rasm + nom) — karusel slaydida ham, "Barchasi" panjarasida ham qayta ishlatiladi. */
function CategoryItem({ category }: { category: Category }) {
  return (
    <Link
      to={ROUTES.CATEGORY.replace(':id', category.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        color: 'var(--color-text)',
      }}
    >
      <div
        className="shadow-card category-card"
        style={{
          background: 'var(--color-surface)',
        }}
      >
        <div className="category-avatar" style={{ overflow: 'hidden' }}>
          <img
            src={category.image_url}
            alt={category.name}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>
      <span
        className="category-label"
        style={{
          fontWeight: 500,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {category.name}
      </span>
    </Link>
  );
}

/** Bosh sahifadagi "Kategoriyalar" qatori — rasm + nom, bosilsa shu kategoriyaga o'tadi. */
export function CategoryCarousel() {
  const { data: categories, isLoading } = useCategories();
  const t = useT();
  const responsiveCount = useResponsiveCount(CATEGORY_BREAKPOINTS, CATEGORY_BASE_COUNT);
  const [isExpanded, setIsExpanded] = useState(false);
  const carouselRef = useRef<CarouselRef>(null);
  const { handleInteraction, handlePointerDown, handlePointerUp } = useCarouselAutoplay(carouselRef, !isExpanded);

  if (isLoading) {
    return (
      <div className="section-panel">
        <div style={{ display: 'flex', gap: 24 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Avatar key={index} active size={120} shape="circle" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  // Real ma'lumot slotlardan kam bo'lsa ham qator to'liq ko'rinishi uchun, slidesToShow mavjud
  // kategoriya soniga moslanadi.
  const slidesToShow = Math.min(responsiveCount, categories.length);
  const canExpand = categories.length > 1;

  return (
    <div className="section-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{t('home.categories_title')}</h2>
        {canExpand && (
          <Button type="link" onClick={() => setIsExpanded((prev) => !prev)} style={{ paddingRight: 0 }}>
            {isExpanded ? t('common.show_less') : t('common.view_all')}
          </Button>
        )}
      </div>

      {isExpanded ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          {categories.map((category) => (
            <div key={category.id} style={{ width: 130 }}>
              <CategoryItem category={category} />
            </div>
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
            infinite
            autoplay={false}
            speed={600}
            cssEase="ease-in-out"
            prevArrow={<CategoryArrow direction="prev" onInteract={handleInteraction} />}
            nextArrow={<CategoryArrow direction="next" onInteract={handleInteraction} />}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
          >
            {categories.map((category) => (
              <div key={category.id} className="category-slide">
                <CategoryItem category={category} />
              </div>
            ))}
          </Carousel>
        </div>
      )}
    </div>
  );
}
