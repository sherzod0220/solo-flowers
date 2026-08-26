import { Outlet, Link } from 'react-router-dom';
import { Layout } from 'antd';
import { ROUTES } from '@/shared/constants/routes';

const { Header, Content, Footer } = Layout;

export function UserLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Link to={ROUTES.HOME} style={{ color: 'white', fontSize: 20, fontWeight: 600 }}>
          🌸 Solo Flowers
        </Link>
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