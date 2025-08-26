const NodeCache = require('node-cache');
const redis = require('redis');

// Configuration du cache
const CACHE_CONFIG = {
  // Cache en mémoire (NodeCache)
  MEMORY_CACHE: {
    TTL: 24 * 60 * 60, // 24 heures en secondes
    CHECK_PERIOD: 60 * 60, // Vérifier les expirations toutes les heures
    MAX_KEYS: 1000, // Maximum 1000 clés en mémoire
  },
  // Cache Redis (optionnel, pour la persistance)
  REDIS_CACHE: {
    TTL: 24 * 60 * 60, // 24 heures
    HOST: process.env.REDIS_HOST || 'localhost',
    PORT: process.env.REDIS_PORT || 6379,
  }
};

// Cache en mémoire pour les requêtes fréquentes
const memoryCache = new NodeCache({
  stdTTL: CACHE_CONFIG.MEMORY_CACHE.TTL,
  checkperiod: CACHE_CONFIG.MEMORY_CACHE.CHECK_PERIOD,
  maxKeys: CACHE_CONFIG.MEMORY_CACHE.MAX_KEYS,
});

// Client Redis (optionnel)
let redisClient = null;

// Initialiser Redis si configuré
const initRedis = async () => {
  try {
    if (process.env.USE_REDIS === 'true') {
      redisClient = redis.createClient({
        socket: {
          host: CACHE_CONFIG.REDIS_CACHE.HOST,
          port: CACHE_CONFIG.REDIS_CACHE.PORT,
        }
      });
      
      await redisClient.connect();
      console.log('✅ Redis connecté pour le cache');
    }
  } catch (error) {
    console.log('⚠️ Redis non disponible, utilisation du cache mémoire uniquement');
  }
};

// Générer une clé de cache optimisée
const generateCacheKey = (type, params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${type}:${sortedParams}`;
};

// Arrondir les coordonnées pour optimiser le cache
const roundCoordinates = (lat, lng, precision = 3) => {
  const factor = Math.pow(10, precision);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor
  };
};

class BackendCacheManager {
  // Initialiser le cache
  static async init() {
    await initRedis();
    
    // Événements du cache mémoire
    memoryCache.on('expired', (key, value) => {
      console.log(`🗑️ Cache expiré: ${key}`);
    });
    
    memoryCache.on('flush', () => {
      console.log('🧹 Cache mémoire vidé');
    });
    
    console.log('✅ Gestionnaire de cache backend initialisé');
  }

  // Obtenir une valeur du cache
  static async get(key) {
    try {
      // Essayer d'abord le cache mémoire (plus rapide)
      const memoryValue = memoryCache.get(key);
      if (memoryValue) {
        console.log(`📦 Cache mémoire hit: ${key}`);
        return memoryValue;
      }

      // Essayer Redis si disponible
      if (redisClient) {
        const redisValue = await redisClient.get(key);
        if (redisValue) {
          const parsedValue = JSON.parse(redisValue);
          // Mettre en cache mémoire pour les prochaines requêtes
          memoryCache.set(key, parsedValue);
          console.log(`📦 Cache Redis hit: ${key}`);
          return parsedValue;
        }
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du cache:', error);
      return null;
    }
  }

  // Sauvegarder une valeur en cache
  static async set(key, value, ttl = CACHE_CONFIG.MEMORY_CACHE.TTL) {
    try {
      // Sauvegarder en cache mémoire
      memoryCache.set(key, value, ttl);
      
      // Sauvegarder en Redis si disponible
      if (redisClient) {
        await redisClient.setEx(key, ttl, JSON.stringify(value));
      }
      
      console.log(`💾 Cache sauvegardé: ${key}`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cache:', error);
    }
  }

  // Cache pour les directions
  static async getCachedDirections(origin, destination) {
    const roundedOrigin = roundCoordinates(origin.lat, origin.lng);
    const roundedDest = roundCoordinates(destination.lat, destination.lng);
    
    const cacheKey = generateCacheKey('directions', {
      origin: `${roundedOrigin.lat},${roundedOrigin.lng}`,
      destination: `${roundedDest.lat},${roundedDest.lng}`,
      mode: 'driving'
    });
    
    return await this.get(cacheKey);
  }

  static async setCachedDirections(origin, destination, data) {
    const roundedOrigin = roundCoordinates(origin.lat, origin.lng);
    const roundedDest = roundCoordinates(destination.lat, destination.lng);
    
    const cacheKey = generateCacheKey('directions', {
      origin: `${roundedOrigin.lat},${roundedOrigin.lng}`,
      destination: `${roundedDest.lat},${roundedDest.lng}`,
      mode: 'driving'
    });
    
    await this.set(cacheKey, data);
  }

  // Cache pour l'autocomplétion
  static async getCachedAutocomplete(input) {
    const cacheKey = generateCacheKey('autocomplete', { input: input.toLowerCase() });
    return await this.get(cacheKey);
  }

  static async setCachedAutocomplete(input, data) {
    const cacheKey = generateCacheKey('autocomplete', { input: input.toLowerCase() });
    await this.set(cacheKey, data, 60 * 60); // 1 heure pour l'autocomplétion
  }

  // Cache pour les détails de lieu
  static async getCachedPlaceDetails(placeId) {
    const cacheKey = generateCacheKey('place_details', { place_id: placeId });
    return await this.get(cacheKey);
  }

  static async setCachedPlaceDetails(placeId, data) {
    const cacheKey = generateCacheKey('place_details', { place_id: placeId });
    await this.set(cacheKey, data, 24 * 60 * 60); // 24 heures pour les détails
  }

  // Statistiques du cache
  static getStats() {
    const memoryStats = memoryCache.getStats();
    return {
      memory: {
        keys: memoryStats.keys,
        hits: memoryStats.hits,
        misses: memoryStats.misses,
        hitRate: memoryStats.hits / (memoryStats.hits + memoryStats.misses) * 100
      },
      redis: redisClient ? 'connected' : 'disabled'
    };
  }

  // Nettoyer le cache
  static async flush() {
    try {
      memoryCache.flushAll();
      if (redisClient) {
        await redisClient.flushAll();
      }
      console.log('🧹 Cache backend vidé');
    } catch (error) {
      console.error('Erreur lors du nettoyage du cache:', error);
    }
  }

  // Fermer les connexions
  static async close() {
    try {
      if (redisClient) {
        await redisClient.quit();
      }
      console.log('🔌 Connexions cache fermées');
    } catch (error) {
      console.error('Erreur lors de la fermeture du cache:', error);
    }
  }
}

module.exports = BackendCacheManager;
