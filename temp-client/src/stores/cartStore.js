import { create } from 'zustand';
import * as cartApi from '../api/cart.js';

const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  loading: false,
  error: null,

  // Fetch cart from server
  fetchCart: async () => {
    try {
      set({ loading: true, error: null });
      const response = await cartApi.fetchCart();
      set({
        items: response.items,
        subtotal: response.subtotal,
        loading: false
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false
      });
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity, variantId = null) => {
    try {
      set({ loading: true, error: null });
      const response = await cartApi.addToCart(productId, quantity, variantId);
      set({
        items: response.items,
        subtotal: response.subtotal,
        loading: false
      });
      return response;
    } catch (error) {
      set({
        error: error.message,
        loading: false
      });
      throw error;
    }
  },

  // Update item quantity
  updateItem: async (id, quantity) => {
    try {
      set({ loading: true, error: null });
      const response = await cartApi.updateCartItem(id, quantity);
      set({
        items: response.items,
        subtotal: response.subtotal,
        loading: false
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false
      });
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await cartApi.removeFromCart(id);
      set({
        items: response.items,
        subtotal: response.subtotal,
        loading: false
      });
    } catch (error) {
      set({
        error: error.message,
        loading: false
      });
      throw error;
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
}));

export default useCartStore;