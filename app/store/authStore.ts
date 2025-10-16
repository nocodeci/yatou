import { create } from 'zustand';
import { User, UserRole, AuthState } from '@/app/types/auth';

interface AuthStore extends AuthState {
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // État initial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  login: (user: User, token: string) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    // TODO: Stocker le token dans AsyncStorage ou SecureStore
    console.log('Token:', token);
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    // TODO: Supprimer le token du stockage
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...userData },
      });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// Sélecteurs utiles
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsDriver = () => useAuthStore((state) => state.user?.role === 'driver');
export const useIsClient = () => useAuthStore((state) => state.user?.role === 'client');
