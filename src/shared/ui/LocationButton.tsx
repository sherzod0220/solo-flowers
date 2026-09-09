import { useState } from 'react';
import { Modal } from 'antd';
import { EnvironmentOutlined, EnvironmentFilled, CarOutlined } from '@ant-design/icons';
import { useT } from '@/shared/i18n/useT';

const LOCATION_ADDRESS = 'Mirabad 12, Tashkent, Uzbekistan';
const LOCATION_LAT = 41.298003;
const LOCATION_LNG = 69.267796;

const MAP_OPTIONS = [
  {
    key: 'yandex-maps',
    labelKey: 'location.yandex_maps' as const,
    icon: <EnvironmentOutlined />,
    href: `https://yandex.com/maps/?ll=${LOCATION_LNG},${LOCATION_LAT}&z=17&pt=${LOCATION_LNG},${LOCATION_LAT},pm2rdm`,
  },
  {
    key: 'google-maps',
    labelKey: 'location.google_maps' as const,
    icon: <EnvironmentOutlined />,
    href: `https://www.google.com/maps/search/?api=1&query=${LOCATION_LAT},${LOCATION_LNG}`,
  },
  {
    key: 'yandex-taxi',
    labelKey: 'location.yandex_taxi' as const,
    icon: <CarOutlined />,
    href: `https://3.redirect.appmetrica.yandex.com/route?end-lat=${LOCATION_LAT}&end-lon=${LOCATION_LNG}&level=16&appmetrica_tracking_id=1178268795219780156`,
  },
];

interface LocationButtonProps {
  /** `nav` — navbar'da faqat ikonka (responsivlikni buzmasligi uchun matn yo'q); `footer` — footer'dagi "Manzil" bloki (Aloqa bilan bir xil uslub, to'liq manzil bilan). */
  variant: 'nav' | 'footer';
}

/**
 * Bosilganda xarita/taxi ilovasini tanlash uchun Modal ochadigan manzil tugmasi — navbar (mobil va
 * desktop qatorlarda alohida-alohida, LangSwitcher kabi) va footer'da qayta ishlatiladi.
 */
export function LocationButton({ variant }: LocationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useT();

  return (
    <>
      {variant === 'nav' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('location.title')}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <EnvironmentFilled style={{ fontSize: 20, color: 'var(--color-primary)' }} />
        </button>
      ) : (
        <button
          type="button"
          className="footer-location-trigger"
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            color: '#fff',
          }}
        >
          <span style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.75 }}>
            {t('footer.location_title')}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, whiteSpace: 'nowrap' }}>
            <EnvironmentOutlined /> {LOCATION_ADDRESS}
          </span>
        </button>
      )}

      <Modal title={t('location.modal_title')} open={isOpen} onCancel={() => setIsOpen(false)} footer={null} destroyOnHidden>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text)', opacity: 0.75, marginBottom: 16 }}>
          <EnvironmentOutlined /> {LOCATION_ADDRESS}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MAP_OPTIONS.map((option) => (
            <a
              key={option.key}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 14px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-base)',
                color: 'var(--color-text)',
                fontWeight: 500,
              }}
            >
              <span style={{ color: 'var(--color-primary)', fontSize: 18, display: 'flex' }}>{option.icon}</span>
              {t(option.labelKey)}
            </a>
          ))}
        </div>
      </Modal>
    </>
  );
}
