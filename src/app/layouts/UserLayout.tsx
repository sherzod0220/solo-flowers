import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Layout, Button, Space, Badge, Input, Drawer, Divider, Popconfirm, Modal, ConfigProvider } from 'antd';
import {
  ShoppingCartOutlined,
  HeartFilled,
  UserOutlined,
  InstagramFilled,
  TelegramFilled,
  FacebookFilled,
  MenuOutlined,
  PhoneOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { ROUTES } from '@/shared/constants/routes';
import { useLogout, useMe } from '@/features/auth/hooks';
import { useCartCount } from '@/features/cart/hooks';
import { CartDrawer } from '@/features/cart/components/CartDrawer';
import { useWishlistCount } from '@/features/wishlist/hooks';
import { CategoryNavMenu } from '@/features/categories/components/CategoryNavMenu';
import { LangSwitcher } from '@/shared/ui/LangSwitcher';
import { LocationButton } from '@/shared/ui/LocationButton';
import { useHideOnScroll } from '@/shared/hooks/useHideOnScroll';
import { useT } from '@/shared/i18n/useT';

const { Header, Content, Footer } = Layout;

const linkStyle = { color: 'var(--color-primary)', fontWeight: 500 };

// Facebook uchun hozircha haqiqiy account yo'q — '#' bilan placeholder sifatida qoldirilgan.
const SOCIAL_LINKS = [
  { key: 'instagram', href: 'https://instagram.com/soloflowers.uz', label: 'Instagram', icon: <InstagramFilled /> },
  { key: 'telegram', href: 'https://t.me/solo_flowers', label: 'Telegram', icon: <TelegramFilled /> },
  { key: 'facebook', href: '#', label: 'Facebook', icon: <FacebookFilled /> },
];

const CONTACT_PHONE_DISPLAY = '+998 50 005 07 53';
const CONTACT_PHONE_HREF = 'tel:+998500050753';

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
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : 'center',
        gap: stacked ? 12 : 14,
        width: stacked ? '100%' : undefined,
      }}
    >
      {user ? (
        <>
          {isAdmin && (
            <Link to={ROUTES.ADMIN.ROOT} style={linkStyle} onClick={onNavigate}>
              {t('nav.admin_panel')}
            </Link>
          )}
          <span style={{ color: 'var(--color-text)' }}>{user.email}</span>
          <Popconfirm
            title={t('auth.logout_confirm_title')}
            description={t('auth.logout_confirm_desc')}
            okText={t('nav.logout')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              logout();
              onNavigate?.();
            }}
          >
            <Button size="small" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
              {t('nav.logout')}
            </Button>
          </Popconfirm>
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
    </div>
  );
}

