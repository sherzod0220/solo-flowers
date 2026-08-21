import type { ReactNode } from 'react';
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: 'var(--color-primary)',
    colorTextBase: 'var(--color-text)',
    colorBgBase: 'var(--color-bg)',
    borderRadius: 8,
    fontFamily: `'Inter', 'Segoe UI', sans-serif`,
  },
};

export function AntdProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}