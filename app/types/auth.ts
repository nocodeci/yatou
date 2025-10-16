/**
 * Types pour l'authentification YATOU
 */

export type UserRole = 'client' | 'driver';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Driver extends User {
  role: 'driver';
  vehicleType: 'moto' | 'fourgon' | 'camion';
  licenseNumber: string;
  vehicleRegistration: string;
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalDeliveries: number;
  earnings: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  // Champs spécifiques aux livreurs
  vehicleType?: 'moto' | 'fourgon' | 'camion';
  licenseNumber?: string;
  vehicleRegistration?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}
