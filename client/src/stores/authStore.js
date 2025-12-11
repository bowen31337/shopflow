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
          set({
            error: error.response?.data?.message || 'Login failed',
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
      logout: () => {
        set({ user: null, token: null, error: null });
        api.setAuthToken(null);
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
      })
    }
  )
);

export default useAuthStore;