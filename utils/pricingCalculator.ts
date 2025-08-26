// Système de calcul de prix YATOU
export interface PricingFactors {
  distance: number;           // Distance en km
  serviceType: ServiceType;   // Type de service
  vehicleType: VehicleType;   // Type de véhicule
  time: Date;                 // Heure de la commande
  nearestDriverDistance: number; // Distance du livreur le plus proche
  weatherCondition: WeatherCondition; // Conditions météo
  isMovingService?: boolean;  // Service de déménagement
  floorNumber?: number;       // Numéro d'étage (déménagement)
  roomCount?: number;         // Nombre de pièces (déménagement)
  packageWeight?: number;     // Poids du colis (kg)
  merchandiseValue?: number;  // Valeur de la marchandise (courses)
}

export type ServiceType = 
  | 'delivery'        // Livraison de colis
  | 'errand'          // Course
  | 'moving'          // Déménagement
  | 'subscription';   // Abonnement

export type VehicleType = 
  | 'moto'           // Moto
  | 'tricycle'       // Tricycle
  | 'cargo'          // Cargo
  | 'van'            // Fourgonnette/Camion
  | 'truck';         // Camion

export type WeatherCondition = 
  | 'good'           // Bonnes conditions
  | 'bad';           // Mauvaises conditions

export interface PricingResult {
  basePrice: number;
  distancePrice: number;
  timeAdjustment: number;
  driverDistanceAdjustment: number;
  weatherAdjustment: number;
  movingAdjustments: number;
  totalPrice: number;
  breakdown: string[];
  estimatedTime: string;
}

export class YatouPricingCalculator {
  
  // Prix de base par type de service et véhicule
  private static readonly BASE_PRICES = {
    delivery: {
      moto: { base: 300, perKm: 150, maxWeight: 4 }
    },
    errand: {
      moto: { base: 500, perKm: 200 },
      tricycle: { base: 1500, perKm: 700 },
      cargo: { base: 2500, perKm: 1000 }
    },
    moving: {
      tricycle: { base: 2000, perKm: 900 },
      van: { base: 5000, perKm: 1900 }
    }
  };

  // Ajustements tarifaires
  private static readonly ADJUSTMENTS = {
    time: {
      after20h: { moto: 50, tricycle: 100, cargo: 500, van: 500 }
    },
    driverDistance: {
      after2km: { moto: 50, tricycle: 100, cargo: 500, van: 500 }
    },
    weather: {
      bad: { moto: 50, tricycle: 100, cargo: 500, van: 500 }
    },
    moving: {
      perFloor: 1000,
      perRoom: 500
    }
  };

  // Abonnements
  private static readonly SUBSCRIPTIONS = {
    personal: {
      express: { price: 2500, discount: 0.20, deliveries: 10, maxWeight: 2 },
      flex: { price: 5000, discount: 0.25, deliveries: 15 },
      premium: { price: 10000, discount: 0.30, deliveries: -1, movingDiscount: 0.50 }
    },
    business: {
      pro: { price: 10000, discount: 0.30, deliveries: 30, maxWeight: 2 },
      proPlus: { price: 20000, discount: 0.50, deliveries: 50 },
      unlimited: { price: 50000, discount: 0.90, deliveries: -1 }
    }
  };

