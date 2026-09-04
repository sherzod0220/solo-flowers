export const ROUTES = {
  HOME: '/',
  PRODUCT_DETAIL: '/product/:slug',
  CATEGORY: '/category/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  LOGIN: '/login',
  REGISTER: '/register',

  ADMIN: {
    ROOT: '/admin',
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/products',
    CATEGORIES: '/admin/categories',
    EVENTS: '/admin/events',
    ORDERS: '/admin/orders',
  },
} as const;