/**
 * Services API pour YATOU
 * Connexion avec Supabase
 */

import { createClient } from '@supabase/supabase-js';
import {
  User,
  Driver,
  RegisterCredentials,
  LoginCredentials,
  AuthResponse,
} from '@/app/types/auth';
import { SUPABASE_CONFIG } from '@/app/config/supabase';

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
);

// Types pour la base de données
export interface DatabaseUser {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'customer' | 'driver' | 'admin';
  default_pickup_address?: string;
  default_pickup_coordinates?: { lat: number; lng: number };
  notification_preferences?: any;
  language?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDriver {
  id: string;
  user_id: string;
  license_number: string;
  vehicle_info: {
    type: 'moto' | 'fourgon' | 'camion';
    registration: string;
    model?: string;
    color?: string;
  };
  is_available: boolean;
  current_location?: { lat: number; lng: number };
  rating: number;
  total_deliveries: number;
  created_at: string;
  updated_at: string;
}

interface DatabaseDelivery {
  id: string;
  user_id: string;
  driver_id?: string;
  pickup_address: string;
  pickup_coordinates?: { lat: number; lng: number };
  delivery_address: string;
  delivery_coordinates: { lat: number; lng: number };
  description?: string;
  weight?: number;
  dimensions?: any;
  special_instructions?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'picked_up'
    | 'in_transit'
    | 'delivered'
    | 'cancelled';
  estimated_price: number;
  final_price?: number;
  estimated_duration?: number;
  actual_duration?: number;
  pickup_time?: string;
  delivery_time?: string;
  created_at: string;
  updated_at: string;
}

// Services d'authentification
export const authService = {
  // Inscription
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // Créer l'utilisateur dans Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;

      // Créer l'utilisateur dans la table users
      let userData;
      const { data: insertData, error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user?.id,
          email: credentials.email,
          password: 'managed_by_supabase_auth', // Placeholder car Supabase gère les mots de passe
          name: `${credentials.firstName} ${credentials.lastName}`,
          phone: credentials.phone,
          role: credentials.role === 'driver' ? 'driver' : 'customer',
        })
        .select()
        .single();

      if (userError) {
        console.error(
          "Erreur lors de la création de l'utilisateur:",
          userError,
        );
        // Si c'est une erreur RLS, essayer de récupérer l'utilisateur existant
        if (userError.message.includes('row-level security')) {
          // Attendre un peu et réessayer
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user?.id)
            .single();

          if (retryError) {
            throw new Error(
              "Impossible de créer l'utilisateur dans la base de données",
            );
          }

          userData = retryData;
        } else {
          throw userError;
        }
      } else {
        userData = insertData;
      }

      // Si c'est un livreur, créer l'entrée dans la table drivers
      if (
        credentials.role === 'driver' &&
        credentials.vehicleType &&
        credentials.licenseNumber &&
        credentials.vehicleRegistration
      ) {
        const { error: driverError } = await supabase.from('drivers').insert({
          user_id: userData.id,
          license_number: credentials.licenseNumber,
          vehicle_info: {
            type: credentials.vehicleType,
            model: `${credentials.vehicleType.toUpperCase()} YATOU`,
            color: 'Rouge',
            plate_number: credentials.vehicleRegistration,
          },
          is_available: false,
          rating: 0,
          total_deliveries: 0,
        });

        if (driverError) {
          console.error(
            'Erreur lors de la création du profil livreur:',
            driverError,
          );
          throw driverError;
        }

        console.log('✅ Profil livreur créé avec succès pour:', userData.email);
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        phone: userData.phone || '',
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: credentials.role,
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      return {
        user,
        token: authData.session?.access_token || '',
        refreshToken: authData.session?.refresh_token || '',
      };
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      throw error;
    }
  },

  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Récupérer les informations utilisateur
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (userError) throw userError;

      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const user: User = {
        id: userData.id,
        email: userData.email,
        phone: userData.phone || '',
        firstName,
        lastName,
        role: userData.role === 'driver' ? 'driver' : 'client',
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      return {
        user,
        token: data.session?.access_token || '',
        refreshToken: data.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },

  // Récupérer l'utilisateur actuel
  async getCurrentUser(): Promise<User | null> {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return null;

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error) throw error;

      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      return {
        id: userData.id,
        email: userData.email,
        phone: userData.phone || '',
        firstName,
        lastName,
        role: userData.role === 'driver' ? 'driver' : 'client',
        isActive: userData.is_active,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error);
      return null;
    }
  },

  // Exposer supabase pour l'AuthProvider
  supabase,
};

