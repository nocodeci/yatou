import * as Location from 'expo-location';
import { driverService } from './api';

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking = false;
  private updateInterval: NodeJS.Timeout | null = null;
  private lastKnownLocation: LocationUpdate | null = null;

  /**
   * Démarrer le suivi de position pour un livreur
   */
  async startLocationTracking(driverId: string, userId: string): Promise<boolean> {
    try {
      // Demander les permissions de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de localisation refusée');
        return false;
      }

      // Vérifier si la localisation est activée
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('Services de localisation désactivés');
        return false;
      }

      this.isTracking = true;

      // Configuration pour une précision élevée
      const locationOptions: Location.LocationOptions = {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 5000, // Mise à jour toutes les 5 secondes
        distanceInterval: 5, // Mise à jour tous les 5 mètres
        mayShowUserSettingsDialog: true,
      };

      // Démarrer le suivi de position
      this.watchId = await Location.watchPositionAsync(
        locationOptions,
        async (location) => {
          // Vérifier la précision de la position
          if (location.coords.accuracy && location.coords.accuracy > 100) {
            console.log(`⚠️ Précision faible: ${location.coords.accuracy}m`);
            return;
          }

          const locationUpdate: LocationUpdate = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
            timestamp: Date.now(),
          };

          this.lastKnownLocation = locationUpdate;

          console.log(`📍 Position mise à jour: ${locationUpdate.latitude.toFixed(6)}, ${locationUpdate.longitude.toFixed(6)} (précision: ${locationUpdate.accuracy}m)`);

          // Mettre à jour la position dans la base de données
          await this.updateDriverLocation(driverId, locationUpdate);
        }
      );

      console.log('✅ Suivi de position démarré pour le livreur');
      return true;

    } catch (error) {
      console.error('❌ Erreur lors du démarrage du suivi de position:', error);
      this.isTracking = false;
      return false;
    }
  }

  /**
   * Arrêter le suivi de position
   */
  stopLocationTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.isTracking = false;
    console.log('📍 Suivi de position arrêté');
  }

  /**
   * Mettre à jour la position du livreur dans la base de données
   */
  private async updateDriverLocation(driverId: string, location: LocationUpdate): Promise<void> {
    try {
      await driverService.updateDriverLocation(driverId, location.latitude, location.longitude);
      console.log(`📍 Position mise à jour: ${location.latitude}, ${location.longitude}`);
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la position:', error);
    }
  }

  /**
   * Obtenir la position actuelle
   */
  async getCurrentLocation(): Promise<LocationUpdate | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de la position:', error);
      return null;
    }
  }

  /**
   * Obtenir la dernière position connue
   */
  getLastKnownLocation(): LocationUpdate | null {
    return this.lastKnownLocation;
  }

  /**
   * Vérifier si le suivi est actif
   */
  isLocationTrackingActive(): boolean {
    return this.isTracking;
  }

}

// Instance singleton
export const locationService = new LocationService();
