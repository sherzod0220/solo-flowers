import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Button, Space, Badge } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';
import { useCartCount } from '@/features/cart/hooks';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { LangSwitcher } from '@/shared/ui/LangSwitcher';
import { useT } from '@/shared/i18n/useT';

const { Header, Content, Footer } = Layout;

const linkStyle = { color: 'var(--color-primary)', fontWeight: 500 };

export function UserLayout() {
  const { user, isAdmin } = useMe();
  const logout = useLogout();
  const cartCount = useCartCount();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const t = useT();

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-primary-light)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 32px',
          height: 76,
        }}
      >
        <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-S.PNG" alt="Solo" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-primary)' }}>
            Solo
          </span>
        </Link>

        <Space size="large">
          <LangSwitcher />
          <Badge count={cartCount} size="small" offset={[-2, 2]}>
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />}
              onClick={() => setIsCartOpen(true)}
            />
          </Badge>
          {user ? (
            <>
              {isAdmin && (
                <Link to={ROUTES.ADMIN.ROOT} style={linkStyle}>
                  {t('nav.admin_panel')}
                </Link>
              )}
              <span style={{ color: 'var(--color-text)' }}>{user.email}</span>
              <Button size="small" onClick={logout}>
                {t('nav.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} style={linkStyle}>
                {t('nav.login')}
              </Link>
              <Link to={ROUTES.REGISTER} style={linkStyle}>
                {t('nav.register')}
              </Link>
            </>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        {t('nav.footer', { year: String(new Date().getFullYear()) })}
      </Footer>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Layout>
  );
}
