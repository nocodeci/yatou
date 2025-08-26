// Configuration des optimisations Google Maps
export const OPTIMIZATION_CONFIG = {
  // Cache
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 heures
  MAX_CACHED_GEOCODES: 100,
  MAX_CACHED_ROUTES: 50,
  
  // Debounce
  SEARCH_DEBOUNCE_DELAY: 500, // 500ms
  
  // Précision des coordonnées (pour le cache)
  COORDINATE_PRECISION: 3, // 3 décimales
  
  // Coûts estimés (en USD)
  COSTS: {
    GEOCODING_PER_REQUEST: 0.005,
    DIRECTIONS_PER_REQUEST: 0.005,
    PLACES_PER_REQUEST: 0.017,
  },
  
  // Quotas recommandés
  QUOTAS: {
    DAILY_GEOCODING: 1000,
    DAILY_DIRECTIONS: 1000,
    DAILY_PLACES: 100,
  },
  
  // Optimisations
  OPTIMIZATIONS: {
    USE_CACHE: true,
    USE_DEBOUNCE: true,
    ROUND_COORDINATES: true,
    CLEAN_EXPIRED_CACHE: true,
    SHOW_STATS: true,
  }
};

// Fonctions utilitaires pour les optimisations
export const OptimizationUtils = {
  // Arrondir les coordonnées pour optimiser le cache
  roundCoordinates: (lat: number, lng: number, precision: number = OPTIMIZATION_CONFIG.COORDINATE_PRECISION): [number, number] => {
    const factor = Math.pow(10, precision);
    return [
      Math.round(lng * factor) / factor,
      Math.round(lat * factor) / factor
    ];
  },
  
  // Calculer les économies estimées
  calculateSavings: (cachedRequests: number): number => {
    return cachedRequests * OPTIMIZATION_CONFIG.COSTS.GEOCODING_PER_REQUEST;
  },
  
  // Vérifier si on approche des quotas
  checkQuotaWarning: (currentUsage: number, quota: number): boolean => {
    return currentUsage > quota * 0.8; // 80% du quota
  },
  
  // Générer une clé de cache optimisée
  generateCacheKey: (origin: [number, number], destination: [number, number]): string => {
    const [originLat, originLng] = OptimizationUtils.roundCoordinates(origin[1], origin[0]);
    const [destLat, destLng] = OptimizationUtils.roundCoordinates(destination[1], destination[0]);
    return `${originLat},${originLng}|${destLat},${destLng}`;
  }
};

export default OPTIMIZATION_CONFIG;
