import { notificationService, NotificationData } from './notificationService';
import { driverService } from './api';
import { supabase } from '@/app/config/supabase';

export interface OrderRequest {
  id: string;
  deliveryId?: string;
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
  availableDrivers?: any[]; // Liste des livreurs disponibles
  currentDriverIndex?: number; // Index du livreur actuel
}

export interface DriverResponse {
  driverId: string;
  orderId: string;
  accepted: boolean;
  timestamp: Date;
  notificationData?: {
    orderId?: string;
    clientName?: string;
    pickupAddress?: string;
    deliveryAddress?: string;
    estimatedPrice?: number;
    vehicleType?: string;
    body?: string;
  };
}

interface ExpiredRequestEntry {
  order: OrderRequest;
  storedAt: number;
}

class DriverRequestService {
  private activeRequests: Map<string, OrderRequest> = new Map();
  private requestTimeouts: Map<string, ReturnType<typeof setTimeout>> =
    new Map();
  private expiredRequests: Map<string, ExpiredRequestEntry> = new Map();
  private orderIdAliases: Map<string, string> = new Map();
  private readonly EXPIRED_REQUEST_TTL_MS = 5 * 60 * 1000; // 5 minutes de rétention

  /**
   * Envoyer une demande à un livreur spécifique
   */
  async sendRequestToDriver(
    driverId: string,
    orderRequest: OrderRequest,
  ): Promise<boolean> {
    try {
      // Récupérer les informations du livreur par son ID de profil
      const driverProfile = await this.getDriverProfileById(driverId);
      if (!driverProfile) {
        console.log(`Livreur ${driverId} non trouvé`);
        return false;
      }

      // Récupérer le token Expo Push du livreur
      const driverExpoToken = await this.getDriverExpoToken(driverId);

      if (!driverExpoToken) {
        // Ne pas logger à chaque fois pour éviter le spam
        // console.log(`Token Expo Push non trouvé pour le livreur ${driverId} - utilisation des notifications locales`);
        // Continuer avec les notifications locales au lieu de retourner false
      }

      // Préparer les données de notification
      const notificationData: NotificationData = {
        type: 'new_order',
        orderId: orderRequest.deliveryId ?? orderRequest.id,
        clientName: orderRequest.clientName,
        pickupAddress: orderRequest.pickupAddress,
        deliveryAddress: orderRequest.deliveryAddress,
        estimatedPrice: orderRequest.estimatedPrice,
        vehicleType: orderRequest.vehicleType,
        driverId: driverId,
      };

      // Essayer d'envoyer la notification push si token disponible
      let pushSuccess = false;

      if (driverExpoToken) {
        pushSuccess = await notificationService.sendNotificationToDriver(
          driverExpoToken,
          notificationData,
        );

        if (pushSuccess) {
          console.log(
            `✅ Notification push envoyée à ${driverProfile.userId} (${orderRequest.vehicleType})`,
          );
        } else {
          console.log(
            `⚠️ Notification push échouée pour ${driverProfile.userId}`,
          );
        }
      } else {
        console.log(
          `⚠️ Pas d'identifiant OneSignal pour ${driverProfile.userId} - notification non envoyée`,
        );
      }

      // NE PLUS ENVOYER DE NOTIFICATIONS LOCALES
      // Les notifications locales sont envoyées à tous les appareils, pas seulement au livreur ciblé
      // On utilise uniquement les notifications push qui ciblent un appareil spécifique

      // Programmer le timeout dans tous les cas
      this.scheduleRequestTimeout(orderRequest.id, orderRequest.timeout);

      return pushSuccess;
    } catch (error) {
      console.error("Erreur lors de l'envoi de la demande:", error);
      return false;
    }
  }

