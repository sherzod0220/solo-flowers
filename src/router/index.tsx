import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/shared/constants/routes';

import { UserLayout } from '@/app/layouts/UserLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';

import { HomePage } from '@/pages/user/HomePage';
import { CartPage } from '@/pages/user/CartPage';

import { DashboardPage } from '@/pages/admin/DashboardPage';
import { ProductsListPage } from '@/pages/admin/ProductsListPage';
import { OrdersListPage } from '@/pages/admin/OrdersListPage';

export const router = createBrowserRouter([
  {
    element: <UserLayout />,
    children: [
      { path: ROUTES.HOME, element: <HomePage /> },
      { path: ROUTES.CART, element: <CartPage /> },
    ],
  },
  {
    path: ROUTES.ADMIN.ROOT,
    element: <AdminLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.ADMIN.PRODUCTS, element: <ProductsListPage /> },
      { path: ROUTES.ADMIN.ORDERS, element: <OrdersListPage /> },
    ],
  },
]);