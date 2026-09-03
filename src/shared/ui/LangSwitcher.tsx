import { Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useLangStore } from '@/shared/store/langStore';
import type { Lang } from '@/shared/lib/apiClient';

const LANG_OPTIONS: { value: Lang; code: string; nativeName: string }[] = [
  { value: 'uz', code: 'UZ', nativeName: "O'zbekcha" },
  { value: 'eng', code: 'EN', nativeName: 'English' },
  { value: 'ru', code: 'RU', nativeName: 'Русский' },
];

function CodeBadge({ code }: { code: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: 'var(--color-primary-light)',
        color: 'var(--color-primary)',
        fontSize: 10,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {code}
    </span>
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
        <CodeBadge code={option.code} />
        <span>{option.nativeName}</span>
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
          borderRadius: 999,
          padding: '3px 10px 3px 3px',
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        <CodeBadge code={current.code} />
        <DownOutlined style={{ fontSize: 9 }} />
      </button>
    </Dropdown>
  );
}
