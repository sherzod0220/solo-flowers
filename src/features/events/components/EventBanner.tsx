import { Button, Skeleton } from 'antd';
import { useEvents } from '../hooks';

/** Bosh sahifadagi katta banner — ro'yxatdagi birinchi eventni ko'rsatadi (`is_root` saralash backendda bajariladi). */
export function EventBanner() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return <Skeleton.Image active style={{ width: '100%', height: 320 }} />;
  }

  const event = events?.[0];
  if (!event) return null;

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 24,
        overflow: 'hidden',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(90deg, rgba(42,18,24,0.78), rgba(42,18,24,0.2)), url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 48px',
        marginBottom: 32,
      }}
    >
      <div style={{ maxWidth: 420, color: '#fff' }}>
        {event.eyebrow && (
          <div style={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: 13, marginBottom: 8, opacity: 0.85 }}>
            {event.eyebrow}
          </div>
        )}

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, marginBottom: 12 }}>
          {event.title}
        </div>

        {event.subtitle && <div style={{ fontSize: 16, marginBottom: 20, opacity: 0.9 }}>{event.subtitle}</div>}

        {event.cta && (
          // Kategoriya sahifasiga real yo'naltirish — 7-bosqichda ROUTES.CATEGORY qo'shilgach ulanadi.
          <Button type="primary" size="large">
            {event.cta}
          </Button>
        )}
      </div>
    </div>
  );
}
