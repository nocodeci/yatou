import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
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

  /**
   * Enregistrer le device pour recevoir des notifications push
   */
  async registerForPushNotifications(driverId?: string): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Permission de notification refusée');
        return null;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error('Project ID not found');
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        this.expoPushToken = token;
        console.log('Token de notification:', token);

        // Enregistrer le token en base de données si c'est un livreur
        if (driverId && token) {
          await this.saveDriverToken(driverId, token);
        }
      } catch (error) {
        console.error('Erreur lors de l\'obtention du token:', error);
      }
    } else {
      console.log('Les notifications push ne fonctionnent que sur un appareil physique');
    }

    return token;
  }

  /**
   * Sauvegarder le token Expo Push d'un livreur en base de données
   */
  private async saveDriverToken(driverId: string, token: string): Promise<void> {
    try {
      const { supabase } = await import('@/app/config/supabase');
      
      const { error } = await supabase
        .from('drivers')
        .update({ 
          expo_push_token: token,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('Erreur lors de la sauvegarde du token:', error);
      } else {
        console.log(`✅ Token Expo Push sauvegardé pour le livreur ${driverId}`);
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
    data: NotificationData
  ): Promise<boolean> {
    try {
      const message = {
        to: driverExpoToken,
        sound: 'default',
        title: this.getNotificationTitle(data.type),
        body: this.getNotificationBody(data),
        data: data,
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
      console.log('Notification envoyée:', result);
      
      return result.data && result.data.length > 0 && result.data[0].status === 'ok';
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification:', error);
      return false;
    }
  }

  /**
   * Envoyer une notification locale (pour les tests)
   */
  async sendLocalNotification(data: NotificationData): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(data.type),
        body: this.getNotificationBody(data),
        data: data,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Immédiatement
    });
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
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Écouter les interactions avec les notifications
   */
  addNotificationResponseReceivedListener(listener: (response: Notifications.NotificationResponse) => void) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Obtenir le token Expo Push
   */
  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Supprimer toutes les notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Supprimer les badges
   */
  async clearBadge(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }
}

// Instance singleton
export const notificationService = new NotificationService();
