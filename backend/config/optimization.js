// Configuration des optimisations backend Google Maps
const BACKEND_OPTIMIZATION_CONFIG = {
  // Cache
  CACHE: {
    MEMORY: {
      TTL: 24 * 60 * 60, // 24 heures en secondes
      CHECK_PERIOD: 60 * 60, // Vérifier les expirations toutes les heures
      MAX_KEYS: 1000, // Maximum 1000 clés en mémoire
    },
    REDIS: {
      TTL: 24 * 60 * 60, // 24 heures
      HOST: process.env.REDIS_HOST || 'localhost',
      PORT: process.env.REDIS_PORT || 6379,
      ENABLED: process.env.USE_REDIS === 'true',
    }
  },

  // Rate Limiting
  RATE_LIMITS: {
    GOOGLE_MAPS: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // 100 requêtes par 15 minutes
    },
    DIRECTIONS: {
      windowMs: 60 * 1000, // 1 minute
      max: 10, // 10 requêtes de directions par minute
    },
    AUTOCOMPLETE: {
      windowMs: 60 * 1000, // 1 minute
      max: 20, // 20 requêtes d'autocomplétion par minute
    }
  },

  // Quotas
  QUOTAS: {
    DAILY_LIMIT: 1000,
    MONTHLY_LIMIT: 10000,
  },

  // Précision des coordonnées (pour le cache)
  COORDINATE_PRECISION: 3, // 3 décimales

  // Coûts estimés (en USD)
  COSTS: {
    GEOCODING_PER_REQUEST: 0.005,
    DIRECTIONS_PER_REQUEST: 0.005,
    PLACES_PER_REQUEST: 0.017,
  },

  // Timeouts
  TIMEOUTS: {
    GOOGLE_MAPS_REQUEST: 10000, // 10 secondes
    CACHE_OPERATION: 5000, // 5 secondes
  },

  // Logging
  LOGGING: {
    ENABLE_REQUEST_LOGGING: true,
    ENABLE_CACHE_LOGGING: true,
    ENABLE_RATE_LIMIT_LOGGING: true,
  }
};

// Fonctions utilitaires pour les optimisations backend
const BackendOptimizationUtils = {
  // Arrondir les coordonnées pour optimiser le cache
  roundCoordinates: (lat, lng, precision = BACKEND_OPTIMIZATION_CONFIG.COORDINATE_PRECISION) => {
    const factor = Math.pow(10, precision);
    return {
      lat: Math.round(lat * factor) / factor,
      lng: Math.round(lng * factor) / factor
    };
  },

  // Calculer les économies estimées
  calculateSavings: (cachedRequests) => {
    return cachedRequests * BACKEND_OPTIMIZATION_CONFIG.COSTS.DIRECTIONS_PER_REQUEST;
  },

  // Vérifier si on approche des quotas
  checkQuotaWarning: (currentUsage, quota) => {
    return currentUsage > quota * 0.8; // 80% du quota
  },

  // Générer une clé de cache optimisée
  generateCacheKey: (type, params) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `${type}:${sortedParams}`;
  },

  // Valider les coordonnées
  validateCoordinates: (lat, lng) => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  },

  // Formater les coordonnées pour l'API
  formatCoordinates: (lat, lng) => {
    return `${lat},${lng}`;
  }
};

module.exports = {
  BACKEND_OPTIMIZATION_CONFIG,
  BackendOptimizationUtils
};
