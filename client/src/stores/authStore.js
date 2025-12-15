import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Login action
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/login', { email, password });
          const { accessToken: token, user } = response;

          set({
            user,
            token,
            isLoading: false,
            error: null
          });

          // Set auth header for future requests
          api.setAuthToken(token);

          // Import cart store dynamically to avoid circular dependency
          const useCartStore = (await import('../stores/cartStore.js')).default;

          // Sync cart with server after login
          await useCartStore.getState().syncCartWithServer(user.id);
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'Login failed';
          const needsVerification = error.response?.data?.needsVerification;

          if (needsVerification) {
            // For email verification, we'll show a special message and redirect
            set({
              error: errorMessage,
              isLoading: false
            });
            throw error;
          }

          set({
            error: errorMessage,
            isLoading: false
          });
          throw error;
        }
      },

      // Register action
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/auth/register', userData);
          const { accessToken: token, user } = response;

          set({
            user,
            token,
            isLoading: false,
            error: null
          });

          // Set auth header for future requests
          api.setAuthToken(token);

          // Import cart store dynamically to avoid circular dependency
          const useCartStore = (await import('../stores/cartStore.js')).default;

          // Sync cart with server after registration
          await useCartStore.getState().syncCartWithServer(user.id);
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        // Clear cart when logging out
        try {
          const useCartStore = (await import('../stores/cartStore.js')).default;
          useCartStore.getState().clearCart();
          useCartStore.getState().clearWishlist();
        } catch (error) {
          console.error('Error clearing cart on logout:', error);
        }
        
        set({ user: null, token: null, error: null });
        api.setAuthToken(null);
      },

      // Google login action (mock implementation)
      googleLogin: async () => {
        set({ isLoading: true, error: null });
        try {
          // Mock Google OAuth flow - in a real app, this would redirect to Google's OAuth
          const response = await api.post('/api/auth/google');
          const { accessToken: token, user } = response;

          set({
            user,
            token,
            isLoading: false,
            error: null
          });

          // Set auth header for future requests
          api.setAuthToken(token);

          // Import cart store dynamically to avoid circular dependency
          const useCartStore = (await import('../stores/cartStore.js')).default;

          // Sync cart with server after login
          await useCartStore.getState().syncCartWithServer(user.id);
        } catch (error) {
          set({
            error: error.response?.data?.message || 'Google login failed',
            isLoading: false
          });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check if user is authenticated
      isAuthenticated: () => {
        const state = get();
        return !!state.token && !!state.user;
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
      onRehydrateStorage: () => (state) => {
        // Set the auth token on the API client when state is rehydrated from storage
        if (state?.token) {
          api.setAuthToken(state.token);
        }
      }
    }
  )
);

export default useAuthStore;