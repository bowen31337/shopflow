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
          const { token, user } = response.data;

          set({
            user,
            token,
            isLoading: false,
            error: null
          });

          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
          const { token, user } = response.data;

          set({
            user,
            token,
            isLoading: false,
            error: null
          });

          // Set auth header for future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
        delete api.defaults.headers.common['Authorization'];
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