import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useLangStore } from '@/shared/store/langStore';
import type { Lang } from '@/shared/lib/apiClient';

const LANG_OPTIONS: { value: Lang; code: string; nativeName: string }[] = [
  { value: 'uz', code: 'UZ', nativeName: "O'zbekcha" },
  { value: 'eng', code: 'EN', nativeName: 'English' },
  { value: 'ru', code: 'RU', nativeName: 'Русский' },
];

/**
 * Emoji bayroqlar Windows/Chromium'da to'g'ri chizilmaydi (shrift muammosi) —
 * shuning uchun har bir til uchun mustaqil, kichik SVG bayroq ishlatiladi.
 */
function FlagIcon({ lang }: { lang: Lang }) {
  const style = { display: 'block', borderRadius: 3, flexShrink: 0 } as const;

  if (lang === 'uz') {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" style={style} aria-hidden>
        <rect width="22" height="16" fill="#fff" />
        <rect width="22" height="4.6" fill="#0099B5" />
        <rect y="4.6" width="22" height="0.9" fill="#CE1126" />
        <rect y="10.5" width="22" height="0.9" fill="#CE1126" />
        <rect y="11.4" width="22" height="4.6" fill="#1EB53A" />
        <circle cx="4.6" cy="2.3" r="1.5" fill="#fff" />
        <circle cx="5.2" cy="2.3" r="1.2" fill="#0099B5" />
      </svg>
    );
  }

  if (lang === 'eng') {
    return (
      <svg width="22" height="16" viewBox="0 0 22 16" style={style} aria-hidden>
        <rect width="22" height="16" fill="#00247D" />
        <path d="M0,0 L22,16 M22,0 L0,16" stroke="#fff" strokeWidth="3" />
        <path d="M0,0 L22,16 M22,0 L0,16" stroke="#CF142B" strokeWidth="1.2" />
        <path d="M11,0 V16 M0,8 H22" stroke="#fff" strokeWidth="5" />
        <path d="M11,0 V16 M0,8 H22" stroke="#CF142B" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width="22" height="16" viewBox="0 0 22 16" style={style} aria-hidden>
      <rect width="22" height="16" fill="#fff" />
      <rect y="5.33" width="22" height="5.34" fill="#0039A6" />
      <rect y="10.67" width="22" height="5.33" fill="#D52B1E" />
    </svg>
  );
}

export function LangSwitcher() {
  const lang = useLangStore((state) => state.lang);
  const setLang = useLangStore((state) => state.setLang);
  const current = LANG_OPTIONS.find((option) => option.value === lang) ?? LANG_OPTIONS[0];

  const items = LANG_OPTIONS.map((option) => ({
    key: option.value,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FlagIcon lang={option.value} />
        <span style={{ fontWeight: 600 }}>{option.code}</span>
        <span style={{ opacity: 0.7 }}>{option.nativeName}</span>
      </span>
    ),
  }));

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items,
        selectedKeys: [lang],
        onClick: ({ key }) => setLang(key as Lang),
      }}
    >
      <button
        type="button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-base)',
          padding: '7px 10px',
          lineHeight: 1,
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        <FlagIcon lang={current.value} />
        <span>{current.code}</span>
        <DownOutlined style={{ fontSize: 9 }} />
      </button>
    </Dropdown>
  );
}
