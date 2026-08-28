import { Outlet, Link } from 'react-router-dom';
import { Layout, Button, Space } from 'antd';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';

const { Header, Content, Footer } = Layout;

export function UserLayout() {
  const { user, isAdmin } = useMe();
  const logout = useLogout();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to={ROUTES.HOME} style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
          🌸 Solo Flowers
        </Link>

        <Space>
          {user ? (
            <>
              {isAdmin && (
                <Link to={ROUTES.ADMIN.ROOT} style={{ color: 'white' }}>
                  Admin panel
                </Link>
              )}
              <span style={{ color: 'white' }}>{user.email}</span>
              <Button size="small" onClick={logout}>
                Chiqish
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} style={{ color: 'white' }}>
                Kirish
              </Link>
              <Link to={ROUTES.REGISTER} style={{ color: 'white' }}>
                Ro'yxatdan o'tish
              </Link>
            </>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '24px' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} Solo Flowers
      </Footer>
    </Layout>
  );
}