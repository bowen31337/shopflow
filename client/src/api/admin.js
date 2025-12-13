import api from './index.js';

// Admin Dashboard API
export const adminApi = {
  // Dashboard metrics
  getMetrics: () => api.get('/admin/metrics'),

  // Analytics
  getAnalytics: (params = {}) => api.get('/admin/analytics', { params }),

  // Products
  getProducts: (params = {}) => api.get('/admin/products', { params }),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  updateOrder: (id, data) => api.put(`/admin/orders/${id}`, data),

  // Customers
  getCustomers: (params = {}) => api.get('/admin/customers', { params }),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Inventory tracking
  getInventory: (params = {}) => api.get('/admin/inventory', { params }),
  getProductInventory: (id) => api.get(`/admin/inventory/${id}`),
  updateStock: (id, data) => api.put(`/admin/inventory/${id}`, data),

  // Promo codes
  getPromoCodes: () => api.get('/admin/promo-codes'),
  createPromoCode: (data) => api.post('/admin/promo-codes', data),
  updatePromoCode: (id, data) => api.put(`/admin/promo-codes/${id}`, data),
  deletePromoCode: (id) => api.delete(`/admin/promo-codes/${id}`)
};