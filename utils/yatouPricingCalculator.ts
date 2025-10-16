/**
 * 🚚 Calculateur de Prix YATOU
 * 
 * Implémentation exacte de la grille tarifaire YATOU selon le brief technique
 * - MOTO : 400 FCFA minimum + 100 FCFA/km
 * - FOURGON : 3000 FCFA minimum + 600 FCFA/km  
 * - GRAND CAMION : 5000 FCFA minimum + 1500 FCFA/km (0-50km) + 1000 FCFA/km (>50km)
 */

export type VehicleType = 'moto' | 'fourgon' | 'camion';
export type ServiceType = 'livraison' | 'transport' | 'demenagement';

export interface PricingOptions {
  // Services additionnels
  loading?: boolean; // Aide au chargement/déchargement
  moving?: boolean; // Aide au déménagement (camion, 2 personnes)
  packaging?: boolean; // Matériel d'emballage (camion)
  waiting?: number; // Attente sur place (multiples de 15min)
  urgent?: boolean; // Livraison urgente (moto)
  rushHour?: boolean; // Créneaux heures de pointe (17h-20h)
  weekend?: boolean; // Weekend et jours fériés
}

export interface PricingResult {
  basePrice: number;
  distancePrice: number;
  supplements: number;
  totalPrice: number;
  breakdown: {
    base: number;
    distance: number;
    supplements: Array<{
      name: string;
      price: number;
    }>;
  };
  vehicle: VehicleType;
  distance: number;
  estimatedTime: number; // en minutes
}

export interface VehicleInfo {
  type: VehicleType;
  name: string;
  capacity: string;
  description: string;
  icon: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKmOver50?: number; // Pour le camion
  maxDistance?: number;
  estimatedTime: number; // Temps d'attente moyen en minutes
}

export const VEHICLE_TYPES: Record<VehicleType, VehicleInfo> = {
  moto: {
    type: 'moto',
    name: 'Moto',
    capacity: '0-5kg',
    description: 'Documents, petits colis, courses urgentes',
    icon: '🏍️',
    basePrice: 400,
    pricePerKm: 100,
    estimatedTime: 5
  },
  fourgon: {
    type: 'fourgon',
    name: 'Fourgon',
    capacity: '6kg-1 tonne',
    description: 'Colis moyens, matériel, mobilier léger',
    icon: '🚐',
    basePrice: 3000,
    pricePerKm: 600,
    estimatedTime: 15
  },
  camion: {
    type: 'camion',
    name: 'Grand Camion',
    capacity: '1-5 tonnes',
    description: 'Déménagement complet, gros volumes, marchandises lourdes',
    icon: '🚛',
    basePrice: 5000,
    pricePerKm: 1500,
    pricePerKmOver50: 1000,
    estimatedTime: 30
  }
};

/**
 * Calcule le prix d'une course YATOU selon les spécifications exactes du brief
 */
