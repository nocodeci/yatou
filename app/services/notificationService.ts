import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration avancée des notifications
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log(
      '🔔 Handler de notification appelé:',
      notification.request.content,
    );

    // Vérifier si la notification est pour les livreurs seulement
    const targetRole = notification.request.content.data?.targetRole;
    const notificationType = notification.request.content.data?.type;

    // Si c'est une notification de nouvelle commande pour les livreurs, ne pas l'afficher aux clients
    if (targetRole === 'driver' && notificationType === 'new_order') {
      // Vérifier si l'utilisateur actuel est un livreur
      // Pour l'instant, on laisse passer toutes les notifications
      // mais on pourrait ajouter une vérification du rôle ici
      console.log(
        '🔔 Notification de nouvelle commande reçue - vérification du rôle nécessaire',
      );

      // TEMPORAIRE : Ne pas afficher les notifications de nouvelles commandes aux clients
      // TODO: Ajouter une vérification du rôle utilisateur
      return {
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      };
    }

    // Si c'est une notification de commande acceptée pour les clients, l'afficher
    if (targetRole === 'client' && notificationType === 'order_accepted') {
      console.log('🔔 Notification de commande acceptée reçue par le client');
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      };
    }

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    };
  },
});

export interface NotificationData {
  type: 'new_order' | 'order_accepted' | 'order_cancelled';
  orderId?: string;
  clientName?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedPrice?: number;
  vehicleType?: string;
  driverId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private fcmToken: string | null = null;
  private backendUrl: string;

  constructor() {
    const extraConfig = (Constants.expoConfig?.extra || {}) as Record<
      string,
      unknown
    >;
    const envBackendUrl = (globalThis as any)?.process?.env
      ?.EXPO_PUBLIC_API_URL as string | undefined;
    const explicitBackendUrl =
      (extraConfig.apiUrl as string | undefined) ??
      (extraConfig.backendUrl as string | undefined);

    this.backendUrl =
      envBackendUrl ?? explicitBackendUrl ?? 'http://192.168.100.191:3001';

    if (__DEV__) {
      console.log('🔧 NotificationService backend URL:', this.backendUrl);
    }
  }

  /**
   * Enregistrer le device pour recevoir des notifications push
   */
  async registerForPushNotifications(
    driverId?: string,
    userType: 'client' | 'driver' = 'client',
  ): Promise<string | null> {
    let token = null;

    console.log("🔔 Démarrage de l'enregistrement des notifications push...");

    if (Platform.OS === 'android') {
      console.log('📱 Configuration du canal Android...');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'YATOU Commandes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#DC2626',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });

