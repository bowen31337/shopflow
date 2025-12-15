import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchCart, addToCart, updateCartItem, removeFromCart, applyPromoCode, removePromoCode, getCartTotals, addToWishlist, removeFromWishlist } from '../api/cart';
import api from '../api/index.js';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      wishlistItems: [],
      promoCode: null,
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

      // Fetch wishlist from server
      fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.get('/api/wishlist');
          set({ wishlistItems: data.wishlist || [], isLoading: false, error: null });
        } catch (error) {
          set({
            error: error.message || 'Failed to load wishlist',
            isLoading: false
          });
        }
      },

      // Sync cart with server for authenticated users
      syncCartWithServer: async (userId) => {
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
          // Fetch server cart
          const serverResponse = await fetchCart();

          // Get local cart from state
          const localItems = get().items;

          // Merge local and server carts
          const mergedItems = get().mergeCarts(localItems, serverResponse.items);

          // Save merged cart to server
          const savedResponse = await get().saveMergedCartToServer(mergedItems);

          set({
            items: savedResponse.items,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to sync cart with server',
            isLoading: false
          });
          throw error;
        }
      },

      // Sync wishlist with server for authenticated users
      syncWishlistWithServer: async (userId) => {
        if (!userId) return;

        set({ isLoading: true, error: null });
        try {
          const data = await api.get('/api/wishlist');
          set({ wishlistItems: data.wishlist || [], isLoading: false, error: null });
        } catch (error) {
          set({
            error: error.message || 'Failed to sync wishlist with server',
            isLoading: false
          });
          throw error;
        }
      },

      // Merge local cart with server cart
      mergeCarts: (localItems, serverItems) => {
        // Create a map of server items for quick lookup
        const serverItemsMap = new Map();
        serverItems.forEach(item => {
          const key = `${item.productId}-${item.variantId || 'null'}`;
          serverItemsMap.set(key, item);
        });

        // Merge logic: combine quantities for same products, keep all unique items
        const mergedItems = [...localItems];

        serverItems.forEach(serverItem => {
          const existingIndex = mergedItems.findIndex(item =>
            item.productId === serverItem.productId &&
            (item.variantId || null) === (serverItem.variantId || null)
          );

          if (existingIndex !== -1) {
            // Combine quantities for existing items
            const existingItem = mergedItems[existingIndex];
            const combinedQuantity = Math.min(
              existingItem.quantity + serverItem.quantity,
              99 // Max quantity limit
            );
            mergedItems[existingIndex] = {
              ...existingItem,
              quantity: combinedQuantity,
              unitPrice: serverItem.unitPrice, // Use server price
              totalPrice: serverItem.unitPrice * combinedQuantity
            };
          } else {
            // Add server item if not exists in local
            mergedItems.push(serverItem);
          }
        });

        return mergedItems;
      },

      // Save merged cart to server
      saveMergedCartToServer: async (mergedItems) => {
        // Clear current server cart first
        await get().clearServerCart();

        // Add all merged items to server cart
        for (const item of mergedItems) {
          await addToCart(item.productId, item.quantity, item.variantId);
        }

        // Fetch and return updated cart
        return await fetchCart();
      },

      // Clear server cart
      clearServerCart: async () => {
        const items = get().items;
        for (const item of items) {
          await removeFromCart(item.id);
        }
      },

      // Reorder items from a previous order
      reorderItems: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post(`/api/orders/${orderId}/reorder`);

          set({
            items: data.cart?.items || [],
            isLoading: false,
            error: null
          });

          return data;
        } catch (error) {
          set({
            error: error.message || 'Failed to reorder items',
            isLoading: false
          });
          throw error;
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

      // Save for later - move item from cart to wishlist
      saveForLater: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          // Get the item from current cart
          const items = get().items;
          const item = items.find(i => i.id === itemId);

          if (!item) {
            throw new Error('Item not found in cart');
          }

          // Add to wishlist
          await addToWishlist(item.product.id);

          // Remove from cart
          const response = await removeFromCart(itemId);

          // Update both cart and wishlist
          set({
            items: response.items,
            isLoading: false,
            error: null
          });

          // Sync wishlist
          get().fetchWishlist();

          return response;
        } catch (error) {
          set({
            error: error.message || 'Failed to save for later',
            isLoading: false
          });
          throw error;
        }
      },

      // Move from wishlist back to cart
      moveToCart: async (productId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          // Add to cart using existing addToCart function
          await addToCart(productId, quantity);

          // Remove from wishlist locally
          const wishlistItems = get().wishlistItems;
          const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);

          set({
            wishlistItems: updatedWishlist,
            isLoading: false,
            error: null
          });

          // Refresh both cart and wishlist
          get().fetchCart();
          get().fetchWishlist();

          return;
        } catch (error) {
          set({
            error: error.message || 'Failed to move to cart',
            isLoading: false
          });
          throw error;
        }
      },

      // Remove item from wishlist
      removeFromWishlist: async (productId) => {
        set({ isLoading: true, error: null });
        try {
          await removeFromWishlist(productId);

          // Update wishlist state
          const wishlistItems = get().wishlistItems;
          const updatedWishlist = wishlistItems.filter(item => item.product.id !== productId);

          set({
            wishlistItems: updatedWishlist,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to remove from wishlist',
            isLoading: false
          });
          throw error;
        }
      },

      // Apply promo code
      applyPromoCode: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await applyPromoCode(code);
          set({
            promoCode: response.promoCode,
            isLoading: false,
            error: null
          });
          return response;
        } catch (error) {
          set({
            error: error.message || 'Failed to apply promo code',
            isLoading: false
          });
          throw error;
        }
      },

      // Remove promo code
      removePromoCode: async () => {
        set({ isLoading: true, error: null });
        try {
          await removePromoCode();
          set({
            promoCode: null,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to remove promo code',
            isLoading: false
          });
          throw error;
        }
      },

      // Get cart totals with promo code
      getTotals: async () => {
        try {
          const response = await getCartTotals();
          return response.amounts;
        } catch (error) {
          console.error('Failed to get cart totals:', error);
          return null;
        }
      },

      // Clear entire cart
      clearCart: () => set({ items: [] }),

      // Clear wishlist
      clearWishlist: () => set({ wishlistItems: [] }),

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

      // Get wishlist count
      getWishlistCount: () => {
        const wishlistItems = get().wishlistItems;
        return wishlistItems.length;
      },

      // Check if product is in cart
      isInCart: (productId) => {
        const items = get().items;
        return items.some(item => item.product.id === productId);
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const wishlistItems = get().wishlistItems;
        return wishlistItems.some(item => item.product.id === productId);
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        wishlistItems: state.wishlistItems,
        promoCode: state.promoCode
      })
    }
  )
);

export default useCartStore;