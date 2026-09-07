import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Badge, Input, Drawer, Divider } from 'antd';
import {
  ShoppingCartOutlined,
  InstagramFilled,
  TelegramFilled,
  FacebookFilled,
  MenuOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';
import { useCartCount } from '@/features/cart/hooks';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { CategoryNavMenu } from '@/features/categories/components/CategoryNavMenu';
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

// TODO: haqiqiy telefon raqamiga almashtiring.
const CONTACT_PHONE_DISPLAY = '+998 90 123 45 67';
const CONTACT_PHONE_HREF = 'tel:+998901234567';

interface AuthLinksProps {
  stacked?: boolean;
  onNavigate?: () => void;
}

/** Login/register yoki hisob+chiqish bloki — desktop navbar va mobil Drawer'da qayta ishlatiladi. */
function AuthLinks({ stacked, onNavigate }: AuthLinksProps) {
  const { user, isAdmin } = useMe();
  const logout = useLogout();
  const t = useT();

  return (
    <Space orientation={stacked ? 'vertical' : 'horizontal'} size={stacked ? 12 : 'large'} style={stacked ? { width: '100%' } : undefined}>
      {user ? (
        <>
          {isAdmin && (
            <Link to={ROUTES.ADMIN.ROOT} style={linkStyle} onClick={onNavigate}>
              {t('nav.admin_panel')}
            </Link>
          )}
          <span style={{ color: 'var(--color-text)' }}>{user.email}</span>
          <Button
            size="small"
            onClick={() => {
              logout();
              onNavigate?.();
            }}
          >
            {t('nav.logout')}
          </Button>
        </>
      ) : (
        <>
          <Link to={ROUTES.LOGIN} style={linkStyle} onClick={onNavigate}>
            {t('nav.login')}
          </Link>
          <Link to={ROUTES.REGISTER} style={linkStyle} onClick={onNavigate}>
            {t('nav.register')}
          </Link>
        </>
      )}
    </Space>
  );
}

export function UserLayout() {
  const cartCount = useCartCount();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  function handleSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
  }

  const cartButton = (
    <Badge count={cartCount} size="small" offset={[-2, 2]}>
      <Button
        type="text"
        icon={<ShoppingCartOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />}
        onClick={() => {
          setIsCartOpen(true);
          setIsMenuOpen(false);
        }}
      />
    </Badge>
  );

  const contactPhoneLink = (
    <a href={CONTACT_PHONE_HREF} style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <PhoneOutlined /> {CONTACT_PHONE_DISPLAY}
    </a>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          padding: '0 24px',
          height: 76,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          className="page-container"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, height: '100%' }}
        >
          <Link to={ROUTES.HOME} style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img src="/logo-S.PNG" alt="Solo" style={{ height: 40, width: 40, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--color-primary)' }}>
              Solo
            </span>
          </Link>

          {/* Desktop nav qatori — ekran ~960px'dan torayganda .nav-desktop-row CSS orqali yashiriladi. */}
          <div className="nav-desktop-row" style={{ flex: 1, gap: 24 }}>
            <Input.Search
              placeholder={t('common.search_products')}
              onSearch={handleSearch}
              allowClear
              style={{ maxWidth: 260, flex: 1 }}
            />

            <CategoryNavMenu />

            <Link to={ROUTES.ABOUT} style={linkStyle}>
              {t('nav.about')}
            </Link>

            {contactPhoneLink}

            <LangSwitcher />
            {cartButton}
            <AuthLinks />
          </div>

          {/* Mobil qator — faqat savat va burger tugma, qolgani Drawer ichida. */}
          <div className="nav-mobile-row" style={{ gap: 4 }}>
            {cartButton}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />}
              onClick={() => setIsMenuOpen(true)}
              aria-label={t('nav.menu')}
            />
          </div>
        </div>
      </Header>

      <Content style={{ padding: '24px' }}>
        <div className="page-container">
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          background: 'var(--color-primary)',
          color: '#f6ccd9',
          padding: '32px 32px 24px',
        }}
      >
        <div
          className="page-container"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
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

      <Drawer title={t('nav.menu')} open={isMenuOpen} onClose={() => setIsMenuOpen(false)} placement="right" size={300}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input.Search placeholder={t('common.search_products')} onSearch={handleSearch} allowClear />

          <CategoryNavMenu variant="list" onNavigate={() => setIsMenuOpen(false)} />

          <Divider style={{ margin: 0 }} />

          <Link to={ROUTES.ABOUT} style={linkStyle} onClick={() => setIsMenuOpen(false)}>
            {t('nav.about')}
          </Link>

          {contactPhoneLink}

          <Divider style={{ margin: 0 }} />

          <LangSwitcher />

          <AuthLinks stacked onNavigate={() => setIsMenuOpen(false)} />
        </div>
      </Drawer>

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </Layout>
  );
}
