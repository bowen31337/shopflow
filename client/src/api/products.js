// API functions for products
import api from './index.js';

export async function fetchProducts(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.category) queryParams.append('category', params.category);
  if (params.brand) queryParams.append('brand', params.brand);
  if (params.minPrice) queryParams.append('minPrice', params.minPrice);
  if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);
  if (params.search) queryParams.append('search', params.search);

  const url = `/api/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return api.get(url);
}

export async function fetchFeaturedProducts() {
  return api.get('/api/products/featured');
}

export async function fetchProductBySlug(slug) {
  return api.get(`/api/products/${slug}`);
}
