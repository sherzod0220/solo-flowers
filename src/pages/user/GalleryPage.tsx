import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type PointerEvent } from 'react';
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
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const DOUBLE_CLICK_ZOOM = 2.5;

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

  // Yaqinlashtirish (zoom) holati — ikki barmoq bilan siqib-yoyish, sichqoncha g'ildiragi va
  // ikki marta bosish orqali. Zoom 1x'da yuqoridagi tortib-o'tkazish (swipe) ishlaydi, 1x'dan
  // katta bo'lganda esa tortish rasmni suriydi (pan), keyingi/oldingi rasmga o'tmaydi.
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPinching, setIsPinching] = useState(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef(1);
  const imageWrapRef = useRef<HTMLDivElement>(null);

  function resetZoom() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function goTo(next: number | null) {
    setActiveIndex(next);
    resetZoom();
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
    resetZoom();
  }

  function goNext() {
    setActiveIndex((i) => (i === null ? i : (i + 1) % images.length));
    resetZoom();
  }

  // Sichqoncha g'ildiragi/trackpad bilan zoom — brauzer sahifani aylantirmasligi uchun
  // `preventDefault` kerak, lekin React'ning sintetik `onWheel`i standart holatda passiv (React 17+),
  // shuning uchun bu yerda to'g'ridan-to'g'ri DOM'ga `{ passive: false }` bilan ulanadi.
  useEffect(() => {
    const el = imageWrapRef.current;
    if (activeIndex === null || !el) return undefined;
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      setZoom((z) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.0015));
        if (next <= MIN_ZOOM) setPan({ x: 0, y: 0 });
        return next;
      });
    }
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeIndex]);

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

  function pinchDistance() {
    const pts = Array.from(pointersRef.current.values());
    if (pts.length < 2) return null;
    const [a, b] = pts;
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  // Tortishni boshlash — keyingi pointermove/pointerup hodisalarini shu elementning o'ziga "ushlab qolamiz"
  // (pointer capture), shu bilan barmoq/sichqoncha rasm chegarasidan tashqariga chiqib ketsa ham uzilib qolmaydi.
  // Ikkinchi barmoq qo'yilsa — bu endi tortish emas, ikki barmoq bilan siqib-yoyish (pinch-zoom)ga aylanadi.
  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    // Ba'zi brauzerlarda ikkinchi barmoq uchun pointer capture konflikt berib xato tashlashi mumkin
    // (ayniqsa ko'p barmoqli teginish paytida) — bu safe/best-effort, asosiy gest kuzatuvi (pastda)
    // capture muvaffaqiyatsiz bo'lsa ham ishlashda davom etishi kerak.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // e'tiborsiz qoldiriladi
    }
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size === 2) {
      dragStartXRef.current = null;
      panStartRef.current = null;
      setIsDragging(false);
      setIsPinching(true);
      pinchStartDistRef.current = pinchDistance();
      pinchStartZoomRef.current = zoom;
      return;
    }

    if (zoom > 1) {
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    } else {
      dragStartXRef.current = e.clientX;
    }
    setIsDragging(true);
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pointersRef.current.size === 2) {
      const dist = pinchDistance();
      if (dist !== null && pinchStartDistRef.current) {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoomRef.current * (dist / pinchStartDistRef.current)));
        setZoom(next);
      }
      return;
    }

    if (zoom > 1 && panStartRef.current) {
      setPan({ x: e.clientX - panStartRef.current.x, y: e.clientY - panStartRef.current.y });
      return;
    }

    if (dragStartXRef.current === null) return;
    setDragX(e.clientX - dragStartXRef.current);
  }

  function handlePointerUp(e: PointerEvent<HTMLDivElement>) {
    pointersRef.current.delete(e.pointerId);

    if (pointersRef.current.size > 0) {
      // Ikki barmoqdan biri ko'tarildi — pinch tugadi, qolgan barmoq bilan hali tortish/pan
      // boshlanmagani uchun hozircha hech narsa qilmaymiz (foydalanuvchi qayta bosishi kerak).
      pinchStartDistRef.current = null;
      setIsPinching(false);
      if (zoom <= MIN_ZOOM) setPan({ x: 0, y: 0 });
      return;
    }

    pinchStartDistRef.current = null;
    setIsPinching(false);

    if (zoom > 1) {
      panStartRef.current = null;
      setIsDragging(false);
      return;
    }

    if (dragStartXRef.current === null) return;
    if (dragX < -SWIPE_THRESHOLD_PX) goNext();
    else if (dragX > SWIPE_THRESHOLD_PX) goPrev();
    dragStartXRef.current = null;
    setIsDragging(false);
    setDragX(0);
  }

  function handleDoubleClick(e: ReactMouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (zoom > 1) {
      resetZoom();
    } else {
      setZoom(DOUBLE_CLICK_ZOOM);
    }
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
            ref={imageWrapRef}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={handleDoubleClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '86vh',
              cursor: isDragging ? 'grabbing' : 'grab',
              // Barcha gest (tortish, pinch-zoom)ni o'zimiz JS orqali boshqaramiz — brauzerning
              // o'zi hech qaysi yo'nalishda scroll/zoom qilmasin.
              touchAction: 'none',
              transform:
                zoom > 1 ? `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` : `translateX(${dragX}px)`,
              // Faol tortish/pinch paytida darhol (kechikishsiz) barmoqni kuzatib borish uchun
              // transition o'chirilgan; qo'yib yuborilganda esa joyiga silliq qaytadi.
              transition: isDragging || isPinching ? 'none' : 'transform 0.25s ease',
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