export function calculateYatouPrice(
  distance: number, // en km
  vehicleType: VehicleType,
  options: PricingOptions = {}
): PricingResult {
  const vehicle = VEHICLE_TYPES[vehicleType];
  const supplements: Array<{ name: string; price: number }> = [];
  let supplementsTotal = 0;

  // Prix de base
  const basePrice = vehicle.basePrice;

  // Prix selon la distance
  let distancePrice = 0;
  if (vehicleType === 'camion') {
    // Grand Camion : 1500 FCFA/km (0-50km) + 1000 FCFA/km (>50km)
    if (distance <= 50) {
      distancePrice = distance * vehicle.pricePerKm;
    } else {
      distancePrice = (50 * vehicle.pricePerKm) + ((distance - 50) * (vehicle.pricePerKmOver50 || 1000));
    }
  } else {
    // Moto et Fourgon : prix fixe par km
    distancePrice = distance * vehicle.pricePerKm;
  }

  // Suppléments tarifaires
  if (options.loading) {
    const loadingPrice = vehicleType === 'camion' ? 5000 : 1500;
    supplements.push({
      name: 'Aide au chargement/déchargement',
      price: loadingPrice
    });
    supplementsTotal += loadingPrice;
  }

  if (options.moving && vehicleType === 'camion') {
    supplements.push({
      name: 'Aide au déménagement (2 personnes)',
      price: 5000
    });
    supplementsTotal += 5000;
  }

  if (options.packaging && vehicleType === 'camion') {
    supplements.push({
      name: 'Matériel d\'emballage',
      price: 3000
    });
    supplementsTotal += 3000;
  }

  if (options.waiting && options.waiting > 0) {
    const waitingPrice = Math.ceil(options.waiting / 15) * 500; // 500 FCFA par tranche de 15min
    supplements.push({
      name: `Attente sur place (${options.waiting}min)`,
      price: waitingPrice
    });
    supplementsTotal += waitingPrice;
  }

  if (options.urgent && vehicleType === 'moto') {
    supplements.push({
      name: 'Livraison urgente',
      price: 200
    });
    supplementsTotal += 200;
  }

  // Calcul du prix total avant ajustements horaires
  let totalPrice = basePrice + distancePrice + supplementsTotal;

  // Ajustements horaires
  if (options.rushHour) {
    const rushHourIncrease = totalPrice * 0.2; // +20%
    supplements.push({
      name: 'Heures de pointe (17h-20h)',
      price: rushHourIncrease
    });
    totalPrice += rushHourIncrease;
  }

  if (options.weekend) {
    const weekendIncrease = totalPrice * 0.3; // +30%
    supplements.push({
      name: 'Weekend/Jours fériés',
      price: weekendIncrease
    });
    totalPrice += weekendIncrease;
  }

  // Arrondir au multiple de 50 FCFA le plus proche
  totalPrice = Math.ceil(totalPrice / 50) * 50;

  // Estimation du temps (basé sur la distance et le type de véhicule)
  const estimatedTime = Math.max(
    vehicle.estimatedTime,
    Math.round(distance * 2) // 2 minutes par km en moyenne
  );

  return {
    basePrice,
    distancePrice,
    supplements: supplementsTotal,
    totalPrice,
    breakdown: {
      base: basePrice,
      distance: distancePrice,
      supplements
    },
    vehicle: vehicleType,
    distance,
    estimatedTime
  };
}

/**
 * Calcule le prix pour plusieurs véhicules et retourne les options
 */
export function calculateAllVehiclePrices(
  distance: number,
  options: PricingOptions = {}
): Array<PricingResult & { vehicleInfo: VehicleInfo }> {
  return Object.values(VEHICLE_TYPES).map(vehicleInfo => ({
    ...calculateYatouPrice(distance, vehicleInfo.type, options),
    vehicleInfo
  }));
}

/**
 * Valide si un véhicule peut transporter un certain poids
 */
export function canVehicleCarry(vehicleType: VehicleType, weight: number): boolean {
  switch (vehicleType) {
    case 'moto':
      return weight <= 5; // 0-5kg
    case 'fourgon':
      return weight <= 1000; // 6kg-1 tonne
    case 'camion':
      return weight <= 5000; // 1-5 tonnes
    default:
      return false;
  }
}

/**
 * Recommande le meilleur véhicule selon le poids et la distance
 */
export function recommendVehicle(weight: number, distance: number): VehicleType {
  if (weight <= 5) {
    return 'moto'; // Toujours moto pour les petits colis
  } else if (weight <= 1000) {
    return 'fourgon'; // Fourgon pour les charges moyennes
  } else {
    return 'camion'; // Camion pour les gros volumes
  }
}

/**
 * Formate le prix en FCFA avec séparateurs
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Exemples d'utilisation selon le brief
 */
export const PRICING_EXAMPLES = {
  moto: {
    example1: calculateYatouPrice(8, 'moto'), // 400 + (8×100) = 1,200 FCFA
    description: 'Course de 8km = 400 + (8×100) = 1,200 FCFA'
  },
  fourgon: {
    example1: calculateYatouPrice(5, 'fourgon'), // 3,000 FCFA (minimum)
    example2: calculateYatouPrice(12, 'fourgon'), // 3,000 + (12×600) = 10,200 FCFA
    description: 'Course de 5km = 3,000 FCFA (minimum) | Course de 12km = 3,000 + (12×600) = 10,200 FCFA'
  },
  camion: {
    example1: calculateYatouPrice(30, 'camion'), // 5,000 + (30×1,500) = 50,000 FCFA
    example2: calculateYatouPrice(80, 'camion'), // 5,000 + (50×1,500) + (30×1,000) = 110,000 FCFA
    description: 'Course de 30km = 5,000 + (30×1,500) = 50,000 FCFA | Course de 80km = 5,000 + (50×1,500) + (30×1,000) = 110,000 FCFA'
  }
};