export function UserLayout() {
  const cartCount = useCartCount();
  const wishlistCount = useWishlistCount();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const t = useT();
  const isHeaderHidden = useHideOnScroll();

  function handleSearch(value: string) {
    const query = value.trim();
    if (!query) return;
    navigate(`${ROUTES.SEARCH}?q=${encodeURIComponent(query)}`);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
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

  const wishlistButton = (
    <Link to={ROUTES.WISHLIST} onClick={() => setIsMenuOpen(false)} aria-label={t('wishlist.title')}>
      <Badge count={wishlistCount} size="small" offset={[-2, 2]}>
        <Button type="text" icon={<HeartFilled style={{ fontSize: 20, color: 'var(--color-primary)' }} />} />
      </Badge>
    </Link>
  );

  // Admin panel/hisob email/kirish-chiqish endi alohida inline elementlar sifatida emas, balki
  // shu bitta user ikonka orqali ochiladigan Drawer ichida — navbar joyini tejash uchun ("joyni
  // tartiblash"), AuthLinks o'zi ichida holatga (admin/oddiy/tizimga kirmagan) qarab to'g'ri kontent chiqaradi.
  // Matn faqat desktop qatorda (u o'zi ham faqat >=1200px'da ko'rinadi) — burger paydo bo'ladigan
  // mobil qatorda har doim faqat ikonka, oraliq (1024-1199px) breakpoint alohida shart emas.
  function renderUserMenuButton(showLabel: boolean) {
    return (
      <button
        type="button"
        onClick={() => setIsUserMenuOpen(true)}
        aria-label={t('nav.profile')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: showLabel ? 6 : 0,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          color: 'var(--color-primary)',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        <UserOutlined style={{ fontSize: 20 }} />
        {showLabel && <span>{t('nav.profile')}</span>}
      </button>
    );
  }

  const contactPhoneLink = (
    <a href={CONTACT_PHONE_HREF} style={{ ...linkStyle, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
      <PhoneOutlined /> {CONTACT_PHONE_DISPLAY}
    </a>
  );

  return (
    // Storefront'ning butun matn ko'rinishi (sarlavhalardan tashqari, tugma/label/narx/paragraflar
    // ham) Zara uslubidagi elegant serif bilan sinaladi — admin panelga (AdminLayout, alohida
    // ConfigProvider'ga o'ralmagan) taalluqli emas, chunki bu shrift faqat shu qism ichida override qilinadi.
    <ConfigProvider theme={{ token: { fontFamily: 'var(--font-display)' } }}>
      <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)', fontFamily: 'var(--font-display)' }}>
        <Header
          className="site-header"
          style={{
            borderBottom: '1px solid var(--color-border)',
            height: 76,
            position: 'sticky',
            top: 0,
            zIndex: 100,
            transform: isHeaderHidden ? 'translateY(-100%)' : 'translateY(0)',
            transition: 'transform 0.35s ease',
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

            {/* Desktop nav qatori — ekran ~1200px'dan torayganda .nav-desktop-row CSS orqali yashiriladi.
                justifyContent: flex-end — qidiruv o'zining maxWidth chegarasiga yetgach, qolgan
                elementlar (katalog...hisob) chap tomonda "osilib" qolmasdan, logotipga qarama-qarshi
                o'ngga birlashib turishi uchun. */}
            <div className="nav-desktop-row" style={{ flex: 1, gap: 24, justifyContent: 'flex-end' }}>
              <Input.Search
                placeholder={t('common.search_products')}
                onSearch={handleSearch}
                allowClear
                style={{ maxWidth: 260, minWidth: 140, flex: 1 }}
              />

              <CategoryNavMenu />

              <Link to={ROUTES.ABOUT} style={linkStyle}>
                {t('nav.about')}
              </Link>

              {contactPhoneLink}
              <LocationButton variant="nav" />

              <LangSwitcher />
              {wishlistButton}
              {cartButton}
              {renderUserMenuButton(true)}
            </div>

            {/* Mobil qator — 768px'dan tor bo'lganda qidiruv joy tejash uchun ikonka+modalga almashadi
                (`.search-full-row`/`.search-icon-button` CSS orqali almashtiriladi), til tanlash ochiq
                turadi, qolgani (katalog/biz haqimizda/hisob) Drawer ichida. Sevimlilar endi shu qatorda
                to'g'ridan-to'g'ri ko'rinadi (avval Drawer ichida edi). */}
            <div className="nav-mobile-row" style={{ gap: 4, flex: 1, justifyContent: 'flex-end', minWidth: 0 }}>
              <div className="search-full-row" style={{ flex: '1 1 60px', minWidth: 0, maxWidth: 320 }}>
                <Input.Search placeholder={t('common.search_products')} onSearch={handleSearch} allowClear />
              </div>
              <Button
                type="text"
                className="search-icon-button"
                icon={<SearchOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />}
                onClick={() => setIsSearchOpen(true)}
                aria-label={t('common.search_products')}
              />
              <LocationButton variant="nav" />
              <LangSwitcher />
              {wishlistButton}
              {cartButton}
              {renderUserMenuButton(false)}
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
            className="page-container footer-row"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/logo-S.PNG" alt="Solo" style={{ height: 32, width: 32, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: '#fff' }}>Solo</span>
            </div>

            <div className="footer-contact" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', opacity: 0.75 }}>
                {t('footer.contact_title')}
              </span>
              <a
                href={CONTACT_PHONE_HREF}
                style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}
              >
                <PhoneOutlined /> {CONTACT_PHONE_DISPLAY}
              </a>
            </div>

            <LocationButton variant="footer" />

            <Space size={12} className="footer-social">
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
            <CategoryNavMenu variant="list" onNavigate={() => setIsMenuOpen(false)} />

            <Divider style={{ margin: 0 }} />

            <Link to={ROUTES.ABOUT} style={linkStyle} onClick={() => setIsMenuOpen(false)}>
              {t('nav.about')}
            </Link>

            {contactPhoneLink}
          </div>
        </Drawer>

        <Drawer title={t('nav.profile')} open={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} placement="right" size={300}>
          <AuthLinks stacked onNavigate={() => setIsUserMenuOpen(false)} />
        </Drawer>

        <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <Modal
          title={t('common.search_products')}
          open={isSearchOpen}
          onCancel={() => setIsSearchOpen(false)}
          footer={null}
          destroyOnHidden
        >
          <Input.Search placeholder={t('common.search_products')} onSearch={handleSearch} allowClear autoFocus />
        </Modal>
      </Layout>
    </ConfigProvider>
  );
}
