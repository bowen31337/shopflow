import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchCart, addToCart, updateCartItem, removeFromCart } from '../api/cart';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      // Fetch cart from server
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetchCart();
          set({ items: response.items, isLoading: false, error: null });
        } catch (error) {
          set({
            error: error.message || 'Failed to load cart',
            isLoading: false
          });
        }
      },

      // Add item to cart
      addToCart: async (productId, quantity = 1, variantId = null) => {
        set({ isLoading: true, error: null });
        try {
          const response = await addToCart(productId, quantity, variantId);
          set({
            items: response.items,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to add to cart',
            isLoading: false
          });
          throw error;
        }
      },

      // Update item quantity
      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const response = await updateCartItem(itemId, quantity);
          set({
            items: response.items,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to update quantity',
            isLoading: false
          });
          throw error;
        }
      },

      // Remove item from cart
      removeFromCart: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await removeFromCart(itemId);
          set({
            items: response.items,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to remove item',
            isLoading: false
          });
          throw error;
        }
      },

      // Clear entire cart
      clearCart: () => set({ items: [] }),

      // Clear error
      clearError: () => set({ error: null }),

      // Get cart totals
      getTotal: () => {
        const items = get().items;
        return items.reduce((total, item) => {
          const price = item.variant?.adjustedPrice || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },

      // Get item count
      getItemCount: () => {
        const items = get().items;
        return items.reduce((count, item) => count + item.quantity, 0);
      },

      // Check if product is in cart
      isInCart: (productId) => {
        const items = get().items;
        return items.some(item => item.product.id === productId);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
);

export default useCartStore;