import { Button, Carousel, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';
import { useEvents } from '../hooks';
import type { Event } from '../types';

function EventSlide({ event }: { event: Event }) {
  return (
    <div
      className="event-banner-slide"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `linear-gradient(90deg, rgba(46,20,32,0.72), rgba(46,20,32,0.15)), url(${event.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        userSelect: 'none',
      }}
    >
      <div className="event-banner-content" style={{ color: '#fff' }}>
        {event.eyebrow && (
          <div className="event-banner-eyebrow" style={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.85 }}>
            {event.eyebrow}
          </div>
        )}

        <div className="event-banner-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {event.title}
        </div>

        {event.subtitle && (
          <div className="event-banner-subtitle" style={{ opacity: 0.9 }}>
            {event.subtitle}
          </div>
        )}

        {event.cta && (
          <Link to={ROUTES.CATEGORY.replace(':id', event.category_id)}>
            <Button type="primary" size="large" className="event-banner-button" style={{ borderRadius: 999 }}>
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
    <div className="event-banner-carousel">
      <Carousel autoplay autoplaySpeed={5000} draggable swipeToSlide>
        {events.map((event) => (
          <EventSlide key={event.id} event={event} />
        ))}
      </Carousel>
    </div>
  );
}
