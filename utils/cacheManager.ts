import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour le cache
interface CachedGeocode {
  address: string;
  coordinates: [number, number];
  timestamp: number;
}

interface CachedRoute {
  origin: string;
  destination: string;
  coordinates: any[];
  distance: string;
  duration: string;
  timestamp: number;
}

// Durée de validité du cache (24 heures)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Clés de stockage
const GEOCODE_CACHE_KEY = 'geocode_cache';
const ROUTE_CACHE_KEY = 'route_cache';

class CacheManager {
  // Cache pour les géocodages
  static async getCachedGeocode(address: string): Promise<[number, number] | null> {
    try {
      const cached = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      if (!cached) return null;

      const geocodes: CachedGeocode[] = JSON.parse(cached);
      const cachedGeocode = geocodes.find(g => g.address.toLowerCase() === address.toLowerCase());

      if (cachedGeocode && Date.now() - cachedGeocode.timestamp < CACHE_DURATION) {
        console.log('📦 Cache hit pour géocodage:', address);
        return cachedGeocode.coordinates;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache géocodage:', error);
      return null;
    }
  }

  static async setCachedGeocode(address: string, coordinates: [number, number]): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      const geocodes: CachedGeocode[] = cached ? JSON.parse(cached) : [];

      // Supprimer l'ancien cache pour cette adresse
      const filtered = geocodes.filter(g => g.address.toLowerCase() !== address.toLowerCase());

      // Ajouter le nouveau cache
      filtered.push({
        address,
        coordinates,
        timestamp: Date.now()
      });

      // Garder seulement les 100 derniers géocodages
      if (filtered.length > 100) {
        filtered.splice(0, filtered.length - 100);
      }

      await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(filtered));
      console.log('💾 Cache géocodage sauvegardé:', address);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache géocodage:', error);
    }
  }

  // Cache pour les itinéraires
  static async getCachedRoute(origin: string, destination: string): Promise<CachedRoute | null> {
    try {
      const cached = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
      if (!cached) return null;

      const routes: CachedRoute[] = JSON.parse(cached);
      const cachedRoute = routes.find(r => 
        r.origin.toLowerCase() === origin.toLowerCase() && 
        r.destination.toLowerCase() === destination.toLowerCase()
      );

      if (cachedRoute && Date.now() - cachedRoute.timestamp < CACHE_DURATION) {
        console.log('📦 Cache hit pour itinéraire:', origin, '→', destination);
        return cachedRoute;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache itinéraire:', error);
      return null;
    }
  }

  static async setCachedRoute(origin: string, destination: string, routeData: any): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
      const routes: CachedRoute[] = cached ? JSON.parse(cached) : [];

      // Supprimer l'ancien cache pour cet itinéraire
      const filtered = routes.filter(r => 
        r.origin.toLowerCase() !== origin.toLowerCase() || 
        r.destination.toLowerCase() !== destination.toLowerCase()
      );

      // Ajouter le nouveau cache
      filtered.push({
        origin,
        destination,
        coordinates: routeData.coordinates || [],
        distance: routeData.distance || '',
        duration: routeData.duration || '',
        timestamp: Date.now()
      });

      // Garder seulement les 50 derniers itinéraires
      if (filtered.length > 50) {
        filtered.splice(0, filtered.length - 50);
      }

      await AsyncStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(filtered));
      console.log('💾 Cache itinéraire sauvegardé:', origin, '→', destination);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache itinéraire:', error);
    }
  }

  // Nettoyer le cache expiré
  static async cleanExpiredCache(): Promise<void> {
    try {
      const now = Date.now();

      // Nettoyer le cache géocodage
      const geocodes = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      if (geocodes) {
        const validGeocodes = JSON.parse(geocodes).filter((g: CachedGeocode) => 
          now - g.timestamp < CACHE_DURATION
        );
        await AsyncStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(validGeocodes));
      }

      // Nettoyer le cache itinéraire
      const routes = await AsyncStorage.getItem(ROUTE_CACHE_KEY);
      if (routes) {
        const validRoutes = JSON.parse(routes).filter((r: CachedRoute) => 
          now - r.timestamp < CACHE_DURATION
        );
        await AsyncStorage.setItem(ROUTE_CACHE_KEY, JSON.stringify(validRoutes));
      }

      console.log('🧹 Cache expiré nettoyé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  // Statistiques du cache
  static async getCacheStats(): Promise<{ geocodes: number; routes: number }> {
    try {
      const geocodes = await AsyncStorage.getItem(GEOCODE_CACHE_KEY);
      const routes = await AsyncStorage.getItem(ROUTE_CACHE_KEY);

      return {
        geocodes: geocodes ? JSON.parse(geocodes).length : 0,
        routes: routes ? JSON.parse(routes).length : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats du cache:', error);
      return { geocodes: 0, routes: 0 };
    }
  }
}

export default CacheManager;
