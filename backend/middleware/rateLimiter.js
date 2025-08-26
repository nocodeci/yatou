const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

// Cache pour stocker les compteurs de requêtes
const requestCache = new NodeCache({ stdTTL: 60 }); // 1 minute

// Configuration des limites
const RATE_LIMITS = {
  // Limite générale pour les API Google Maps
  GOOGLE_MAPS: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par 15 minutes
    message: 'Trop de requêtes Google Maps. Réessayez dans 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Limite spécifique pour les directions
  DIRECTIONS: {
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requêtes de directions par minute
    message: 'Trop de calculs d\'itinéraire. Réessayez dans 1 minute.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Limite pour l'autocomplétion
  AUTOCOMPLETE: {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requêtes d'autocomplétion par minute
    message: 'Trop de recherches. Réessayez dans 1 minute.',
    standardHeaders: true,
    legacyHeaders: false,
  }
};

// Limiteur général pour les API Google Maps
const googleMapsLimiter = rateLimit({
  ...RATE_LIMITS.GOOGLE_MAPS,
  keyGenerator: (req) => {
    // Utiliser l'IP + un identifiant utilisateur si disponible
    const userId = req.headers['x-user-id'] || 'anonymous';
    return `${req.ip}-${userId}`;
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit dépassé pour ${req.ip}`);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: RATE_LIMITS.GOOGLE_MAPS.message,
      retryAfter: Math.ceil(RATE_LIMITS.GOOGLE_MAPS.windowMs / 1000)
    });
  }
});

// Limiteur spécifique pour les directions
const directionsLimiter = rateLimit({
  ...RATE_LIMITS.DIRECTIONS,
  keyGenerator: (req) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    return `directions-${req.ip}-${userId}`;
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit directions dépassé pour ${req.ip}`);
    res.status(429).json({
      error: 'Directions rate limit exceeded',
      message: RATE_LIMITS.DIRECTIONS.message,
      retryAfter: Math.ceil(RATE_LIMITS.DIRECTIONS.windowMs / 1000)
    });
  }
});

// Limiteur pour l'autocomplétion
const autocompleteLimiter = rateLimit({
  ...RATE_LIMITS.AUTOCOMPLETE,
  keyGenerator: (req) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    return `autocomplete-${req.ip}-${userId}`;
  },
  handler: (req, res) => {
    console.log(`🚫 Rate limit autocomplete dépassé pour ${req.ip}`);
    res.status(429).json({
      error: 'Autocomplete rate limit exceeded',
      message: RATE_LIMITS.AUTOCOMPLETE.message,
      retryAfter: Math.ceil(RATE_LIMITS.AUTOCOMPLETE.windowMs / 1000)
    });
  }
});

// Middleware pour logger les requêtes
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { method, url, ip } = req;
    const { statusCode } = res;
    
    console.log(`${method} ${url} - ${statusCode} - ${duration}ms - ${ip}`);
    
    // Log spécifique pour les API Google Maps
    if (url.includes('/directions') || url.includes('/places')) {
      console.log(`🗺️ Google Maps API: ${method} ${url} - ${statusCode}`);
    }
  });
  
  next();
};

// Middleware pour vérifier les quotas
const quotaChecker = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'anonymous';
  const key = `quota-${userId}`;
  
  // Récupérer le quota actuel
  let quota = requestCache.get(key) || {
    daily: 0,
    monthly: 0,
    lastReset: Date.now()
  };
  
  // Réinitialiser les compteurs quotidiens/mensuels
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const monthMs = 30 * dayMs;
  
  if (now - quota.lastReset > dayMs) {
    quota.daily = 0;
    quota.lastReset = now;
  }
  
  // Vérifier les limites
  const DAILY_LIMIT = 1000;
  const MONTHLY_LIMIT = 10000;
  
  if (quota.daily >= DAILY_LIMIT) {
    return res.status(429).json({
      error: 'Daily quota exceeded',
      message: 'Quota quotidien dépassé. Réessayez demain.',
      quota: {
        daily: quota.daily,
        monthly: quota.monthly,
        limit: DAILY_LIMIT
      }
    });
  }
  
  if (quota.monthly >= MONTHLY_LIMIT) {
    return res.status(429).json({
      error: 'Monthly quota exceeded',
      message: 'Quota mensuel dépassé.',
      quota: {
        daily: quota.daily,
        monthly: quota.monthly,
        limit: MONTHLY_LIMIT
      }
    });
  }
  
  // Incrémenter les compteurs
  quota.daily++;
  quota.monthly++;
  requestCache.set(key, quota);
  
  // Ajouter les informations de quota à la réponse
  res.setHeader('X-RateLimit-Daily', `${quota.daily}/${DAILY_LIMIT}`);
  res.setHeader('X-RateLimit-Monthly', `${quota.monthly}/${MONTHLY_LIMIT}`);
  
  next();
};

module.exports = {
  googleMapsLimiter,
  directionsLimiter,
  autocompleteLimiter,
  requestLogger,
  quotaChecker
};