  /**
   * Calcule le prix total d'un service YATOU
   */
  static calculatePrice(factors: PricingFactors): PricingResult {
    const breakdown: string[] = [];
    
    // 1. Prix de base
    const basePrice = this.getBasePrice(factors);
    breakdown.push(`Prix de base: ${basePrice.toLocaleString()} FCFA`);
    
    // 2. Prix selon la distance
    const distancePrice = this.calculateDistancePrice(factors);
    if (distancePrice > 0) {
      breakdown.push(`Supplément distance: ${distancePrice.toLocaleString()} FCFA`);
    }
    
    // 3. Ajustement horaire (après 20h)
    const timeAdjustment = this.calculateTimeAdjustment(factors);
    if (timeAdjustment > 0) {
      breakdown.push(`Supplément horaire (après 20h): ${timeAdjustment.toLocaleString()} FCFA`);
    }
    
    // 4. Ajustement distance livreur
    const driverDistanceAdjustment = this.calculateDriverDistanceAdjustment(factors);
    if (driverDistanceAdjustment > 0) {
      breakdown.push(`Supplément distance livreur: ${driverDistanceAdjustment.toLocaleString()} FCFA`);
    }
    
    // 5. Ajustement météo
    const weatherAdjustment = this.calculateWeatherAdjustment(factors);
    if (weatherAdjustment > 0) {
      breakdown.push(`Supplément conditions météo: ${weatherAdjustment.toLocaleString()} FCFA`);
    }
    
    // 6. Ajustements déménagement
    const movingAdjustments = this.calculateMovingAdjustments(factors);
    if (movingAdjustments > 0) {
      breakdown.push(`Suppléments déménagement: ${movingAdjustments.toLocaleString()} FCFA`);
    }
    
    // 7. Calcul du prix total
    const totalPrice = basePrice + distancePrice + timeAdjustment + 
                      driverDistanceAdjustment + weatherAdjustment + movingAdjustments;
    
    // 8. Temps estimé
    const estimatedTime = this.calculateEstimatedTime(factors);
    
    return {
      basePrice,
      distancePrice,
      timeAdjustment,
      driverDistanceAdjustment,
      weatherAdjustment,
      movingAdjustments,
      totalPrice,
      breakdown,
      estimatedTime
    };
  }

  /**
   * Obtient le prix de base selon le type de service et véhicule
   */
  private static getBasePrice(factors: PricingFactors): number {
    const service = factors.serviceType;
    const vehicle = factors.vehicleType;
    
    if (service === 'delivery' && vehicle === 'moto') {
      return this.BASE_PRICES.delivery.moto.base;
    }
    
    if (service === 'errand') {
      switch (vehicle) {
        case 'moto': return this.BASE_PRICES.errand.moto.base;
        case 'tricycle': return this.BASE_PRICES.errand.tricycle.base;
        case 'cargo': return this.BASE_PRICES.errand.cargo.base;
        default: return this.BASE_PRICES.errand.moto.base;
      }
    }
    
    if (service === 'moving') {
      switch (vehicle) {
        case 'tricycle': return this.BASE_PRICES.moving.tricycle.base;
        case 'van': return this.BASE_PRICES.moving.van.base;
        default: return this.BASE_PRICES.moving.tricycle.base;
      }
    }
    
    return 0;
  }

  /**
   * Calcule le prix selon la distance
   */
  private static calculateDistancePrice(factors: PricingFactors): number {
    const { distance, serviceType, vehicleType } = factors;
    
    if (distance <= 2) return 0; // Prix de base couvre 0-2km
    
    const extraDistance = distance - 2;
    let pricePerKm = 0;
    
    if (serviceType === 'delivery' && vehicleType === 'moto') {
      pricePerKm = this.BASE_PRICES.delivery.moto.perKm;
    } else if (serviceType === 'errand') {
      switch (vehicleType) {
        case 'moto': pricePerKm = this.BASE_PRICES.errand.moto.perKm; break;
        case 'tricycle': pricePerKm = this.BASE_PRICES.errand.tricycle.perKm; break;
        case 'cargo': pricePerKm = this.BASE_PRICES.errand.cargo.perKm; break;
        default: pricePerKm = this.BASE_PRICES.errand.moto.perKm;
      }
    } else if (serviceType === 'moving') {
      switch (vehicleType) {
        case 'tricycle': pricePerKm = this.BASE_PRICES.moving.tricycle.perKm; break;
        case 'van': pricePerKm = this.BASE_PRICES.moving.van.perKm; break;
        default: pricePerKm = this.BASE_PRICES.moving.tricycle.perKm;
      }
    }
    
    return extraDistance * pricePerKm;
  }

  /**
   * Calcule l'ajustement horaire (après 20h)
   */
  private static calculateTimeAdjustment(factors: PricingFactors): number {
    const { time, vehicleType, distance } = factors;
    const hour = time.getHours();
    
    if (hour < 20 || distance <= 2) return 0;
    
    const extraDistance = Math.max(0, distance - 2);
    const adjustment = this.ADJUSTMENTS.time.after20h[vehicleType] || 
                      this.ADJUSTMENTS.time.after20h.moto;
    
    return extraDistance * adjustment;
  }

