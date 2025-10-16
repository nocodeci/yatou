import { notificationService, NotificationData } from './notificationService';
import { driverService } from './api';
import { supabase } from '@/app/config/supabase';

export interface OrderRequest {
  id: string;
  clientId: string;
  clientName: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedPrice: number;
  vehicleType: string;
  pickupLocation: [number, number];
  deliveryLocation: [number, number];
  createdAt: Date;
  timeout: number; // en secondes
}

export interface DriverResponse {
  driverId: string;
  orderId: string;
  accepted: boolean;
  timestamp: Date;
}

class DriverRequestService {
  private activeRequests: Map<string, OrderRequest> = new Map();
  private requestTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Envoyer une demande à un livreur spécifique
   */
  async sendRequestToDriver(
    driverId: string,
    orderRequest: OrderRequest
  ): Promise<boolean> {
    try {
      // Récupérer les informations du livreur par son ID de profil
      const driverProfile = await this.getDriverProfileById(driverId);
      if (!driverProfile) {
        console.log(`Livreur ${driverId} non trouvé`);
        return false;
      }

      // Pour l'instant, on simule l'envoi de notification
      // En production, vous devriez stocker le token Expo Push du livreur
      const driverExpoToken = await this.getDriverExpoToken(driverId);
      
      if (!driverExpoToken) {
        console.log(`Token Expo Push non trouvé pour le livreur ${driverId}`);
        return false;
      }

      // Préparer les données de notification
      const notificationData: NotificationData = {
        type: 'new_order',
        orderId: orderRequest.id,
        clientName: orderRequest.clientName,
        pickupAddress: orderRequest.pickupAddress,
        deliveryAddress: orderRequest.deliveryAddress,
        estimatedPrice: orderRequest.estimatedPrice,
        vehicleType: orderRequest.vehicleType,
        driverId: driverId,
      };

      // Essayer d'envoyer la notification push
      let success = false;
      
      if (driverExpoToken) {
        success = await notificationService.sendNotificationToDriver(
          driverExpoToken,
          notificationData
        );
      }

      if (success) {
        console.log(`✅ Notification push envoyée à ${driverProfile.userId} (${orderRequest.vehicleType})`);
      } else {
        console.log(`⚠️ Notification push échouée, utilisation de la notification locale pour ${driverProfile.userId}`);
        
        // Fallback : notification locale (pour les tests)
        await notificationService.sendLocalNotification(notificationData);
      }

      // Programmer le timeout dans tous les cas
      this.scheduleRequestTimeout(orderRequest.id, orderRequest.timeout);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande:', error);
      return false;
    }
  }

  /**
   * Traiter la réponse d'un livreur
   */
  async handleDriverResponse(response: DriverResponse): Promise<boolean> {
    const orderRequest = this.activeRequests.get(response.orderId);
    
    if (!orderRequest) {
      console.log(`Commande ${response.orderId} non trouvée`);
      return false;
    }

    // Annuler le timeout
    this.cancelRequestTimeout(response.orderId);

    if (response.accepted) {
      console.log(`✅ ${response.driverId} a accepté la commande ${response.orderId}`);
      
      // Notifier le client que sa commande a été acceptée
      await this.notifyClientOrderAccepted(orderRequest, response.driverId);
      
      // Supprimer la demande active
      this.activeRequests.delete(response.orderId);
      
      return true;
    } else {
      console.log(`❌ ${response.driverId} a refusé la commande ${response.orderId}`);
      
      // Essayer le livreur suivant
      return await this.tryNextDriver(orderRequest);
    }
  }