// Services pour les livreurs
export const driverService = {
  // Récupérer les informations du livreur
  async getDriverProfile(userId: string): Promise<Driver | null> {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (driverError) throw driverError;

      const [firstName, ...lastNameParts] = userData.name.split(' ');
      const lastName = lastNameParts.join(' ');

      return {
        id: driverData.id,
        userId: driverData.user_id,
        licenseNumber: driverData.license_number,
        vehicleInfo: {
          type: driverData.vehicle_info.type,
          model: driverData.vehicle_info.model || '',
          plate:
            driverData.vehicle_info.plate ||
            driverData.vehicle_info.registration ||
            '',
        },
        isAvailable: driverData.is_available,
        currentLocation: driverData.current_location
          ? {
              latitude:
                driverData.current_location.lat ||
                driverData.current_location.latitude,
              longitude:
                driverData.current_location.lng ||
                driverData.current_location.longitude,
            }
          : undefined,
        rating: driverData.rating,
        totalDeliveries: driverData.total_deliveries,
        createdAt: driverData.created_at,
        updatedAt: driverData.updated_at,
      };
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations du livreur:',
        error,
      );
      return null;
    }
  },

  // Mettre à jour le statut en ligne
  async updateOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_available: isOnline })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  // Mettre à jour la disponibilité du livreur (alias pour updateOnlineStatus)
  async updateDriverAvailability(
    driverId: string,
    isAvailable: boolean,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la disponibilité:',
        error,
      );
      throw error;
    }
  },

  // Mettre à jour la position
  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          current_location: { lat: latitude, lng: longitude },
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      throw error;
    }
  },

  // Mettre à jour la position d'un livreur par son ID
  async updateDriverLocation(
    driverId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({
          current_location: `(${longitude}, ${latitude})`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) throw error;
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la position du livreur:',
        error,
      );
      throw error;
    }
  },

  // Récupérer tous les livreurs disponibles dans une zone
  async getAvailableDriversInArea(
    centerLat: number,
    centerLng: number,
    radiusKm: number = 10,
  ): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select(
          `
          *,
          users!inner(id, name, email, phone)
        `,
        )
        .eq('is_available', true)
        .not('current_location', 'is', null);

      if (error) throw error;

      // Filtrer par distance (approximation simple)
      const filteredDrivers =
        data?.filter((driver) => {
          if (!driver.current_location) return false;

          let driverLat, driverLng;

          // Gérer différents formats de coordonnées
          if (typeof driver.current_location === 'string') {
            // Format: "(-5.0189,7.6995)"
            const match = driver.current_location.match(/\(([^,]+),([^)]+)\)/);
            if (match) {
              driverLng = parseFloat(match[1]);
              driverLat = parseFloat(match[2]);
            }
          } else if (
            driver.current_location.lat &&
            driver.current_location.lng
          ) {
            driverLat = driver.current_location.lat;
            driverLng = driver.current_location.lng;
          } else if (
            driver.current_location.latitude &&
            driver.current_location.longitude
          ) {
            driverLat = driver.current_location.latitude;
            driverLng = driver.current_location.longitude;
          }

          if (!driverLat || !driverLng) return false;

          // Calcul de distance simple (approximation)
          const distance =
            Math.sqrt(
              Math.pow(driverLat - centerLat, 2) +
                Math.pow(driverLng - centerLng, 2),
            ) * 111; // Approximation: 1 degré ≈ 111 km

          return distance <= radiusKm;
        }) || [];

      return filteredDrivers.map((driver) => ({
        id: driver.id,
        userId: driver.user_id,
        name: driver.users.name,
        email: driver.users.email,
        phone: driver.users.phone,
        vehicleType: driver.vehicle_info.type,
        vehicleModel: driver.vehicle_info.model,
        vehiclePlate: driver.vehicle_info.plate,
        rating: driver.rating,
        totalDeliveries: driver.total_deliveries,
        location: (() => {
          let lat, lng;

          // Gérer différents formats de coordonnées
          if (typeof driver.current_location === 'string') {
            // Format: "(-5.0189,7.6995)"
            const match = driver.current_location.match(/\(([^,]+),([^)]+)\)/);
            if (match) {
              lng = parseFloat(match[1]);
              lat = parseFloat(match[2]);
            }
          } else if (
            driver.current_location.lat &&
            driver.current_location.lng
          ) {
            lat = driver.current_location.lat;
            lng = driver.current_location.lng;
          } else if (
            driver.current_location.latitude &&
            driver.current_location.longitude
          ) {
            lat = driver.current_location.latitude;
            lng = driver.current_location.longitude;
          }

          return {
            latitude: lat || 0,
            longitude: lng || 0,
          };
        })(),
        isAvailable: driver.is_available,
      }));
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des livreurs disponibles:',
        error,
      );
      throw error;
    }
  },
};

