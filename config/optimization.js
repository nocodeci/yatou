// Configuration des optimisations du projet
module.exports = {
  // Cache
  cache: {
    enabled: true,
    ttl: 24 * 60 * 60, // 24 heures
    maxKeys: 1000,
    redis: {
      enabled: process.env.USE_REDIS === 'true',
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  },
  
  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  // Images
  images: {
    optimization: {
      enabled: true,
      quality: 85,
      formats: ['png', 'jpg', 'jpeg', 'webp']
    }
  },
  
  // Carte
  map: {
    clustering: {
      enabled: true,
      radius: 50, // mètres
      minZoom: 10,
      maxZoom: 20
    },
    polyline: {
      simplify: true,
      tolerance: 0.0001
    }
  },
  
  // Performance
  performance: {
    debounce: {
      search: 300,
      map: 100
    },
    memoization: {
      enabled: true
    }
  }
};