  /**
   * Traiter la réponse d'un livreur
   */
  async handleDriverResponse(response: DriverResponse): Promise<boolean> {
    console.log('🔍 DEBUG - handleDriverResponse appelé avec:', {
      orderId: response.orderId,
      driverId: response.driverId,
      accepted: response.accepted,
      hasNotificationData: !!response.notificationData,
      notificationData: response.notificationData,
    });

    const primaryOrderId = this.resolvePrimaryOrderId(response.orderId);
    const orderRequest = primaryOrderId
      ? this.activeRequests.get(primaryOrderId)
      : undefined;

    if (!orderRequest) {
      console.log(
        `⚠️ Commande ${response.orderId} non trouvée dans activeRequests (peut-être expirée)`,
      );

      // Si la commande n'est pas trouvée, essayer de la traiter quand même
      // car elle pourrait avoir été supprimée par timeout mais le livreur répond encore
      if (response.accepted) {
        console.log(
          `📱 Livreur ${response.driverId} accepte une commande expirée - traitement direct`,
        );
        console.log(
          '🔍 DEBUG - Données de notification reçues:',
          response.notificationData,
        );
        // Créer une livraison directement en base de données
        await this.createDeliveryFromExpiredOrder(
          response.orderId,
          response.driverId,
          response.notificationData,
        );
        return true;
      }

      return false;
    }

    // Annuler le timeout
    this.cancelRequestTimeout(orderRequest.id);

    if (response.accepted) {
      console.log(
        `✅ ${response.driverId} a accepté la commande ${response.orderId}`,
      );

      // Notifier le client que sa commande a été acceptée
      await this.notifyClientOrderAccepted(orderRequest, response.driverId);

      // Supprimer la demande active
      this.activeRequests.delete(orderRequest.id);
      this.expiredRequests.delete(orderRequest.id);
      this.unregisterOrderAliases(orderRequest);

      return true;
    } else {
      console.log(
        `❌ ${response.driverId} a refusé la commande ${response.orderId}`,
      );

      // Passer au livreur suivant
      orderRequest.currentDriverIndex =
        (orderRequest.currentDriverIndex || 0) + 1;

      // Essayer le livreur suivant
      return await this.tryNextDriver(orderRequest);
    }
  }

  /**
   * Essayer le livreur suivant
   */
  private async tryNextDriver(orderRequest: OrderRequest): Promise<boolean> {
    try {
      // Utiliser la liste des livreurs déjà stockée
      const availableDrivers = orderRequest.availableDrivers || [];
      const currentIndex = orderRequest.currentDriverIndex || 0;

      if (currentIndex >= availableDrivers.length) {
        console.log('Aucun autre livreur disponible');
        await this.notifyClientNoDriversAvailable(orderRequest);
        this.moveRequestToExpired(orderRequest);
        return false;
      }

      const nextDriver = availableDrivers[currentIndex];
      console.log(
        `📱 Contact du livreur ${currentIndex + 1}/${availableDrivers.length}: ${nextDriver.name}`,
      );

      return await this.sendRequestToDriver(nextDriver.id, orderRequest);
    } catch (error) {
      console.error('Erreur lors de la recherche du livreur suivant:', error);
      return false;
    }
  }

  /**
   * Programmer le timeout d'une demande
   */
  private scheduleRequestTimeout(
    orderId: string,
    timeoutSeconds: number,
  ): void {
    this.cancelRequestTimeout(orderId);

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
    const primaryId = this.resolvePrimaryOrderId(orderId) || orderId;
    const timeout = this.requestTimeouts.get(primaryId);
    if (timeout) {
      clearTimeout(timeout);
      this.requestTimeouts.delete(primaryId);
    }
  }

  /**
   * Gérer le timeout d'une demande
   */
  private async handleRequestTimeout(orderId: string): Promise<void> {
    const orderRequest = this.activeRequests.get(orderId);
    if (orderRequest) {
      console.log(
        `⏰ Timeout pour la commande ${orderId} - passage au livreur suivant`,
      );

      // Passer au livreur suivant
      orderRequest.currentDriverIndex =
        (orderRequest.currentDriverIndex || 0) + 1;

      await this.tryNextDriver(orderRequest);
    }
  }

