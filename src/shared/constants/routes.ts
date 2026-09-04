export const ROUTES = {
  HOME: '/',
  PRODUCT_DETAIL: '/product/:slug',
  CATEGORY: '/category/:id',
  SEARCH: '/search',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',
  FORBIDDEN: '/403',

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    EVENTS: '/admin/events',
    ORDERS: '/admin/orders',
  },
} as const;