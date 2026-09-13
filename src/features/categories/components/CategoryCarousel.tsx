import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import { useCategories } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import type { Category } from '../types';

/** Bir soniyada necha piksel siljishi — kategoriya soni ko'paysa/kamaysa ham har bir element tezligi bir xil qolishi uchun animatsiya davomiyligi shunga qarab hisoblanadi. */
const MARQUEE_PX_PER_SECOND = 40;

/** Bitta kategoriya (rasm + nom) — marquee qatorida ham, "Barchasi" panjarasida ham qayta ishlatiladi. */
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

/**
 * To'xtovsiz, bir xil tezlikda o'ngdan-chapga siljiydigan qator. Ro'yxat ikki marta
 * takrorlanadi va track -50%ga siljitiladi — shu bilan aylanish "choksiz" ko'rinadi.
 * Sichqoncha ustiga kelinganda pauza qiladi (o'qish/bosish uchun qulay).
 */
function CategoryMarquee({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    if (!trackRef.current) return;
    // Track ikki nusxadan iborat — haqiqiy bitta to'plamning eni shuning yarmi.
    const singleSetWidth = trackRef.current.scrollWidth / 2;
    if (singleSetWidth > 0) {
      setDuration(singleSetWidth / MARQUEE_PX_PER_SECOND);
    }
  }, [categories]);

  return (
    <div className="category-marquee">
      <div ref={trackRef} className="category-marquee-track" style={{ animationDuration: `${duration}s` }}>
        {[...categories, ...categories].map((category, index) => (
          <div key={`${category.id}-${index}`} className="category-marquee-item">
            <CategoryItem category={category} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Bosh sahifadagi "Kategoriyalar" qatori — rasm + nom, bosilsa shu kategoriyaga o'tadi. */
export function CategoryCarousel() {
  const { data: categories, isLoading } = useCategories();
  const t = useT();
  const [isExpanded, setIsExpanded] = useState(false);

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
        // Diqqat: CSS Grid `repeat(auto-fill, minmax(...))` keng ekranda kategoriya sonidan ko'proq
        // "bo'sh" ustun yaratib, mavjud kartalarni haqiqiy kerakli o'lchamidan kichikroq qilib
        // siqib qo'yardi (auto-fill bo'sh ustunlarni ham joy sifatida hisoblaydi). Shuning uchun
        // Grid o'rniga har bir kartaga BIR XIL o'lchamli (mobil bilan bir xil ko'rinish) `flex-wrap`
        // ishlatiladi — qator to'lganda keyingi kategoriyalar pastdan yangi qatorga tushadi.
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
        <CategoryMarquee categories={categories} />
      )}
    </div>
  );
}