      // Canal spécial pour les commandes urgentes
      await Notifications.setNotificationChannelAsync('urgent_orders', {
        name: 'Commandes Urgentes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 100, 50, 100, 50, 100],
        lightColor: '#DC2626',
        sound: 'default',
        enableLights: true,
        enableVibrate: true,
        showBadge: true,
      });
    }

    if (Device.isDevice) {
      console.log('📱 Vérification des permissions...');
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      console.log('📱 Status actuel des permissions:', existingStatus);

      if (existingStatus !== 'granted') {
        console.log('📱 Demande de permissions...');
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowDisplayInCarPlay: true,
            allowCriticalAlerts: true,
            provideAppNotificationSettings: true,
            allowProvisional: false,
          },
        });
        finalStatus = status;
      }

      console.log('📱 Status final des permissions:', finalStatus);

      if (finalStatus !== 'granted') {
        console.log('❌ Permission de notification refusée');
        // Ne pas afficher d'alert en production pour éviter les erreurs
        if (__DEV__) {
          Alert.alert(
            'Notifications requises',
            'Les notifications sont nécessaires pour recevoir les commandes. Veuillez les activer dans les paramètres.',
            [{ text: 'OK' }],
          );
        }
        return null;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        console.log('📱 Project ID:', projectId);

        if (!projectId) {
          console.error('❌ Project ID manquant dans la configuration');
          throw new Error('Project ID not found in configuration');
        }

        console.log('📱 Génération du token Expo Push...');
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
          applicationId: Constants.expoConfig?.slug || 'yatou-delivery',
        });

        token = tokenData.data;
        this.expoPushToken = token;

        console.log('✅ Token Expo Push généré:', token);

        // Générer aussi un token FCM pour Firebase
        await this.tryRegisterFcmToken(userType);

        // Enregistrer le token Expo Push en base si c'est un livreur (fallback)
        if (driverId && token) {
          console.log(
            '💾 Sauvegarde du token Expo Push pour le livreur:',
            driverId,
          );
          await this.saveDriverToken(driverId, token);
        }

        // Test de validation du token
        await this.validateToken(token);
      } catch (error) {
        console.error("❌ Erreur lors de l'obtention du token:", error);

        // Ne montrer l'alert que si c'est une vraie erreur critique
        if (__DEV__ || (error as Error).message.includes('Project ID')) {
          Alert.alert(
            'Erreur de configuration',
            'Impossible de configurer les notifications. Vérifiez votre connexion internet.',
            [{ text: 'OK' }],
          );
        }

        // En production, juste logger l'erreur sans bloquer l'utilisateur
        console.log('🔄 Tentative de fallback pour les notifications...');
      }
    } else {
      console.log(
        '⚠️ Les notifications push ne fonctionnent que sur un appareil physique',
      );

      // En mode développement uniquement, utiliser un token de test
      if (__DEV__) {
        console.log(
          "📱 Utilisation d'un token de développement pour les tests...",
        );
        token = 'ExponentPushToken[development-simulator-token]';
        this.expoPushToken = token;
      } else {
        // En production sur simulateur, ne pas générer de token
        console.log(
          '📱 Mode production détecté - aucun token généré pour simulateur',
        );
        return null;
      }
    }

    console.log(
      '🔔 Enregistrement des notifications terminé. Token:',
      token ? 'Présent' : 'Absent',
    );
    return token;
  }

  /**
   * Valider le token Expo Push
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      console.log('🔍 Validation du token...');

      // Validation simple du format sans test de notification
      if (
        token.startsWith('ExponentPushToken[') &&
        token.endsWith(']') &&
        token.length > 30
      ) {
        console.log('✅ Format du token valide');
        return true;
      } else {
        console.log(
          '❌ Format du token invalide:',
          token.substring(0, 20) + '...',
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la validation du token:', error);
      return false;
    }
  }

  /**
   * Sauvegarder le token Expo Push d'un livreur en base de données
   */
  private async saveDriverToken(
    driverId: string,
    token: string,
  ): Promise<void> {
    try {
      const { supabase } = await import('@/app/config/supabase');

      const { error } = await supabase
        .from('drivers')
        .update({
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur lors de la sauvegarde du token:', error);
      } else {
        console.log(
          `✅ Token Expo Push sauvegardé pour le livreur ${driverId}`,
        );
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  }

  /**
   * Envoyer une notification à un livreur spécifique
   */
  async sendNotificationToDriver(
    driverExpoToken: string,
    data: NotificationData,
  ): Promise<boolean> {
    try {
      // S'assurer que seuls les livreurs reçoivent les notifications de nouvelles commandes
      if (data.type === 'new_order' && !data.driverId) {
        console.log(
          '⚠️ Notification de nouvelle commande ignorée - pas de driverId',
        );
        return false;
      }

      // Configuration avancée du message
      const message = {
        to: driverExpoToken,
        sound: 'default',
        title: this.getNotificationTitle(data.type),
        body: this.getNotificationBody(data),
        data: {
          ...data,
          targetRole: 'driver', // Indiquer que cette notification est pour les livreurs
          timestamp: Date.now(),
          version: '1.0',
        },
        priority: 'high',
        channelId: data.type === 'new_order' ? 'urgent_orders' : 'default',
        badge: 1,
        ttl: 300, // 5 minutes de validité
        expiration: Math.floor(Date.now() / 1000) + 300,
        categoryId: data.type,
        mutableContent: true,
      };

      console.log('📤 Envoi notification au livreur:', {
        to: driverExpoToken.substring(0, 20) + '...',
        title: message.title,
        type: data.type,
        orderId: data.orderId,
      });

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();

      if (result.data && result.data[0]?.status === 'ok') {
        console.log('✅ Notification envoyée avec succès au livreur');
      } else {
        console.log("❌ Erreur lors de l'envoi de la notification:", result);
      }

      console.log('📤 Détails de la réponse:', result);

      return (
        result.data && result.data.length > 0 && result.data[0].status === 'ok'
      );
    } catch (error) {
      console.error("Erreur lors de l'envoi de la notification:", error);
      return false;
    }
  }

  /**
   * Envoyer une notification à un client spécifique
   */
  async sendNotificationToClient(
    clientId: string,
    data: NotificationData,
  ): Promise<boolean> {
    try {
      // Récupérer le token Expo du client depuis la base de données
      const { supabase } = await import('./api');
      const { data: clientData, error } = await supabase
        .from('users')
        .select('expo_push_token')
        .eq('id', clientId)
        .single();

      if (error || !clientData?.expo_push_token) {
        console.log('⚠️ Pas de token Expo pour le client:', clientId);
        return false;
      }

      const message = {
        to: clientData.expo_push_token,
        sound: 'default',
        title: this.getNotificationTitle(data.type),
        body: this.getNotificationBody(data),
        data: {
          ...data,
          targetRole: 'client', // Indiquer que cette notification est pour les clients
        } as Record<string, unknown>,
        priority: 'high',
        channelId: 'default',
        badge: 1,
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Notification envoyée au client:', result);

      return (
        result.data && result.data.length > 0 && result.data[0].status === 'ok'
      );
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi de la notification au client:",
        error,
      );
      return false;
    }
  }

  /**
   * Envoyer une notification locale (pour les tests)
   */
  async sendLocalNotification(data: NotificationData): Promise<void> {
    console.log('📱 Envoi notification locale:', data);

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getNotificationTitle(data.type),
          body: this.getNotificationBody(data),
          data: data as unknown as Record<string, unknown>,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          badge: 1,
        },
        trigger: null, // Immédiatement
      });

      console.log('✅ Notification locale envoyée');
    } catch (error) {
      console.error('❌ Erreur notification locale:', error);
    }
  }

  /**
   * Tester les notifications (développement uniquement)
   */
  async testNotification(): Promise<void> {
    if (!__DEV__) {
      console.log('🚫 Tests de notification désactivés en production');
      return;
    }

    console.log('🧪 Test des notifications en mode développement...');

    try {
      await this.sendLocalNotification({
        type: 'new_order',
        orderId: 'test_order_' + Date.now(),
        clientName: 'Client Test Dev',
        pickupAddress: 'Adresse de test',
        deliveryAddress: 'Destination de test',
        estimatedPrice: 1000,
        vehicleType: 'moto',
      });
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
    }
  }

  /**
   * Obtenir le titre de la notification selon le type
   */
  private getNotificationTitle(type: NotificationData['type']): string {
    switch (type) {
      case 'new_order':
        return '🚨 NOUVELLE COMMANDE URGENTE';
      case 'order_accepted':
        return '✅ Commande acceptée';
      case 'order_cancelled':
        return '❌ Commande annulée';
      default:
        return 'Notification YATOU';
    }
  }

  /**
   * Obtenir le corps de la notification selon le type
   */
  private getNotificationBody(data: NotificationData): string {
    switch (data.type) {
      case 'new_order':
        return `Nouvelle commande de ${data.clientName || 'Client'}\n${data.estimatedPrice?.toLocaleString()} FCFA • ${data.vehicleType}\nDépart: ${data.pickupAddress}\nArrivée: ${data.deliveryAddress}`;
      case 'order_accepted':
        return `Votre commande a été acceptée par ${data.driverId}`;
      case 'order_cancelled':
        return 'Votre commande a été annulée';
      default:
        return 'Vous avez reçu une notification';
    }
  }

  /**
   * Écouter les notifications reçues
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void,
  ) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Écouter les interactions avec les notifications
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Générer un token FCM Firebase (version simplifiée)
   */
  private async tryRegisterFcmToken(userType: string): Promise<string | null> {
    try {
      const fcmToken = await this.generateFCMToken();
      if (!fcmToken) {
        return null;
      }

      console.log('✅ Token FCM généré:', fcmToken);
      await this.registerTokenWithBackend(fcmToken, userType);
      return fcmToken;
    } catch (error) {
      console.warn(
        '⚠️ Impossible de générer/enregistrer le token FCM, fallback Expo Push',
        error,
      );
      return null;
    }
  }

  private async generateFCMToken(): Promise<string | null> {
    try {
      // Vérifier si on a déjà un token FCM stocké
      const storedFCMToken = await AsyncStorage.getItem('fcm_token');
      if (storedFCMToken) {
        this.fcmToken = storedFCMToken;
        console.log('✅ Token FCM récupéré du cache');
        return storedFCMToken;
      }

      if (!Device.isDevice) {
        console.log(
          '⚠️ Génération de token FCM ignorée (simulateur non supporté)',
        );
        return null;
      }

      console.log('🔥 Génération token FCM réel...');

      // Expo New Notifications API — retourne un token APNs/FCM natif
      const pushToken = await Notifications.getDevicePushTokenAsync();

      console.log(
        '🔥 Token natif généré (provider):',
        pushToken?.type ?? 'inconnu',
      );

      if (!pushToken?.data) {
        console.warn('⚠️ Aucun token FCM retourné par getDevicePushTokenAsync');
        return null;
      }

      const resolvedToken = String(pushToken.data);

      this.fcmToken = resolvedToken;
      await AsyncStorage.setItem('fcm_token', resolvedToken);
      console.log('✅ Token FCM généré et sauvegardé');

      return resolvedToken;
    } catch (error) {
      console.error('❌ Erreur génération FCM token:', error);
      return null;
    }
  }

  /**
   * Enregistrer le token avec le backend
   */
  private async registerTokenWithBackend(
    token: string,
    userType: string,
  ): Promise<boolean> {
    try {
      const normalizedToken = typeof token === 'string' ? token.trim() : token;

      if (!this.backendUrl) {
        console.warn(
          '⚠️ Aucune URL backend configurée - enregistrement token ignoré',
        );
        return false;
      }

      console.log(`📡 Enregistrement token ${userType} avec le backend...`);

      // Récupérer le token d'authentification
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        console.warn(
          "⚠️ Pas de token d'authentification - enregistrement différé",
        );
        return false;
      }

      const response = await fetch(
        `${this.backendUrl}/api/notifications/register-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            fcmToken: normalizedToken,
            userType: userType,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token enregistré avec le backend:', data);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Erreur enregistrement backend:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur communication backend:', error);
      return false;
    }
  }

  /**
   * Obtenir le token Expo Push actuel
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Obtenir le token FCM actuel
   */
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Obtenir les informations sur les tokens
   */
  getTokenInfo(): {
    expoPush: string | null;
    fcm: string | null;
    hasTokens: boolean;
  } {
    return {
      expoPush: this.expoPushToken,
      fcm: this.fcmToken,
      hasTokens: !!(this.expoPushToken || this.fcmToken),
    };
  }

  /**
   * Tester l'envoi de notifications
   */
  async testNotifications(): Promise<void> {
    try {
      console.log('🧪 Test des notifications...');

      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        console.warn("⚠️ Pas de token d'authentification pour le test");
        return;
      }

      const response = await fetch(
        `${this.backendUrl}/api/notifications/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            userType: 'client',
          }),
        },
      );

      if (response.ok) {
        console.log('✅ Test de notification envoyé');
      } else {
        console.error('❌ Erreur test notification');
      }
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
    }
  }

  /**
   * Effacer toutes les notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Effacer le badge de l'application
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

// Instance singleton
export const notificationService = new NotificationService();

// Auto-initialisation pour le développement uniquement
if (__DEV__) {
  console.log('🔔 Service de notifications initialisé en mode développement');
  // Les tests automatiques sont désactivés pour éviter les erreurs sur appareil physique
} else {
  console.log('🔔 Service de notifications initialisé en mode production');
}
