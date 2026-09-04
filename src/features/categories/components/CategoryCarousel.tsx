import { Link } from 'react-router-dom';
import { Carousel, Skeleton } from 'antd';
import { useCategories } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';

/** Bosh sahifadagi "Kategoriyalar" qatori — rasm + nom, bosilsa shu kategoriyaga o'tadi. */
export function CategoryCarousel() {
  const { data: categories, isLoading } = useCategories();
  const t = useT();

  if (isLoading) {
    return (
      <div style={{ background: '#F3EDD3', borderRadius: 24, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton.Avatar key={index} active size={72} shape="circle" />
          ))}
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  // Real ma'lumot slotlardan kam bo'lsa ham qator to'liq ko'rinishi uchun, slidesToShow mavjud kategoriya soniga moslanadi.
  const desktopShow = Math.min(6, categories.length);
  const tabletShow = Math.min(5, categories.length);
  const smallTabletShow = Math.min(4, categories.length);
  const mobileShow = Math.min(3, categories.length);

  return (
    <div style={{ background: '#F3EDD3', borderRadius: 24, padding: 24, marginBottom: 32 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, marginTop: 0, marginBottom: 16 }}>
        {t('home.categories_title')}
      </h2>
      <Carousel
        arrows
        dots={false}
        draggable
        infinite={false}
        slidesToShow={desktopShow}
        slidesToScroll={desktopShow}
        responsive={[
          { breakpoint: 1024, settings: { slidesToShow: tabletShow, slidesToScroll: tabletShow } },
          { breakpoint: 768, settings: { slidesToShow: smallTabletShow, slidesToScroll: smallTabletShow } },
          { breakpoint: 480, settings: { slidesToShow: mobileShow, slidesToScroll: mobileShow } },
        ]}
      >
        {categories.map((category) => (
          <div key={category.id}>
            <Link
              to={ROUTES.CATEGORY.replace(':id', category.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: '0 8px',
                color: 'var(--color-text)',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--color-primary-light)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={category.image_url}
                  alt={category.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 96,
                }}
              >
                {category.name}
              </span>
            </Link>
          </div>
        ))}
      </Carousel>
    </div>
  );
}
