import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Carousel, Skeleton } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useCategories } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { useResponsiveCount } from '@/shared/hooks/useResponsiveCount';
import type { Category } from '../types';

// Banner/bestseller bilan bir xil chegaralar (xs/sm/md/lg/xl/2xl: 640/768/1024/1280/1536).
// Doira/karta o'lchami endi foiz asosida (index.css'dagi .category-card/.category-avatar) —
// shuning uchun bu yerda sonlar orasidagi farq endi "bo'sh joy ochilib qolish"ga olib kelmaydi.
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
}

/** Karta chegarasidan biroz "chiqib turadigan" dumaloq, romkali tugma — rasm bilan orasida doim bo'shliq bor. */
function CategoryArrow({ direction, onClick }: CategoryArrowProps) {
  const t = useT();
  return (
    <button
      type="button"
      className={`carousel-arrow-button carousel-arrow-button--${direction}`}
      onClick={onClick}
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
          border: '1px solid var(--color-border)',
          borderRadius: 24,
        }}
      >
        <div
          className="image-pedestal category-avatar"
          style={{
            borderRadius: '50%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14%',
          }}
        >
          <img
            src={category.image_url}
            alt={category.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
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

  if (isLoading) {
    return (
      <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
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
  // "Barchasi" tugmasi faqat carusel aylantirishga arziydigan darajada kategoriya bo'lsagina ko'rinadi.
  const canExpand = categories.length > slidesToShow;

  return (
    <div style={{ position: 'relative', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 24, padding: 24, marginBottom: 32 }}>
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
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: 16,
          }}
        >
          {categories.map((category) => (
            <CategoryItem key={category.id} category={category} />
          ))}
        </div>
      ) : (
        <Carousel
          arrows
          dots={false}
          draggable
          swipeToSlide
          infinite
          autoplay
          autoplaySpeed={3000}
          prevArrow={<CategoryArrow direction="prev" />}
          nextArrow={<CategoryArrow direction="next" />}
          slidesToShow={slidesToShow}
          slidesToScroll={1}
        >
          {categories.map((category) => (
            <div key={category.id} className="category-slide">
              <CategoryItem category={category} />
            </div>
          ))}
        </Carousel>
      )}
    </div>
  );
}
