import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      maxItems: 8, // Limit to 8 recently viewed products

      // Add product to recently viewed
      addToRecentlyViewed: (product) => {
        const { recentlyViewed, maxItems } = get();

        // Remove if already exists to avoid duplicates
        const filtered = recentlyViewed.filter(item => item.id !== product.id);

        // Add to beginning of array
        const updated = [product, ...filtered];

        // Limit to maxItems
        const limited = updated.slice(0, maxItems);

        set({ recentlyViewed: limited });
      },

      // Clear recently viewed
      clearRecentlyViewed: () => set({ recentlyViewed: [] }),

      // Get recently viewed products (excluding current product if on product page)
      getRecentlyViewed: (excludeProductId = null) => {
        const { recentlyViewed } = get();
        if (excludeProductId) {
          return recentlyViewed.filter(product => product.id !== excludeProductId);
        }
        return recentlyViewed;
      },

      // Check if product is in recently viewed
      isRecentlyViewed: (productId) => {
        const { recentlyViewed } = get();
        return recentlyViewed.some(product => product.id === productId);
      }
    }),
    {
      name: 'recently-viewed-storage',
      partialize: (state) => ({
        recentlyViewed: state.recentlyViewed
      })
    }
  )
);

export default useRecentlyViewedStore;