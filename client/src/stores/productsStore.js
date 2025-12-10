import { create } from 'zustand';
import api from '../api';

const useProductsStore = create((set, get) => ({
  products: [],
  categories: [],
  brands: [],
  featuredProducts: [],
  isLoading: false,
  error: null,

  // Fetch products with filters
  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await api.get(`/api/products?${params.toString()}`);
      set({
        products: response.data.products,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch products',
        isLoading: false
      });
    }
  },

  // Fetch featured products
  fetchFeaturedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/products/featured');
      set({
        featuredProducts: response.data.products,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch featured products',
        isLoading: false
      });
    }
  },

  // Fetch categories
  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/categories');
      set({
        categories: response.data.categories,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch categories',
        isLoading: false
      });
    }
  },

  // Fetch brands
  fetchBrands: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/api/brands');
      set({
        brands: response.data.brands,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch brands',
        isLoading: false
      });
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get product by slug
  getProductBySlug: (slug) => {
    const products = get().products;
    return products.find(product => product.slug === slug);
  }
}));

export default useProductsStore;