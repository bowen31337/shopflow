// API functions for products

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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function fetchFeaturedProducts() {
  const response = await fetch('/api/products/featured');

  if (!response.ok) {
    throw new Error('Failed to fetch featured products');
  }

  return response.json();
}

export async function fetchProductBySlug(slug) {
  const response = await fetch(`/api/products/${slug}`);

  if (!response.ok) {
    throw new Error('Failed to fetch product');
  }

  return response.json();
}
