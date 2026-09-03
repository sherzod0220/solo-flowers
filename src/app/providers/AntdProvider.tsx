import type { ReactNode } from 'react';
import { App, ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: 'var(--color-primary)',
    borderRadius: 8,
    fontFamily: `'Inter', 'Segoe UI', sans-serif`,
  },
};

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      {/* antd'ning message/notification/Modal statik chaqiruvlari shu <App> konteksti orqali temani to'g'ri oladi. */}
      <App>{children}</App>
    </ConfigProvider>
  );
}