// Services pour les livraisons
export const deliveryService = {
  // Créer une nouvelle livraison
  async createDelivery(deliveryData: {
    userId: string;
    pickupAddress: string;
    pickupCoordinates?: { lat: number; lng: number };
    deliveryAddress: string;
    deliveryCoordinates: { lat: number; lng: number };
    description?: string;
    weight?: number;
    specialInstructions?: string;
    estimatedPrice: number;
    estimatedDuration?: number;
  }): Promise<DatabaseDelivery> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          user_id: deliveryData.userId,
          pickup_address: deliveryData.pickupAddress,
          pickup_coordinates: deliveryData.pickupCoordinates
            ? `(${deliveryData.pickupCoordinates.lng},${deliveryData.pickupCoordinates.lat})`
            : null,
          delivery_address: deliveryData.deliveryAddress,
          delivery_coordinates: `(${deliveryData.deliveryCoordinates.lng},${deliveryData.deliveryCoordinates.lat})`,
          description: deliveryData.description,
          weight: deliveryData.weight,
          special_instructions: deliveryData.specialInstructions,
          status: 'pending',
          estimated_price: deliveryData.estimatedPrice,
          estimated_duration: deliveryData.estimatedDuration,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la livraison:', error);
      throw error;
    }
  },

  // Récupérer les livraisons disponibles pour les livreurs
  async getAvailableDeliveries(): Promise<DatabaseDelivery[]> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error);
      throw error;
    }
  },

  // Accepter une livraison
  async acceptDelivery(deliveryId: string, driverId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({
          driver_id: driverId,
          status: 'confirmed',
        })
        .eq('id', deliveryId);

      if (error) throw error;
    } catch (error) {
      console.error("Erreur lors de l'acceptation de la livraison:", error);
      throw error;
    }
  },

  // Refuser une livraison
  async rejectDelivery(deliveryId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('deliveries')
        .update({ status: 'cancelled' })
        .eq('id', deliveryId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors du refus de la livraison:', error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une livraison
  async updateDeliveryStatus(
    deliveryId: string,
    status: string,
  ): Promise<void> {
    try {
      const updateData: any = { status };

      if (status === 'picked_up') {
        updateData.pickup_time = new Date().toISOString();
      } else if (status === 'delivered') {
        updateData.delivery_time = new Date().toISOString();
      }

      const { error } = await supabase
        .from('deliveries')
        .update(updateData)
        .eq('id', deliveryId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  },

  // Récupérer les livraisons d'un livreur
  async getDriverDeliveries(driverId: string): Promise<DatabaseDelivery[]> {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('driver_id', driverId)
        .in('status', ['confirmed', 'picked_up', 'in_transit'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des livraisons du livreur:',
        error,
      );
      throw error;
    }
  },

  // Récupérer les livraisons d'un utilisateur (client)
  async getUserDeliveries(): Promise<DatabaseDelivery[]> {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser) throw new Error('Utilisateur non authentifié');

      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des livraisons de l'utilisateur:",
        error,
      );
      throw error;
    }
  },
};

// Services pour les notifications
export const notificationService = {
  // Créer une notification
  async createNotification(notificationData: {
    userId: string;
    deliveryId?: string;
    type: string;
    title: string;
    message: string;
  }): Promise<void> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: notificationData.userId,
        delivery_id: notificationData.deliveryId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  },

  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  },
};

// Services utilisateur
export const userService = {
  async getCurrentUserProfile(): Promise<{
    user: DatabaseUser & {
      notification_preferences?: Record<string, unknown>;
      language?: string;
    };
    driver: (DatabaseDriver & { user?: DatabaseUser }) | null;
  }> {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw authError || new Error('Utilisateur non authentifié');
    }

    const { data: userRow, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError || !userRow) {
      throw userError || new Error('Utilisateur non trouvé');
    }

    let driverRow: (DatabaseDriver & { user?: DatabaseUser }) | null = null;

    if (userRow.role === 'driver') {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', userRow.id)
        .single();

      if (driverError && driverError.code !== 'PGRST116') {
        console.warn(
          '⚠️ Impossible de récupérer le profil livreur:',
          driverError,
        );
      } else {
        driverRow = driverData ?? null;
      }
    }

    return {
      user: userRow,
      driver: driverRow,
    };
  },

  async updateUserProfile(
    updates: Partial<Pick<DatabaseUser, 'name' | 'phone'>> & {
      notification_preferences?: Record<string, unknown>;
      language?: string;
      default_pickup_address?: string | null;
      default_pickup_coordinates?: { lat: number; lng: number } | null;
    },
  ): Promise<DatabaseUser> {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw authError || new Error('Utilisateur non authentifié');
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error || !data) {
      throw error || new Error('Erreur lors de la mise à jour du profil');
    }

    return data;
  },
};