  /**
   * Notifier le client que sa commande a été acceptée
   */
  private async notifyClientOrderAccepted(
    orderRequest: OrderRequest,
    driverId: string,
  ): Promise<void> {
    try {
      const { deliveryService } = await import('./api');

      let deliveryId = orderRequest.deliveryId;
      let newlyCreatedDeliveryId: string | null = null;

      if (!deliveryId) {
        const deliveryData = {
          userId: orderRequest.clientId,
          pickupAddress: orderRequest.pickupAddress,
          pickupCoordinates: {
            lat: orderRequest.pickupLocation[0],
            lng: orderRequest.pickupLocation[1],
          },
          deliveryAddress: orderRequest.deliveryAddress,
          deliveryCoordinates: {
            lat: orderRequest.deliveryLocation[0],
            lng: orderRequest.deliveryLocation[1],
          },
          description: `Livraison ${orderRequest.vehicleType}`,
          estimatedPrice: orderRequest.estimatedPrice,
          estimatedDuration: 30, // 30 minutes par défaut
        };

        const delivery = await deliveryService.createDelivery(deliveryData);
        deliveryId = delivery.id;
        newlyCreatedDeliveryId = delivery.id;
        orderRequest.deliveryId = delivery.id;

        console.log(
          `✅ Commande ${orderRequest.id} créée en base de données avec ID: ${delivery.id}`,
        );
      } else {
        console.log(
          `🔁 Utilisation de la livraison existante ${deliveryId} pour la commande ${orderRequest.id}`,
        );
      }

      if (deliveryId) {
        await deliveryService.acceptDelivery(deliveryId, driverId);
        console.log(
          `📦 Livraison ${deliveryId} confirmée avec le livreur ${driverId}`,
        );
      }

      // Notifier le client via le store des livraisons
      try {
        const { useDeliveryStore } = await import('@/app/store/delivery-store');
        const { loadData } = useDeliveryStore.getState();
        await loadData();
        console.log('✅ Store des livraisons rechargé pour le client');
      } catch (error) {
        console.error('Erreur lors du rechargement du store:', error);
      }

      // Envoyer une notification push au client
      try {
        const { notificationService } = await import('./notificationService');
        await notificationService.sendNotificationToClient(
          orderRequest.clientId,
          {
            type: 'order_accepted',
            orderId: orderRequest.id,
            driverId: driverId,
          },
        );
        console.log(
          '📱 Notification push envoyée au client:',
          orderRequest.clientId,
        );
        if (newlyCreatedDeliveryId) {
          console.log(
            `📌 Livraison créée associée au client: ${newlyCreatedDeliveryId}`,
          );
        }
      } catch (error) {
        console.error(
          "Erreur lors de l'envoi de la notification au client:",
          error,
        );
      }
    } catch (error) {
      console.error(
        'Erreur lors de la création de la livraison en base:',
        error,
      );
    }
  }

