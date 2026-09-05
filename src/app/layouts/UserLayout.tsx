import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Badge, Input } from 'antd';
import {
  ShoppingCartOutlined,
  InstagramFilled,
  TelegramFilled,
  FacebookFilled,
} from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';
import { useCartCount } from '@/features/cart/hooks';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { LangSwitcher } from '@/shared/ui/LangSwitcher';
import { useT } from '@/shared/i18n/useT';

const { Header, Content, Footer } = Layout;

const linkStyle = { color: 'var(--color-primary)', fontWeight: 500 };

// TODO: haqiqiy ijtimoiy tarmoq profillariga almashtiring.
const SOCIAL_LINKS = [
  { key: 'instagram', href: '#', label: 'Instagram', icon: <InstagramFilled /> },
  { key: 'telegram', href: '#', label: 'Telegram', icon: <TelegramFilled /> },
  { key: 'facebook', href: '#', label: 'Facebook', icon: <FacebookFilled /> },
];

export function UserLayout() {
  const { user, isAdmin } = useMe();
  const logout = useLogout();
  const cartCount = useCartCount();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  function handleSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`);
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 32px',
          height: 76,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src="/logo-S.PNG" alt="Solo" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-primary)' }}>
            Solo
          </span>
        </Link>

        <Input.Search
          placeholder={t('common.search_products')}
          onSearch={handleSearch}
          allowClear
          style={{ maxWidth: 320, flex: 1 }}
        />

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

      <Footer
        style={{
          background: 'var(--color-primary)',
          color: '#f6ccd9',
          padding: '32px 32px 24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            maxWidth: 1200,
            margin: '0 auto',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo-S.PNG" alt="Solo" style={{ height: 32, width: 32, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff' }}>Solo</span>
          </div>

          <Space size={12}>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="social-icon-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  fontSize: 16,
                }}
              >
                {social.icon}
              </a>
            ))}
          </Space>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, opacity: 0.75 }}>
          {t('nav.footer', { year: String(new Date().getFullYear()) })}
        </div>
      </Footer>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Layout>
  );
}