  /**
   * Essayer le livreur suivant
   */
  private async tryNextDriver(orderRequest: OrderRequest): Promise<boolean> {
    try {
      // Récupérer les livreurs disponibles dans la zone
      const availableDrivers = await driverService.getAvailableDriversInArea(
        orderRequest.pickupLocation[1], // latitude
        orderRequest.pickupLocation[0], // longitude
        15 // rayon de 15km
      );

      // Filtrer par type de véhicule
      const filteredDrivers = availableDrivers.filter(driver => 
        driver.vehicleType === orderRequest.vehicleType
      );

      // Trouver le prochain livreur qui n'a pas encore été contacté
      const contactedDrivers = this.getContactedDrivers(orderRequest.id);
      const nextDriver = filteredDrivers.find(driver => 
        !contactedDrivers.includes(driver.id)
      );

      if (nextDriver) {
        return await this.sendRequestToDriver(nextDriver.id, orderRequest);
      } else {
        console.log('Aucun autre livreur disponible');
        await this.notifyClientNoDriversAvailable(orderRequest);
        this.activeRequests.delete(orderRequest.id);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du livreur suivant:', error);
      return false;
    }
  }

  /**
   * Programmer le timeout d'une demande
   */
  private scheduleRequestTimeout(orderId: string, timeoutSeconds: number): void {
    const timeout = setTimeout(() => {
      console.log(`⏰ Timeout pour la commande ${orderId}`);
      this.handleRequestTimeout(orderId);
    }, timeoutSeconds * 1000);

    this.requestTimeouts.set(orderId, timeout);
  }

  /**
   * Annuler le timeout d'une demande
   */
  private cancelRequestTimeout(orderId: string): void {
    const timeout = this.requestTimeouts.get(orderId);
    if (timeout) {
      clearTimeout(timeout);
      this.requestTimeouts.delete(orderId);
    }
  }

  /**
   * Gérer le timeout d'une demande
   */
  private async handleRequestTimeout(orderId: string): Promise<void> {
    const orderRequest = this.activeRequests.get(orderId);
    if (orderRequest) {
      await this.tryNextDriver(orderRequest);
    }
  }

  /**
   * Notifier le client que sa commande a été acceptée
   */
  private async notifyClientOrderAccepted(orderRequest: OrderRequest, driverId: string): Promise<void> {
    // Ici vous pouvez envoyer une notification au client
    console.log(`📱 Notification envoyée au client: Commande acceptée par ${driverId}`);
  }

  /**
   * Notifier le client qu'aucun livreur n'est disponible
   */
  private async notifyClientNoDriversAvailable(orderRequest: OrderRequest): Promise<void> {
    // Ici vous pouvez envoyer une notification au client
    console.log('📱 Notification envoyée au client: Aucun livreur disponible');
  }

  /**
   * Obtenir les livreurs déjà contactés pour une commande
   */
  private getContactedDrivers(orderId: string): string[] {
    // En production, vous devriez stocker cette information en base de données
    // Pour l'instant, on retourne un tableau vide
    return [];
  }

  /**
   * Récupérer le profil d'un livreur par son ID de profil
   */
  private async getDriverProfileById(driverId: string): Promise<any> {
    try {
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select(`
          *,
          users!inner(id, name, email, phone)
        `)
        .eq('id', driverId)
        .single();

      if (driverError) throw driverError;

      return {
        id: driverData.id,
        userId: driverData.user_id,
        name: driverData.users.name,
        email: driverData.users.email,
        phone: driverData.users.phone,
        vehicleInfo: driverData.vehicle_info,
        isAvailable: driverData.is_available,
        currentLocation: driverData.current_location,
        rating: driverData.rating,
        totalDeliveries: driverData.total_deliveries,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du profil livreur:', error);
      return null;
    }
  }

  /**
   * Obtenir le token Expo Push d'un livreur
   */
  private async getDriverExpoToken(driverId: string): Promise<string | null> {
    try {
      // En production, récupérer le token depuis la base de données
      const { data: driverData, error } = await supabase
        .from('drivers')
        .select('expo_push_token')
        .eq('id', driverId)
        .single();

      if (error || !driverData?.expo_push_token) {
        console.log(`Token Expo Push non trouvé pour le livreur ${driverId}`);
        return null;
      }

      return driverData.expo_push_token;
    } catch (error) {
      console.error('Erreur lors de la récupération du token Expo Push:', error);
      return null;
    }
  }

  /**
   * Créer une nouvelle demande de commande
   */
  createOrderRequest(
    clientId: string,
    clientName: string,
    pickupAddress: string,
    deliveryAddress: string,
    estimatedPrice: number,
    vehicleType: string,
    pickupLocation: [number, number],
    deliveryLocation: [number, number],
    timeoutSeconds: number = 30
  ): OrderRequest {
    const orderRequest: OrderRequest = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      clientName,
      pickupAddress,
      deliveryAddress,
      estimatedPrice,
      vehicleType,
      pickupLocation,
      deliveryLocation,
      createdAt: new Date(),
      timeout: timeoutSeconds,
    };

    this.activeRequests.set(orderRequest.id, orderRequest);
    return orderRequest;
  }

  /**
   * Obtenir une demande active
   */
  getActiveRequest(orderId: string): OrderRequest | undefined {
    return this.activeRequests.get(orderId);
  }

  /**
   * Supprimer une demande active
   */
  removeActiveRequest(orderId: string): void {
    this.cancelRequestTimeout(orderId);
    this.activeRequests.delete(orderId);
  }
}

// Instance singleton
export const driverRequestService = new DriverRequestService();
