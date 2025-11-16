/**
 * API Endpoints for DummyJSON API
 */
export const endpoints = {
  // Authentication
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },

  // Products
  products: {
    base: '/products',
    single: (id: number) => `/products/${id}`,
    search: '/products/search',
    categories: '/products/categories',
    category: (category: string) => `/products/category/${category}`,
    limit: (limit: number) => `/products?limit=${limit}`,
    skip: (skip: number, limit: number) => `/products?skip=${skip}&limit=${limit}`,
  },

  // Carts
  carts: {
    base: '/carts',
    single: (id: number) => `/carts/${id}`,
    user: (userId: number) => `/carts/user/${userId}`,
    add: '/carts/add',
    update: (id: number) => `/carts/${id}`,
    delete: (id: number) => `/carts/${id}`,
  },

  // Users
  users: {
    base: '/users',
    single: (id: number) => `/users/${id}`,
    search: '/users/search',
    filter: '/users/filter',
  },
} as const;