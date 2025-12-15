import api from './index.js';

// Admin Dashboard API
export const adminApi = {
  // Dashboard metrics
  getMetrics: () => api.get('/api/admin/metrics'),

  // Analytics
  getAnalytics: (params = {}) => api.get('/api/admin/analytics', { params }),

  // Products
  getProducts: (params = {}) => api.get('/api/admin/products', { params }),
  getProduct: (id) => api.get(`/api/admin/products/${id}`),
  createProduct: (data) => api.post('/api/admin/products', data),
  updateProduct: (id, data) => api.put(`/api/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/admin/products/${id}`),

  // Brands
  getBrands: () => api.get('/api/brands'),

  // Orders
  getOrders: (params = {}) => api.get('/api/admin/orders', { params }),
  updateOrder: (id, data) => api.put(`/api/admin/orders/${id}`, data),

  // Customers
  getCustomers: (params = {}) => api.get('/api/admin/customers', { params }),

  // Categories
  getCategories: () => api.get('/api/admin/categories'),
  createCategory: (data) => api.post('/api/admin/categories', data),
  updateCategory: (id, data) => api.put(`/api/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`),

  // Inventory tracking
  getInventory: (params = {}) => api.get('/api/admin/inventory', { params }),
  getProductInventory: (id) => api.get(`/api/admin/inventory/${id}`),
  updateStock: (id, data) => api.put(`/api/admin/inventory/${id}`, data),

  // Promo codes
  getPromoCodes: () => api.get('/api/admin/promo-codes'),
  createPromoCode: (data) => api.post('/api/admin/promo-codes', data),
  updatePromoCode: (id, data) => api.put(`/api/admin/promo-codes/${id}`, data),
  deletePromoCode: (id) => api.delete(`/api/admin/promo-codes/${id}`)
};