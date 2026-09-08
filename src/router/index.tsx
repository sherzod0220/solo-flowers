import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

import { UserLayout } from '@/app/layouts/UserLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { RequireAdmin } from '@/app/guards/RequireAdmin';
import { RequireAuth } from '@/app/guards/RequireAuth';

import { HomePage } from '@/pages/user/HomePage';
import { CartPage } from '@/pages/user/CartPage';
import { WishlistPage } from '@/pages/user/WishlistPage';
import { LoginPage } from '@/pages/user/LoginPage';
import { RegisterPage } from '@/pages/user/RegisterPage';
import { ProductDetailPage } from '@/pages/user/ProductDetailPage';
import { CategoryPage } from '@/pages/user/CategoryPage';
import { SearchPage } from '@/pages/user/SearchPage';
import { ForbiddenPage } from '@/pages/user/ForbiddenPage';
import { AboutPage } from '@/pages/user/AboutPage';

import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ProductsListPage } from '@/pages/admin/ProductsListPage';
import { CategoriesListPage } from '@/pages/admin/CategoriesListPage';
import { EventsListPage } from '@/pages/admin/EventsListPage';
import { OrdersListPage } from '@/pages/admin/OrdersListPage';

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.PRODUCT_DETAIL, element: <ProductDetailPage /> },
      { path: ROUTES.CATEGORY, element: <CategoryPage /> },
      { path: ROUTES.SEARCH, element: <SearchPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.CART, element: <CartPage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
      { path: ROUTES.FORBIDDEN, element: <ForbiddenPage /> },
      {
        element: <RequireAuth />,
        children: [{ path: ROUTES.WISHLIST, element: <WishlistPage /> }],
      },
    ],
  },
  {
    path: ROUTES.ADMIN.ROOT,
    element: <RequireAdmin />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: ROUTES.ADMIN.PRODUCTS, element: <ProductsListPage /> },
          { path: ROUTES.ADMIN.CATEGORIES, element: <CategoriesListPage /> },
          { path: ROUTES.ADMIN.EVENTS, element: <EventsListPage /> },
          { path: ROUTES.ADMIN.ORDERS, element: <OrdersListPage /> },
        ],
      },
    ],
  },
]);