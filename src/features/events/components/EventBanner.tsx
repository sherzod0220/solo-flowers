import { useState } from 'react';
import { Button, Carousel, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { ROUTES } from '@/shared/constants/routes';
import { EASE_OUT } from '@/shared/lib/motion';
import { useEvents } from '../hooks';
import type { Event } from '../types';

// Slayd matni (eyebrow → sarlavha → izoh → tugma) ketma-ket (stagger) pastdan chiqadi.
const contentVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

function EventSlide({ event, isActive }: { event: Event; isActive: boolean }) {
  const state = isActive ? 'visible' : 'hidden';

  return (
    <div
      className="event-banner-slide"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        // Fon qatlami (z-index: -1) slayddan tashqariga "tushib" ketmasligi uchun alohida stacking context.
        isolation: 'isolate',
        userSelect: 'none',
      }}
    >
      {/* Fon rasmi alohida qatlamda — faol slaydda sekin yaqinlashadi ("Ken Burns" effekti). */}
      <motion.div
        aria-hidden
        initial={{ scale: 1.08 }}
        animate={{ scale: isActive ? 1 : 1.08 }}
        transition={{ duration: isActive ? 6 : 0.6, ease: 'easeOut' }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: -1,
          backgroundImage: `linear-gradient(90deg, rgba(46,20,32,0.72), rgba(46,20,32,0.15)), url(${event.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <motion.div
        className="event-banner-content"
        style={{ color: '#fff' }}
        variants={contentVariants}
        initial="hidden"
        animate={state}
      >
        {event.eyebrow && (
          <motion.div
            variants={itemVariants}
            className="event-banner-eyebrow"
            style={{ textTransform: 'uppercase', letterSpacing: 2, opacity: 0.85 }}
          >
            {event.eyebrow}
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="event-banner-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
          {event.title}
        </motion.div>

        {event.subtitle && (
          <motion.div variants={itemVariants} className="event-banner-subtitle" style={{ opacity: 0.9 }}>
            {event.subtitle}
          </motion.div>
        )}

        {event.cta && (
          <motion.div variants={itemVariants}>
            <Link to={ROUTES.CATEGORY.replace(':id', event.category_id)}>
              <Button type="primary" size="large" className="event-banner-button" style={{ borderRadius: 999 }}>
                {event.cta}
              </Button>
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

/** Bosh sahifadagi katta banner — bir nechta event bo'lsa, ular orasida avtomatik va silliq almashib turadi. */
export function EventBanner() {
  const { data: events, isLoading } = useEvents();
  const [activeIndex, setActiveIndex] = useState(0);

  if (isLoading) {
    return <Skeleton.Image active style={{ width: '100%', height: 320 }} />;
  }

  if (!events || events.length === 0) return null;

  return (
    <motion.div
      className="event-banner-carousel"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: EASE_OUT }}
    >
      <Carousel autoplay autoplaySpeed={5000} draggable swipeToSlide beforeChange={(_, next) => setActiveIndex(next)}>
        {events.map((event, index) => (
          <EventSlide key={event.id} event={event} isActive={index === activeIndex} />
        ))}
      </Carousel>
    </motion.div>
  );
}
