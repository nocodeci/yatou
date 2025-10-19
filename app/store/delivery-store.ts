import { create } from 'zustand';
import { Delivery, DeliveryAddress, Package } from '@/app/types/delivery';
import { deliveryService } from '@/app/services/api';

interface DeliveryStore {
  deliveries: Delivery[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  addDelivery: (delivery: Omit<Delivery, 'id' | 'createdAt' | 'trackingNumber'>) => Promise<void>;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
}

export const useDeliveryStore = create<DeliveryStore>((set, get) => ({
  deliveries: [],
  isLoading: false,
  
  loadData: async () => {
    set({ isLoading: true });
    try {
      // Charger les livraisons depuis la base de données
      const dbDeliveries = await deliveryService.getUserDeliveries();
      
      // Convertir les données de la base vers le format du store
      const deliveries: Delivery[] = dbDeliveries.map((dbDelivery) => ({
        id: dbDelivery.id,
        trackingNumber: dbDelivery.tracking_number || `YT${dbDelivery.id.slice(-6)}`,
        status: dbDelivery.status as Delivery['status'],
        pickupAddress: {
          id: 'pickup',
          name: 'Point de départ',
          address: dbDelivery.pickup_address,
          city: 'Abidjan',
          postalCode: '00000',
          phone: '+225 00 00 00 00',
        },
        deliveryAddress: {
          id: 'delivery',
          name: 'Point d\'arrivée',
          address: dbDelivery.delivery_address,
          city: 'Abidjan',
          postalCode: '00000',
          phone: '+225 00 00 00 00',
        },
        package: {
          id: 'package',
          description: dbDelivery.description || 'Livraison YATOU',
          weight: dbDelivery.weight || 1,
          dimensions: { length: 30, width: 20, height: 15 },
          value: dbDelivery.estimated_price || 0,
          fragile: false,
        },
        scheduledDate: dbDelivery.scheduled_date || new Date().toISOString(),
        price: dbDelivery.estimated_price || 0,
        createdAt: dbDelivery.created_at,
      }));
      
      set({ deliveries, isLoading: false });
      console.log(`✅ ${deliveries.length} livraisons chargées depuis la base de données`);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      set({ isLoading: false });
    }
  },
  
  addDelivery: async (delivery) => {
    try {
      console.log('🚀 Début de la création de livraison...');
      
      // Créer la livraison en base de données
      const { authService } = await import('@/app/services/api');
      const { data: { user } } = await authService.supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ Utilisateur non authentifié');
        throw new Error('Utilisateur non authentifié');
      }

      console.log('👤 Utilisateur authentifié:', user.id);

      // Créer la livraison en base de données
      console.log('📦 Création de la livraison en base de données...');
      const dbDelivery = await deliveryService.createDelivery({
        userId: user.id,
        pickupAddress: delivery.pickupAddress.address,
        pickupCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
        deliveryAddress: delivery.deliveryAddress.address,
        deliveryCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
        description: delivery.package.description,
        weight: delivery.package.weight,
        estimatedPrice: delivery.price,
        estimatedDuration: 30,
      });

      console.log('✅ Livraison créée en base de données:', dbDelivery.id);

      // Créer l'objet Delivery pour le store local
      const newDelivery: Delivery = {
        ...delivery,
        id: dbDelivery.id,
        trackingNumber: `YT${dbDelivery.id.slice(-6)}`,
        createdAt: dbDelivery.created_at,
      };

      // Ajouter au store local
      set((state) => ({
        deliveries: [...state.deliveries, newDelivery],
      }));

      console.log('📱 Ajout au store local terminé');

      // Déclencher la recherche de livreurs
      console.log('🔍 Démarrage de la recherche de livreurs...');
      const { driverRequestService } = await import('@/app/services/driverRequestService');
      const orderRequest = driverRequestService.createOrderRequest(
        user.id,
        user.user_metadata?.name || 'Client',
        delivery.pickupAddress.address,
        delivery.deliveryAddress.address,
        delivery.price,
        'moto', // Type de véhicule par défaut
        [-5.0189, 7.6995], // Coordonnées par défaut (Bouaké)
        [-5.0189, 7.6995], // Coordonnées par défaut (Bouaké)
        30, // Timeout de 30 secondes
        dbDelivery.id
      );

      console.log('📋 Demande de commande créée:', orderRequest.id);

      // Démarrer la recherche de livreurs
      await driverRequestService.startDriverSearch(orderRequest);

      console.log('✅ Livraison créée et recherche de livreurs démarrée');
      
    } catch (error) {
      console.error('❌ Erreur lors de la création de la livraison:', error);
      throw error;
    }
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
