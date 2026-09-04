import { Button, Carousel, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useEvents } from '../hooks';
import type { Event } from '../types';

function EventSlide({ event }: { event: Event }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 320,
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(90deg, rgba(42,18,24,0.78), rgba(42,18,24,0.2)), url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '0 48px',
        userSelect: 'none',
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
          <Link to={ROUTES.CATEGORY.replace(':id', event.category_id)}>
            <Button type="primary" size="large">
              {event.cta}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

/** Bosh sahifadagi katta banner — bir nechta event bo'lsa, ular orasida avtomatik va silliq almashib turadi. */
export function EventBanner() {
  const { data: events, isLoading } = useEvents();

  if (isLoading) {
    return <Skeleton.Image active style={{ width: '100%', height: 320 }} />;
  }

  if (!events || events.length === 0) return null;

  return (
    <div style={{ borderRadius: 24, overflow: 'hidden', marginBottom: 32, cursor: 'grab' }}>
      <Carousel autoplay autoplaySpeed={5000} draggable swipeToSlide>
        {events.map((event) => (
          <EventSlide key={event.id} event={event} />
        ))}
      </Carousel>
    </div>
  );
}
