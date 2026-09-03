import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

import { UserLayout } from '@/app/layouts/UserLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { RequireAdmin } from '@/app/guards/RequireAdmin';

import { HomePage } from '@/pages/user/HomePage';
import { CartPage } from '@/pages/user/CartPage';
import { LoginPage } from '@/pages/user/LoginPage';
import { RegisterPage } from '@/pages/user/RegisterPage';

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
      { path: ROUTES.CART, element: <CartPage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.REGISTER, element: <RegisterPage /> },
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