import { Link } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import { useGallery } from '../hooks';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';

const FETCH_SIZE = 12;
const PREVIEW_COUNT = 10;

/** Bosh sahifadagi "Ommabop mahsulotlar" ostida ko'rinadigan galereya oldindan ko'rish bo'limi. */
export function GallerySection() {
  const { data, isLoading } = useGallery({ page: 1, page_size: FETCH_SIZE });
  const t = useT();

  const images = (data?.items ?? [])
    .flatMap((post) => post.image_urls.map((url) => ({ url, postId: post.id })))
    .slice(0, PREVIEW_COUNT);

  if (isLoading) {
    return (
      <div className="section-panel">
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  if (images.length === 0) return null;

  return (
    <div className="section-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, margin: 0 }}>{t('gallery.title')}</h2>
        <Link to={ROUTES.GALLERY}>
          <Button type="link" style={{ paddingRight: 0 }}>
            {t('common.view_all')}
          </Button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {images.map((img) => (
          <Link
            key={`${img.postId}-${img.url}`}
            to={ROUTES.GALLERY}
            className="gallery-tile"
            style={{ display: 'block', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 8 }}
          >
            <img src={img.url} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </Link>
        ))}
      </div>
    </div>
  );
}
