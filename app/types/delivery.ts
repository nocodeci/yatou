export interface DeliveryAddress {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    instructions?: string;
  }
  
  export interface Package {
    id: string;
    description: string;
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    value: number;
    fragile: boolean;
  }
  
  export interface Delivery {
    id: string;
    status: 'pending' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
    pickupAddress: DeliveryAddress;
    deliveryAddress: DeliveryAddress;
    package: Package;
    scheduledDate: string;
    estimatedDelivery?: string;
    price: number;
    createdAt: string;
    trackingNumber: string;
  }
  
  export type DeliveryStatus = Delivery['status'];