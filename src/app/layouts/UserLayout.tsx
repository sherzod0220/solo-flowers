import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { DashboardOutlined, ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: ROUTES.ADMIN.DASHBOARD, icon: <DashboardOutlined />, label: <Link to={ROUTES.ADMIN.DASHBOARD}>Dashboard</Link> },
  { key: ROUTES.ADMIN.PRODUCTS, icon: <ShoppingOutlined />, label: <Link to={ROUTES.ADMIN.PRODUCTS}>Mahsulotlar</Link> },
  { key: ROUTES.ADMIN.ORDERS, icon: <FileTextOutlined />, label: <Link to={ROUTES.ADMIN.ORDERS}>Buyurtmalar</Link> },
];

export function AdminLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 600 }}>
          Admin Panel
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px' }} />
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}