import OneSignal, {
  OSNotification,
  OSNotificationOpenedEvent,
} from 'react-native-onesignal';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { supabase } from '@/app/config/supabase';

type NotificationListener<T> = (event: T) => void;

export interface NotificationData {
  type: 'new_order' | 'order_accepted' | 'order_cancelled' | 'driver_test';
  orderId?: string;
  clientName?: string;
  pickupAddress?: string;
  deliveryAddress?: string;
  estimatedPrice?: number;
  vehicleType?: string;
  driverId?: string;
  [key: string]: unknown;
}

interface SimplifiedNotification {
  request: {
    content: {
      title?: string | null;
      body?: string | null;
      data?: Record<string, unknown>;
    };
  };
}

interface SimplifiedNotificationResponse {
  notification: SimplifiedNotification;
}

class NotificationService {
  private backendUrl: string;
  private playerId: string | null = null;
  private oneSignalAppId: string | null = null;

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

    this.oneSignalAppId =
      (extraConfig.oneSignalAppId as string | undefined) ??
      (globalThis as any)?.process?.env?.ONE_SIGNAL_APP_ID ?? null;

    if (!this.oneSignalAppId) {
      console.warn(
        '⚠️ OneSignal App ID manquant. Les notifications push ne fonctionneront pas.',
      );
      return;
    }

    OneSignal.initialize(this.oneSignalAppId);
  }

  private isEmulatorAllowed(): boolean {
    const extraConfig = (Constants.expoConfig?.extra || {}) as Record<
      string,
      unknown
    >;
    const flagFromExtra = extraConfig.allowEmulatorNotifications;
    const envFlag = (globalThis as any)?.process?.env
      ?.EXPO_PUBLIC_ALLOW_EMULATOR_NOTIFICATIONS as string | undefined;

    return (
      __DEV__ ||
      flagFromExtra === true ||
      flagFromExtra === 'true' ||
      envFlag === 'true'
    );
  }

  private mapNotification(notification: OSNotification): SimplifiedNotification {
    return {
      request: {
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.additionalData || {},
        },
      },
    };
  }

  addNotificationReceivedListener(
    listener: NotificationListener<SimplifiedNotification>,
  ) {
    const subscription = OneSignal.Notifications.addForegroundListener(
      (event) => {
        listener(this.mapNotification(event.notification));
      },
    );

    return {
      remove: () => {
        subscription();
      },
    };
  }

  addNotificationResponseReceivedListener(
    listener: NotificationListener<SimplifiedNotificationResponse>,
  ) {
    const subscription = OneSignal.Notifications.addOpenedListener(
      (event: OSNotificationOpenedEvent) => {
        listener({
          notification: this.mapNotification(event.notification),
        });
      },
    );

    return {
      remove: () => {
        subscription();
      },
    };
  }

  private async requestPermissions(): Promise<boolean> {
    const { granted } = await OneSignal.Notifications.requestPermission(true);
    if (!granted) {
      if (__DEV__) {
        Alert.alert(
          'Notifications requises',
          'Activez les notifications pour recevoir les commandes.',
        );
      }
      return false;
    }
    return true;
  }

  async registerForPushNotifications(
    driverId?: string,
    userType: 'client' | 'driver' = 'client',
  ): Promise<string | null> {
    if (!this.oneSignalAppId) {
      return null;
    }

    if (!Device.isDevice && !this.isEmulatorAllowed()) {
      console.log(
        '⚠️ Notifications push désactivées sur cet émulateur. Activez `allowEmulatorNotifications` pour les tests.',
      );
      return null;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      return null;
    }

    if (driverId) {
      try {
        await OneSignal.login(driverId);
      } catch (error) {
        console.warn('⚠️ Impossible de définir le OneSignal external ID:', error);
      }
    }

    const playerId = await OneSignal.User.pushSubscription.getPushSubscriptionIdAsync();
    if (!playerId) {
      console.warn('⚠️ OneSignal player ID indisponible.');
      return null;
    }

    this.playerId = playerId;

    await this.syncPlayerId(playerId, userType, driverId);

    return playerId;
  }

  private async syncPlayerId(
    playerId: string,
    userType: 'client' | 'driver',
    driverId?: string,
  ): Promise<void> {
    try {
      await this.registerPlayerWithBackend(playerId, userType);

      if (driverId && userType === 'driver') {
        await this.saveDriverPlayerId(driverId, playerId);
      } else {
        await this.registerPlayerWithSupabase(playerId);
      }
    } catch (error) {
      console.error('❌ Erreur synchronisation OneSignal player ID:', error);
    }
  }

  private async registerPlayerWithBackend(
    playerId: string,
    userType: 'client' | 'driver',
  ): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        return false;
      }

      const response = await fetch(
        `${this.backendUrl}/api/notifications/register-player`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            playerId,
            userType,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          '❌ Enregistrement OneSignal backend échoué:',
          await response.text(),
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Erreur communication backend OneSignal:', error);
      return false;
    }
  }

  private async registerPlayerWithSupabase(playerId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ onesignal_player_id: playerId, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Erreur sauvegarde OneSignal player ID utilisateur:', error);
      }
    } catch (error) {
      console.error('❌ Erreur Supabase enregistrement player ID:', error);
    }
  }

  private async saveDriverPlayerId(
    driverId: string,
    playerId: string,
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ onesignal_player_id: playerId, updated_at: new Date().toISOString() })
        .eq('id', driverId);

      if (error) {
        console.error('❌ Erreur sauvegarde player ID driver:', error);
      }
    } catch (error) {
      console.error('❌ Erreur Supabase sauvegarde player ID driver:', error);
    }
  }

  async sendNotificationToDriver(
    _legacyToken: string,
    data: NotificationData,
  ): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        console.warn('⚠️ Impossible de notifier le livreur: token utilisateur manquant');
        return false;
      }

      const response = await fetch(
        `${this.backendUrl}/api/notifications/send-driver`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ notificationData: data }),
        },
      );

      if (!response.ok) {
        console.error(
          '❌ Erreur envoi notification driver via backend:',
          await response.text(),
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception envoi notification driver:', error);
      return false;
    }
  }

  async sendNotificationToClient(
    clientId: string,
    data: NotificationData,
  ): Promise<boolean> {
    try {
      const authToken = await AsyncStorage.getItem('userToken');
      if (!authToken) {
        return false;
      }

      const response = await fetch(
        `${this.backendUrl}/api/notifications/send-client`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ clientId, notificationData: data }),
        },
      );

      if (!response.ok) {
        console.error(
          '❌ Erreur envoi notification client via backend:',
          await response.text(),
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Exception envoi notification client:', error);
      return false;
    }
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  getTokenInfo(): {
    playerId: string | null;
    hasToken: boolean;
  } {
    return {
      playerId: this.playerId,
      hasToken: !!this.playerId,
    };
  }

  async testNotifications(userType: 'client' | 'driver' = 'client') {
    const authToken = await AsyncStorage.getItem('userToken');
    if (!authToken) {
      throw new Error('Utilisateur non authentifié');
    }

    const response = await fetch(`${this.backendUrl}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userType }),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || 'Le test de notification a échoué');
    }

    return result?.data || result;
  }

  async clearAllNotifications(): Promise<void> {
    try {
      await OneSignal.Notifications.clearAllNotifications();
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();
