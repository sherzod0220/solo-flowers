import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu, Button, Space } from 'antd';
import {
  DashboardOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  FileTextOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';
import { useT } from '@/shared/i18n/useT';
import { LangSwitcher } from '@/shared/ui/LangSwitcher';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const t = useT();

  const menuItems = [
    { key: ROUTES.ADMIN.DASHBOARD, icon: <DashboardOutlined />, label: <Link to={ROUTES.ADMIN.DASHBOARD}>{t('admin.dashboard')}</Link> },
    { key: ROUTES.ADMIN.PRODUCTS, icon: <ShoppingOutlined />, label: <Link to={ROUTES.ADMIN.PRODUCTS}>{t('admin.products')}</Link> },
    { key: ROUTES.ADMIN.CATEGORIES, icon: <AppstoreOutlined />, label: <Link to={ROUTES.ADMIN.CATEGORIES}>{t('admin.categories')}</Link> },
    { key: ROUTES.ADMIN.EVENTS, icon: <NotificationOutlined />, label: <Link to={ROUTES.ADMIN.EVENTS}>{t('admin.events')}</Link> },
    { key: ROUTES.ADMIN.ORDERS, icon: <FileTextOutlined />, label: <Link to={ROUTES.ADMIN.ORDERS}>{t('admin.orders')}</Link> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <div style={{ color: 'white', textAlign: 'center', padding: '16px', fontWeight: 600 }}>
          {t('admin.panel_title')}
        </div>
        <Menu theme="dark" mode="inline" items={menuItems} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Space size={16}>
            <LangSwitcher />
            <Link to={ROUTES.HOME}>
              <Button icon={<HomeOutlined />}>{t('admin.go_to_site')}</Button>
            </Link>
          </Space>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