  /**
   * Notifier le client qu'aucun livreur n'est disponible
   */
  private async notifyClientNoDriversAvailable(
    orderRequest: OrderRequest,
  ): Promise<void> {
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
        .select(
          `
          *,
          users!inner(id, name, email, phone)
        `,
        )
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
   * Obtenir l'identifiant OneSignal enregistré pour un livreur
   */
  private async getDriverExpoToken(driverId: string): Promise<string | null> {
    try {
      // En production, récupérer le token depuis la base de données
      const { data: driverData, error } = await supabase
        .from('drivers')
        .select('onesignal_player_id')
        .eq('id', driverId)
        .single();

      if (error || !driverData?.onesignal_player_id) {
        return null;
      }

      return driverData.onesignal_player_id;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération du player OneSignal:',
        error,
      );
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
    timeoutSeconds: number = 30,
    deliveryId?: string,
  ): OrderRequest {
    const requestId =
      deliveryId ??
      `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const orderRequest: OrderRequest = {
      id: requestId,
      deliveryId,
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
    this.registerOrderAliases(orderRequest);
    return orderRequest;
  }

  /**
   * Obtenir une demande active
   */
  getActiveRequest(orderId: string): OrderRequest | undefined {
    const primaryOrderId = this.resolvePrimaryOrderId(orderId) || orderId;
    return this.activeRequests.get(primaryOrderId);
  }

  /**
   * Démarrer la recherche de livreurs pour une commande
   */
  async startDriverSearch(orderRequest: OrderRequest): Promise<void> {
    try {
      console.log(
        `🚀 Démarrage de la recherche de livreurs pour la commande: ${orderRequest.id}`,
      );

      // Ajouter la demande aux demandes actives
      this.activeRequests.set(orderRequest.id, orderRequest);
      this.registerOrderAliases(orderRequest);

      // Programmer le timeout
      this.scheduleRequestTimeout(orderRequest.id, orderRequest.timeout);

      // Chercher des livreurs disponibles dans la zone
      const availableDrivers = await this.findAvailableDriversInArea(
        orderRequest.pickupLocation[0],
        orderRequest.pickupLocation[1],
        10, // 10km de rayon
      );

      if (availableDrivers.length === 0) {
        console.log('❌ Aucun livreur disponible dans la zone');
        await this.notifyClientNoDriversAvailable(orderRequest);
        this.moveRequestToExpired(orderRequest);
        return;
      }

      console.log(
        `📱 ${availableDrivers.length} livreurs trouvés dans la zone`,
      );

      // Stocker la liste des livreurs disponibles pour cette commande
      orderRequest.availableDrivers = availableDrivers;
      orderRequest.currentDriverIndex = 0;

      // Envoyer la demande au premier livreur seulement
      await this.tryNextDriver(orderRequest);
    } catch (error) {
      console.error(
        'Erreur lors du démarrage de la recherche de livreurs:',
        error,
      );
      throw error;
    }
  }

  /**
   * Trouver des livreurs disponibles dans une zone
   */
  private async findAvailableDriversInArea(
    centerLat: number,
    centerLng: number,
    radiusKm: number,
  ): Promise<any[]> {
    try {
      const { driverService } = await import('./api');
      return await driverService.getAvailableDriversInArea(
        centerLat,
        centerLng,
        radiusKm,
      );
    } catch (error) {
      console.error('Erreur lors de la recherche de livreurs:', error);
      return [];
    }
  }

  /**
   * Supprimer une demande active
   */
  removeActiveRequest(orderId: string): void {
    const primaryOrderId = this.resolvePrimaryOrderId(orderId) || orderId;
    this.cancelRequestTimeout(primaryOrderId);

    const activeRequest = this.activeRequests.get(primaryOrderId);
    if (activeRequest) {
      this.unregisterOrderAliases(activeRequest);
    }

    this.activeRequests.delete(primaryOrderId);
    this.expiredRequests.delete(primaryOrderId);
  }

  /**
   * Créer une livraison à partir d'une commande expirée
   */
  private async createDeliveryFromExpiredOrder(
    orderId: string,
    driverId: string,
    notificationData?: any,
  ): Promise<void> {
    try {
      console.log(
        `📦 Création d'une livraison pour commande expirée: ${orderId}`,
      );
      console.log(
        '🔍 DEBUG - createDeliveryFromExpiredOrder - notificationData reçu:',
        notificationData,
      );

      // Essayer de récupérer la commande depuis activeRequests
      const primaryOrderId = this.resolvePrimaryOrderId(orderId) || orderId;
      let orderRequest = this.activeRequests.get(primaryOrderId);
      let orderSource: 'active' | 'archived' | null = null;

      if (orderRequest) {
        // Utiliser les vraies données de la commande
        console.log(
          `📱 Utilisation des vraies données de la commande: ${primaryOrderId}`,
        );
        this.activeRequests.delete(orderRequest.id);
        this.expiredRequests.delete(orderRequest.id);
        this.cancelRequestTimeout(orderRequest.id);
        orderSource = 'active';
      } else {
        const archivedRequest = this.consumeExpiredRequest(primaryOrderId);
        if (archivedRequest) {
          orderRequest = archivedRequest;
          orderSource = 'archived';
        }
      }

      if (orderRequest) {
        if (orderSource === 'archived') {
          console.log(
            `📱 Utilisation des données archivées pour la commande: ${orderId}`,
          );
        }
        const { deliveryService } = await import('./api');

        if (orderRequest.deliveryId) {
          await this.updateExistingDelivery(
            orderRequest.deliveryId,
            orderRequest,
          );
          await deliveryService.acceptDelivery(
            orderRequest.deliveryId,
            driverId,
          );
          console.log(
            `✅ Livraison confirmée avec vraies données: ${orderRequest.deliveryId}`,
          );
        } else {
          const deliveryData = {
            userId: orderRequest.clientId,
            pickupAddress: orderRequest.pickupAddress,
            pickupCoordinates: {
              lat: orderRequest.pickupLocation[0],
              lng: orderRequest.pickupLocation[1],
            },
            deliveryAddress: orderRequest.deliveryAddress,
            deliveryCoordinates: {
              lat: orderRequest.deliveryLocation[0],
              lng: orderRequest.deliveryLocation[1],
            },
            description: `Livraison commande ${orderId}`,
            estimatedPrice: orderRequest.estimatedPrice,
            estimatedDuration: 30,
          };

          const delivery = await deliveryService.createDelivery(deliveryData);
          await deliveryService.acceptDelivery(delivery.id, driverId);

          console.log(`✅ Livraison créée avec vraies données: ${delivery.id}`);

          // Notifier le client pour commande avec vraies données
          await this.notifyClientOrderAcceptedFromExpired(
            orderRequest.clientId,
            orderId,
            driverId,
            delivery.id,
          );
        }

        // Supprimer la commande des tracking maps
        this.activeRequests.delete(orderRequest.id);
        this.expiredRequests.delete(orderRequest.id);
        this.unregisterOrderAliases(orderRequest);
      } else {
        // Essayer d'utiliser les données de notification si disponibles
        if (notificationData) {
          console.log(
            `📱 Utilisation des données de notification pour commande ${orderId}`,
          );
          console.log(
            '🔍 DEBUG - Données de notification disponibles:',
            JSON.stringify(notificationData, null, 2),
          );

          // Extraire les adresses du body de la notification
          const addresses = this.parseNotificationBody(notificationData.body);

          // Créer ou récupérer un utilisateur temporaire pour les commandes expirées
          const tempUserId = await this.getOrCreateTempUser(orderId);

          const deliveryData = {
            userId: tempUserId,
            pickupAddress:
              addresses.pickup ||
              notificationData.pickupAddress ||
              'Adresse de départ',
            pickupCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
            deliveryAddress:
              addresses.delivery ||
              notificationData.deliveryAddress ||
              "Adresse d'arrivée",
            deliveryCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
            description: `Livraison ${notificationData.vehicleType || 'commande'} ${orderId}`,
            estimatedPrice: notificationData.estimatedPrice || 0,
            estimatedDuration: 30,
          };

          const { deliveryService } = await import('./api');
          const delivery = await deliveryService.createDelivery(deliveryData);
          await deliveryService.acceptDelivery(delivery.id, driverId);

          console.log(
            `✅ Livraison créée avec données de notification: ${delivery.id}`,
          );

          // Notifier le client pour commande avec données de notification
          await this.notifyClientOrderAcceptedFromExpired(
            tempUserId,
            orderId,
            driverId,
            delivery.id,
          );
        } else {
          // Fallback: créer avec des données par défaut
          console.log(
            `⚠️ Commande ${orderId} non trouvée dans activeRequests - utilisation de données par défaut`,
          );
          console.log(
            '🔍 DEBUG - notificationData est vide ou undefined:',
            notificationData,
          );
          this.orderIdAliases.delete(orderId);
          if (primaryOrderId !== orderId) {
            this.orderIdAliases.delete(primaryOrderId);
          }

          // Créer ou récupérer un utilisateur temporaire pour les commandes expirées
          const tempUserId = await this.getOrCreateTempUser(orderId);

          const deliveryData = {
            userId: tempUserId,
            pickupAddress: 'Adresse de départ',
            pickupCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
            deliveryAddress: "Adresse d'arrivée",
            deliveryCoordinates: { lat: -5.0189, lng: 7.6995 }, // Coordonnées par défaut (Bouaké)
            description: `Livraison commande ${orderId}`,
            estimatedPrice: 0,
            estimatedDuration: 30,
          };

          const { deliveryService } = await import('./api');
          const delivery = await deliveryService.createDelivery(deliveryData);
          await deliveryService.acceptDelivery(delivery.id, driverId);

          console.log(
            `✅ Livraison créée avec données par défaut: ${delivery.id}`,
          );

          // Notifier le client pour commande avec données par défaut
          await this.notifyClientOrderAcceptedFromExpired(
            tempUserId,
            orderId,
            driverId,
            delivery.id,
          );
        }
      }
    } catch (error) {
      console.error(
        'Erreur lors de la création de livraison pour commande expirée:',
        error,
      );
    }
  }

  /**
   * Parser le body de la notification pour extraire les adresses
   */
  private parseNotificationBody(body: string | undefined): {
    pickup?: string;
    delivery?: string;
  } {
    if (!body) return {};

    try {
      const lines = body.split('\n');
      let pickup: string | undefined;
      let delivery: string | undefined;

      for (const line of lines) {
        if (line.startsWith('Départ:')) {
          pickup = line.replace('Départ:', '').trim();
        } else if (line.startsWith('Arrivée:')) {
          delivery = line.replace('Arrivée:', '').trim();
        }
      }

      return { pickup, delivery };
    } catch (error) {
      console.error('Erreur lors du parsing du body de notification:', error);
      return {};
    }
  }

  /**
   * Notifier le client qu'une commande expirée a été acceptée
   */
  private async notifyClientOrderAcceptedFromExpired(
    clientId: string,
    orderId: string,
    driverId: string,
    deliveryId: string,
  ): Promise<void> {
    try {
      console.log(
        `📱 Notification client pour commande expirée acceptée: ${orderId}`,
      );

      // Recharger le store des livraisons côté client
      try {
        const { useDeliveryStore } = await import('@/app/store/delivery-store');
        const { loadData } = useDeliveryStore.getState();
        await loadData();
        console.log('✅ Store des livraisons rechargé pour commande expirée');
      } catch (error) {
        console.error('Erreur lors du rechargement du store:', error);
      }

      // Envoyer une notification push au client
      try {
        const { notificationService } = await import('./notificationService');
        await notificationService.sendNotificationToClient(clientId, {
          type: 'order_accepted',
          orderId: orderId,
          driverId: driverId,
        });
        console.log(
          `📱 Notification push envoyée au client pour commande expirée: ${clientId}`,
        );
      } catch (error) {
        console.error(
          "Erreur lors de l'envoi de la notification au client pour commande expirée:",
          error,
        );
      }
    } catch (error) {
      console.error(
        'Erreur lors de la notification client pour commande expirée:',
        error,
      );
    }
  }

  /**
   * Créer ou récupérer un utilisateur temporaire pour les commandes expirées
   */
  private async getOrCreateTempUser(orderId: string): Promise<string> {
    try {
      const { supabase } = await import('@/app/config/supabase');

      // Essayer de trouver un utilisateur existant avec un email temporaire
      const tempEmail = `temp-${orderId}@yatou.com`;

      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', tempEmail)
        .single();

      if (existingUser && !findError) {
        console.log(
          `📱 Utilisateur temporaire existant trouvé: ${existingUser.id}`,
        );
        return existingUser.id;
      }

      // Créer un nouvel utilisateur temporaire
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: tempEmail,
          password: 'temp-password', // Mot de passe temporaire
          name: `Client Temporaire ${orderId}`,
          phone: '+225 00 00 00 00',
          role: 'customer',
          is_active: true,
        })
        .select('id')
        .single();

      if (createError) {
        console.error(
          "Erreur lors de la création de l'utilisateur temporaire:",
          createError,
        );
        // En cas d'erreur, utiliser un UUID par défaut (nécessite un utilisateur existant)
        return '00000000-0000-0000-0000-000000000001';
      }

      console.log(`✅ Utilisateur temporaire créé: ${newUser.id}`);
      return newUser.id;
    } catch (error) {
      console.error(
        "Erreur lors de la gestion de l'utilisateur temporaire:",
        error,
      );
      // En cas d'erreur, utiliser un UUID par défaut (nécessite un utilisateur existant)
      return '00000000-0000-0000-0000-000000000001';
    }
  }

  /**
   * Mettre à jour une livraison existante avec les données réelles de la commande
   */
  private async updateExistingDelivery(
    deliveryId: string,
    orderRequest: OrderRequest,
  ): Promise<void> {
    try {
      await supabase
        .from('deliveries')
        .update({
          pickup_address: orderRequest.pickupAddress,
          pickup_coordinates: `(${orderRequest.pickupLocation[1]},${orderRequest.pickupLocation[0]})`,
          delivery_address: orderRequest.deliveryAddress,
          delivery_coordinates: `(${orderRequest.deliveryLocation[1]},${orderRequest.deliveryLocation[0]})`,
          description: `Livraison commande ${orderRequest.id}`,
          estimated_price: orderRequest.estimatedPrice,
          estimated_duration: 30,
        })
        .eq('id', deliveryId);
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de la livraison existante:',
        error,
      );
    }
  }

  /**
   * Enregistrer les alias d'une commande (ex: ID de livraison en base)
   */
  private registerOrderAliases(orderRequest: OrderRequest): void {
    if (
      orderRequest.deliveryId &&
      orderRequest.deliveryId !== orderRequest.id
    ) {
      this.orderIdAliases.set(orderRequest.deliveryId, orderRequest.id);
    }
  }

  /**
   * Supprimer les alias d'une commande
   */
  private unregisterOrderAliases(orderRequest: OrderRequest): void {
    if (
      orderRequest.deliveryId &&
      orderRequest.deliveryId !== orderRequest.id
    ) {
      this.orderIdAliases.delete(orderRequest.deliveryId);
    }
  }

  /**
   * Résoudre un identifiant de commande (alias ou identifiant interne)
   */
  private resolvePrimaryOrderId(orderId: string): string | null {
    if (this.activeRequests.has(orderId) || this.expiredRequests.has(orderId)) {
      return orderId;
    }

    const aliasId = this.orderIdAliases.get(orderId);
    if (
      aliasId &&
      (this.activeRequests.has(aliasId) || this.expiredRequests.has(aliasId))
    ) {
      return aliasId;
    }

    return aliasId ?? null;
  }

  /**
   * Déplacer une commande expirée vers la réserve pour gérer les réponses tardives
   */
  private moveRequestToExpired(orderRequest: OrderRequest): void {
    this.cancelRequestTimeout(orderRequest.id);
    this.activeRequests.delete(orderRequest.id);
    this.expiredRequests.set(orderRequest.id, {
      order: { ...orderRequest },
      storedAt: Date.now(),
    });
  }

  /**
   * Récupérer et consommer une commande expirée si elle est toujours valide
   */
  private consumeExpiredRequest(orderId: string): OrderRequest | null {
    if (!orderId) {
      return null;
    }

    const entry = this.expiredRequests.get(orderId);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.storedAt > this.EXPIRED_REQUEST_TTL_MS) {
      this.expiredRequests.delete(orderId);
      this.unregisterOrderAliases(entry.order);
      return null;
    }

    this.expiredRequests.delete(orderId);
    return entry.order;
  }
}

// Instance singleton
export const driverRequestService = new DriverRequestService();
