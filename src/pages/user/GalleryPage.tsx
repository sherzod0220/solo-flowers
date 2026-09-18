import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { ArrowLeftOutlined, CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useGallery } from '@/features/gallery/hooks';
import { ROUTES } from '@/shared/constants/routes';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Pagination } from '@/shared/ui/Pagination';
import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

const PAGE_SIZE = 24;
/** Shundan kamrog'i — tortish joyiga qaytadi, ko'prog'i — keyingi/oldingi rasmga o'tadi. */
const SWIPE_THRESHOLD_PX = 60;

interface GalleryImage {
  url: string;
  description?: string;
  postId: string;
}

function navArrowStyle(side: 'left' | 'right'): CSSProperties {
  return {
    position: 'absolute',
    [side]: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.12)',
    border: 'none',
    color: '#fff',
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 18,
    zIndex: 2,
  };
}

export function GalleryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGallery({ page, page_size: PAGE_SIZE });
  const t = useT();

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Qo'l/sichqoncha bilan tortib o'tkazish (swipe) holati — telefondagi galereyaga o'xshab.
  const dragStartXRef = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  function goTo(next: number | null) {
    setActiveIndex(next);
  }

  // Iphone Photos uslubidagi zich panjara uchun har bir post rasmi alohida "karra" (tile) bo'ladi.
  const images: GalleryImage[] = useMemo(
    () =>
      (data?.items ?? []).flatMap((post) =>
        post.image_urls.map((url) => ({ url, description: post.description, postId: post.id })),
      ),
    [data],
  );

  useEffect(() => {
    if (activeIndex === null) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex]);

function goPrev() {
    setActiveIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
  }

  function goNext() {
    setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
  }

  useEffect(() => {
    if (activeIndex === null) return undefined;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') goTo(null);
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, images.length]);

  // Tortishni boshlash — keyingi pointermove/pointerup hodisalarini shu elementning o'ziga "ushlab qolamiz"
  // (pointer capture), shu bilan barmoq/sichqoncha rasm chegarasidan tashqariga chiqib ketsa ham uzilib qolmaydi.
  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    dragStartXRef.current = e.clientX;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (dragStartXRef.current === null) return;
    setDragX(e.clientX - dragStartXRef.current);
  }

  function handlePointerUp() {
    if (dragStartXRef.current === null) return;
    if (dragX < -SWIPE_THRESHOLD_PX) goNext();
    else if (dragX > SWIPE_THRESHOLD_PX) goPrev();
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  }

  const active = activeIndex !== null ? images[activeIndex] : null;

  return (
    <div>
      <PageMeta title={`${t('gallery.title')} — Solo`} />

      <Link
        to={ROUTES.HOME}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, color: 'var(--color-primary)' }}
      >
        <ArrowLeftOutlined /> {t('common.back_to_home')}
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginTop: 0, marginBottom: 24 }}>{t('gallery.title')}</h1>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : images.length === 0 ? (
        <EmptyState description={t('gallery.empty')} />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 3 }}>
            {images.map((img, i) => (
              <button
                key={`${img.postId}-${img.url}`}
                type="button"
                className="gallery-tile"
                onClick={() => goTo(i)}
                style={{
                  border: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                  aspectRatio: '1 / 1',
                  overflow: 'hidden',
                  background: 'var(--color-surface)',
                }}
              >
                <img src={img.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>

          {data?.pagination && <Pagination meta={data.pagination} onPageChange={setPage} />}
        </>
      )}

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          className="gallery-lightbox"
          onClick={() => goTo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              goTo(null);
            }}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              color: '#fff',
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 18,
              zIndex: 2,
            }}
          >
            <CloseOutlined />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                style={navArrowStyle('left')}
              >
                <LeftOutlined />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                style={navArrowStyle('right')}
              >
                <RightOutlined />
              </button>
            </>
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '86vh',
              cursor: isDragging ? 'grabbing' : 'grab',
              touchAction: 'pan-y',
              transform: `translateX(${dragX}px)`,
              // Faol tortish paytida darhol (kechikishsiz) barmoqni kuzatib borish uchun transition
              // o'chirilgan; qo'yib yuborilganda esa keyingi/oldingi rasmga yoki joyiga silliq qaytadi.
              transition: isDragging ? 'none' : 'transform 0.25s ease',
            }}
          >
            <img
              src={active.url}
              alt=""
              draggable={false}
              style={{ maxWidth: '90vw', maxHeight: '86vh', objectFit: 'contain', display: 'block', borderRadius: 4 }}
            />
            {active.description && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  padding: '28px 20px 16px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  color: '#fff',
                  fontSize: 14,
                  lineHeight: 1.5,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  pointerEvents: 'none',
                }}
              >
                {active.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
