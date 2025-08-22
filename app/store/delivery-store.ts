import { create } from 'zustand';
import { Delivery, DeliveryAddress, Package } from '@/app/types/delivery';

interface DeliveryStore {
  deliveries: Delivery[];
  loadData: () => void;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'trackingNumber'>) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  deliveries: [
    {
      id: '1',
      trackingNumber: 'YT001',
      status: 'pending',
      pickupAddress: {
        id: '1',
        name: 'Entrepôt Paris',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        phone: '+33 1 23 45 67 89',
      },
      deliveryAddress: {
        id: '2',
        name: 'Bureau Lyon',
        address: '456 Avenue des Champs',
        city: 'Lyon',
        postalCode: '69001',
        phone: '+33 4 56 78 90 12',
      },
      package: {
        id: '1',
        description: 'Colis fragile - Électronique',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        value: 150,
        fragile: true,
      },
      scheduledDate: new Date().toISOString(),
      price: 25.99,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      trackingNumber: 'YT002',
      status: 'in_transit',
      pickupAddress: {
        id: '3',
        name: 'Entrepôt Marseille',
        address: '789 Boulevard du Port',
        city: 'Marseille',
        postalCode: '13001',
        phone: '+33 4 91 23 45 67',
      },
      deliveryAddress: {
        id: '4',
        name: 'Résidence Nice',
        address: '321 Promenade des Anglais',
        city: 'Nice',
        postalCode: '06000',
        phone: '+33 4 93 45 67 89',
      },
      package: {
        id: '2',
        description: 'Documents importants',
        weight: 0.5,
        dimensions: { length: 25, width: 15, height: 5 },
        value: 50,
        fragile: false,
      },
      scheduledDate: new Date().toISOString(),
      price: 18.50,
      createdAt: new Date().toISOString(),
    },
  ],
  
  loadData: () => {
    // Simuler le chargement des données
    console.log('Loading delivery data...');
  },
  
  addDelivery: (delivery) => {
    const newDelivery: Delivery = {
      ...delivery,
      id: Date.now().toString(),
      trackingNumber: `YT${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      deliveries: [...state.deliveries, newDelivery],
    }));
  },
  
  updateDelivery: (id, updates) => {
    set((state) => ({
      deliveries: state.deliveries.map((delivery) =>
        delivery.id === id
          ? { ...delivery, ...updates }
          : delivery
      ),
    }));
  },
}));