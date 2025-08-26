export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  packageDetails: string;
  packageWeight: number;
  estimatedPrice: number;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedPickupTime?: Date;
  estimatedDeliveryTime?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  driverNotes?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: 'moto' | 'tricycle' | 'cargo' | 'van';
  vehiclePlate: string;
  currentLocation: Location;
  isOnline: boolean;
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  earnings: number;
}

export interface RouteInfo {
  distance: number; // en km
  duration: number; // en minutes
  polyline: string; // coordonnées encodées
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
}

export interface NavigationState {
  currentOrder: DeliveryOrder | null;
  currentRoute: RouteInfo | null;
  isNavigating: boolean;
  currentStep: number;
  destination: 'pickup' | 'delivery';
}
