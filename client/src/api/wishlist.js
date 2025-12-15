// API functions for wishlist operations
import api from './index.js';

export async function fetchWishlist() {
  return api.get('/api/wishlist');
}

export async function addToWishlist(productId) {
  return api.post('/api/wishlist', { product_id: productId });
}

export async function removeFromWishlist(productId) {
  return api.delete(`/api/wishlist/${productId}`);
}

export async function moveToCart(productId, quantity = 1) {
  return api.post(`/api/wishlist/${productId}/move-to-cart`, { quantity });
}

export async function getSharedWishlist(userId) {
  return api.get(`/api/wishlist/shared/${userId}`);
}
