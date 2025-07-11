// 프로젝트 내 공유 상수들
export const ROUTES = {
  HOME: '/',
  USERS: '/users',
  USER_DETAIL: '/users/:id',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
} as const

export const API_ENDPOINTS = {
  USERS: '/users',
  PRODUCTS: '/products',
  ORDERS: '/orders',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
} as const

export const QUERY_KEYS = {
  USERS: ['users'],
  USER: (id: string) => ['user', id],
  PRODUCTS: ['products'],
  PRODUCT: (id: string) => ['product', id],
  ORDERS: ['orders'],
  ORDER: (id: string) => ['order', id],
  AUTH: {
    ME: ['auth', 'me'],
  },
} as const

export const PERMISSIONS = {
  USERS: {
    VIEW: 'users:view',
    CREATE: 'users:create',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
  },
  PRODUCTS: {
    VIEW: 'products:view',
    CREATE: 'products:create',
    UPDATE: 'products:update',
    DELETE: 'products:delete',
  },
  ORDERS: {
    VIEW: 'orders:view',
    CREATE: 'orders:create',
    UPDATE: 'orders:update',
    DELETE: 'orders:delete',
  },
} as const