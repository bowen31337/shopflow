// API functions for cart
import api from './index.js';

export async function fetchCart() {
  return api.get('/api/cart');
}

export async function addToCart(productId, quantity = 1, variantId = null) {
  return api.post('/api/cart/items', {
    productId,
    quantity,
    variantId
  });
}

export async function updateCartItem(itemId, quantity) {
  return api.put(`/api/cart/items/${itemId}`, { quantity });
}

export async function removeFromCart(itemId) {
  return api.delete(`/api/cart/items/${itemId}`);
}

// Wishlist API functions for Save for Later functionality
export async function addToWishlist(productId) {
  return api.post('/api/wishlist', { product_id: productId });
}

export async function removeFromWishlist(productId) {
  return api.delete(`/api/wishlist/${productId}`);
}

// Promo code API functions
export async function applyPromoCode(code) {
  return api.post('/api/cart/promo-code', { code });
}

export async function removePromoCode() {
  return api.delete('/api/cart/promo-code');
}

export async function getCartTotals() {
  return api.get('/api/cart/totals');
}