import { Outlet, Link } from 'react-router-dom';
import { Layout, Button, Space } from 'antd';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';

const { Header, Content, Footer } = Layout;

const linkStyle = { color: 'var(--color-primary)', fontWeight: 500 };

export function UserLayout() {
  const { user, isAdmin } = useMe();
  const logout = useLogout();

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
          {user ? (
            <>
              {isAdmin && (
                <Link to={ROUTES.ADMIN.ROOT} style={linkStyle}>
                  Admin panel
                </Link>
              )}
              <span style={{ color: 'var(--color-text)' }}>{user.email}</span>
              <Button size="small" onClick={logout}>
                Chiqish
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} style={linkStyle}>
                Kirish
              </Link>
              <Link to={ROUTES.REGISTER} style={linkStyle}>
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        © {new Date().getFullYear()} Solo — Flowers Boutique
      </Footer>
    </Layout>
  );
}