import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '@/app/types/auth';

interface AuthStore extends AuthState {
  // Actions
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
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
  login: async (user: User, token: string, refreshToken?: string) => {
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    try {
      const entries: [string, string][] = [
        ['userToken', token],
        ['userProfile', JSON.stringify(user)],
      ];

      if (refreshToken) {
        entries.push(['refreshToken', refreshToken]);
      } else {
        await AsyncStorage.removeItem('refreshToken');
      }

      await AsyncStorage.multiSet(entries);
    } catch (storageError) {
      console.error(
        'Erreur lors du stockage du token utilisateur:',
        storageError,
      );
    }
  },

  logout: async () => {
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    try {
      await AsyncStorage.multiRemove([
        'userToken',
        'refreshToken',
        'userProfile',
      ]);
    } catch (storageError) {
      console.error('Erreur lors de la suppression des tokens:', storageError);
    }
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
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useUserRole = () => useAuthStore((state) => state.user?.role);
export const useIsDriver = () =>
  useAuthStore((state) => state.user?.role === 'driver');
export const useIsClient = () =>
  useAuthStore((state) => state.user?.role === 'client');