  /**
   * Calcule l'ajustement selon la distance du livreur
   */
  private static calculateDriverDistanceAdjustment(factors: PricingFactors): number {
    const { nearestDriverDistance, vehicleType, distance } = factors;
    
    if (nearestDriverDistance <= 2 || distance <= 2) return 0;
    
    const extraDistance = Math.max(0, distance - 2);
    const adjustment = this.ADJUSTMENTS.driverDistance.after2km[vehicleType] || 
                      this.ADJUSTMENTS.driverDistance.after2km.moto;
    
    return extraDistance * adjustment;
  }

  /**
   * Calcule l'ajustement météo
   */
  private static calculateWeatherAdjustment(factors: PricingFactors): number {
    const { weatherCondition, vehicleType, distance } = factors;
    
    if (weatherCondition === 'good' || distance <= 2) return 0;
    
    const extraDistance = Math.max(0, distance - 2);
    const adjustment = this.ADJUSTMENTS.weather.bad[vehicleType] || 
                      this.ADJUSTMENTS.weather.bad.moto;
    
    return extraDistance * adjustment;
  }

  /**
   * Calcule les ajustements pour les services de déménagement
   */
  private static calculateMovingAdjustments(factors: PricingFactors): number {
    if (factors.serviceType !== 'moving') return 0;
    
    let total = 0;
    
    // Supplément par étage
    if (factors.floorNumber && factors.floorNumber > 0) {
      const floorCost = factors.floorNumber * this.ADJUSTMENTS.moving.perFloor;
      total += floorCost;
    }
    
    // Supplément par pièce (si plus de 2 pièces)
    if (factors.roomCount && factors.roomCount > 2) {
      const extraRooms = factors.roomCount - 2;
      const roomCost = extraRooms * this.ADJUSTMENTS.moving.perRoom;
      total += roomCost;
    }
    
    return total;
  }

  /**
   * Calcule le temps estimé de livraison
   */
  private static calculateEstimatedTime(factors: PricingFactors): string {
    const { distance, serviceType, vehicleType } = factors;
    
    let baseTimeMinutes = 0;
    
    // Temps de base selon le type de service
    if (serviceType === 'delivery') {
      baseTimeMinutes = 15; // 15 minutes de base
    } else if (serviceType === 'errand') {
      baseTimeMinutes = 25; // 25 minutes de base
    } else if (serviceType === 'moving') {
      baseTimeMinutes = 45; // 45 minutes de base
    }
    
    // Ajout de temps selon la distance
    const distanceTime = Math.ceil(distance * 3); // 3 minutes par km
    
    // Ajout de temps selon le véhicule
    let vehicleTime = 0;
    switch (vehicleType) {
      case 'moto': vehicleTime = 0; break;
      case 'tricycle': vehicleTime = 5; break;
      case 'cargo': vehicleTime = 10; break;
      case 'van': vehicleTime = 15; break;
      default: vehicleTime = 0;
    }
    
    const totalMinutes = baseTimeMinutes + distanceTime + vehicleTime;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h${minutes > 0 ? minutes : ''}`;
    }
  }

  /**
   * Calcule le prix avec abonnement
   */
  static calculatePriceWithSubscription(
    basePrice: number, 
    subscriptionType: string, 
    subscriptionLevel: string
  ): { finalPrice: number; discount: number; discountAmount: number } {
    const subscription = this.SUBSCRIPTIONS[subscriptionType]?.[subscriptionLevel];
    
    if (!subscription) {
      return { finalPrice: basePrice, discount: 0, discountAmount: 0 };
    }
    
    const discountAmount = basePrice * subscription.discount;
    const finalPrice = basePrice - discountAmount;
    
    return {
      finalPrice: Math.round(finalPrice),
      discount: subscription.discount,
      discountAmount: Math.round(discountAmount)
    };
  }

  /**
   * Obtient les informations d'abonnement
   */
  static getSubscriptionInfo(type: 'personal' | 'business', level: string) {
    return this.SUBSCRIPTIONS[type]?.[level];
  }

  /**
   * Vérifie si un service est éligible à un abonnement
   */
  static isEligibleForSubscription(
    serviceType: ServiceType, 
    subscriptionType: string, 
    subscriptionLevel: string
  ): boolean {
    const subscription = this.SUBSCRIPTIONS[subscriptionType]?.[subscriptionLevel];
    
    if (!subscription) return false;
    
    // Vérifications spécifiques
    if (subscription.maxWeight && serviceType === 'delivery') {
      // Pour les livraisons, vérifier le poids maximum
      return true; // À adapter selon le poids réel
    }
    
    return true;
  }
}
