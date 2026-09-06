import { PageMeta } from '@/shared/ui/PageMeta';
import { useT } from '@/shared/i18n/useT';

/** Placeholder — brend haqidagi haqiqiy matn/rasm kelgach shu sahifa to'ldiriladi. */
export function AboutPage() {
  const t = useT();

  return (
    <div style={{ padding: '48px 16px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <PageMeta title={t('meta.about_title')} />

      <img src="/logo-S.PNG" alt="Solo" style={{ height: 72, width: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 24 }} />

      <h1 style={{ fontSize: 32, marginBottom: 16 }}>{t('about.title')}</h1>

      <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--color-text)', opacity: 0.85 }}>{t('about.paragraph')}</p>
    </div>
  );
}
