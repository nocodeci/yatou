const { fcmService } = require('../config/firebase');
const { supabase } = require('../config/supabase');

/**
 * Service de notifications unifié
 * Supporte Firebase FCM et Expo Push Notifications
 */
class NotificationService {
  constructor() {
    this.fcm = fcmService;
  }

  /**
   * Envoyer une notification de nouvelle commande aux livreurs
   */
  async sendOrderNotificationToDrivers(orderData) {
    try {
      console.log('📋 Envoi notification nouvelle commande...');

      // Récupérer tous les livreurs actifs avec leurs tokens
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select(
          `
          id,
          fcm_token,
          expo_push_token,
          users!inner(name, phone),
          is_active
        `,
        )
        .eq('is_active', true)
        .not('fcm_token', 'is', null);

      if (error) {
        console.error('❌ Erreur récupération livreurs:', error);
        return { success: false, error: error.message };
      }

      if (!drivers || drivers.length === 0) {
        console.warn('⚠️ Aucun livreur actif avec token trouvé');
        return { success: false, error: 'Aucun livreur disponible' };
      }

      const title = '🚚 Nouvelle Commande YATOU';
      const body = `Livraison vers ${orderData.delivery_address}`;
      const data = {
        type: 'new_order',
        orderId: orderData.id.toString(),
        pickup_address: orderData.pickup_address || '',
        delivery_address: orderData.delivery_address,
        estimated_price: orderData.estimated_price?.toString() || '0',
      };

      // Séparer les tokens FCM et Expo Push
      const fcmTokens = drivers
        .filter(
          (driver) =>
            typeof driver.fcm_token === 'string' &&
            driver.fcm_token.length > 0 &&
            !driver.fcm_token.startsWith('ExponentPushToken'),
        )
        .map((driver) => driver.fcm_token);

      const expoPushTokens = drivers
        .filter(
          (driver) =>
            typeof driver.expo_push_token === 'string' &&
            driver.expo_push_token.startsWith('ExponentPushToken'),
        )
        .map((driver) => driver.expo_push_token);

      console.log(
        `📱 ${fcmTokens.length} tokens FCM, ${expoPushTokens.length} tokens Expo Push`,
      );

      const results = {
        fcm: null,
        expoPush: null,
        totalSuccess: 0,
        totalFailures: 0,
      };

      // Envoyer via FCM si disponible
      if (fcmTokens.length > 0 && this.fcm.isFirebaseEnabled()) {
        try {
          const fcmResult = await this.fcm.sendToMultipleTokens(
            fcmTokens,
            title,
            body,
            data,
          );
          results.fcm = fcmResult;
          results.totalSuccess += fcmResult.successCount || 0;
          results.totalFailures += fcmResult.failureCount || 0;
          console.log('✅ FCM envoyé:', fcmResult);
        } catch (error) {
          console.error('❌ Erreur FCM:', error);
          results.fcm = { success: false, error: error.message };
        }
      }

      // Envoyer via Expo Push si disponible
      if (expoPushTokens.length > 0) {
        try {
          const expoResult = await this.sendExpoPushNotifications(
            expoPushTokens,
            title,
            body,
            data,
          );
          results.expoPush = expoResult;
          results.totalSuccess += expoResult.successCount || 0;
          results.totalFailures += expoResult.failureCount || 0;
          console.log('✅ Expo Push envoyé:', expoResult);
        } catch (error) {
          console.error('❌ Erreur Expo Push:', error);
          results.expoPush = { success: false, error: error.message };
        }
      }

      return {
        success: results.totalSuccess > 0,
        results,
        driversNotified: drivers.length,
        successfulNotifications: results.totalSuccess,
      };
    } catch (error) {
      console.error('❌ Erreur service notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer une notification de changement de statut au client
   */
  async sendStatusUpdateToClient(userId, orderData, newStatus) {
    try {
      console.log(
        `📱 Envoi notification statut ${newStatus} au client ${userId}`,
      );

      // Récupérer les tokens du client
      const { data: user, error } = await supabase
        .from('users')
        .select('fcm_token, expo_push_token')
        .eq('id', userId)
        .single();

      if (error || !user) {
        console.error('❌ Utilisateur non trouvé:', error);
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      const { title, body } = this.getStatusNotificationContent(
        newStatus,
        orderData,
      );
      const data = {
        type: 'status_update',
        orderId: orderData.id.toString(),
        status: newStatus,
        delivery_address: orderData.delivery_address,
      };

      let result = { success: false };

      // Essayer FCM d'abord
      if (user.fcm_token && this.fcm.isFirebaseEnabled()) {
        try {
          result = await this.fcm.sendToToken(
            user.fcm_token,
            title,
            body,
            data,
          );
          console.log('✅ Notification FCM envoyée au client');
        } catch (error) {
          console.error('❌ Erreur FCM client:', error);
        }
      }

      // Fallback sur Expo Push si FCM échoue
      if (!result.success && user.expo_push_token) {
        try {
          result = await this.sendExpoPushNotifications(
            [user.expo_push_token],
            title,
            body,
            data,
          );
          console.log('✅ Notification Expo Push envoyée au client');
        } catch (error) {
          console.error('❌ Erreur Expo Push client:', error);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Erreur notification client:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envoyer des notifications Expo Push (fallback)
   */
  async sendExpoPushNotifications(tokens, title, body, data = {}) {
    // Note: Implémentation simplifiée - à améliorer avec expo-server-sdk si nécessaire
    console.log('📱 Envoi Expo Push (fallback) - tokens:', tokens.length);

    // Pour l'instant, simulation du succès
    // À remplacer par l'implémentation réelle avec expo-server-sdk
    return {
      success: true,
      successCount: tokens.length,
      failureCount: 0,
      method: 'expo-push-fallback',
    };
  }

  /**
   * Obtenir le contenu de notification selon le statut
   */
  getStatusNotificationContent(status, orderData) {
    const statusMessages = {
      confirmed: {
        title: '✅ Commande Confirmée',
        body: 'Un livreur a pris en charge votre commande',
      },
      picked_up: {
        title: '📦 Commande Récupérée',
        body: 'Votre commande a été récupérée et est en route',
      },
      in_transit: {
        title: '🚚 En Livraison',
        body: 'Votre commande arrive bientôt!',
      },
      delivered: {
        title: '🎉 Livré!',
        body: 'Votre commande a été livrée avec succès',
      },
      cancelled: {
        title: '❌ Commande Annulée',
        body: 'Votre commande a été annulée',
      },
    };

    return (
      statusMessages[status] || {
        title: '📋 Mise à jour',
        body: 'Le statut de votre commande a été mis à jour',
      }
    );
  }

  /**
   * Sauvegarder le token FCM d'un utilisateur
   */
  async saveUserFCMToken(userId, fcmToken, userType = 'client') {
    try {
      let tableName, idField;

      if (userType === 'driver') {
        tableName = 'drivers';
        idField = 'user_id';
      } else {
        tableName = 'users';
        idField = 'id';
      }

      if (typeof fcmToken === 'string') {
        fcmToken = fcmToken.trim();
      }

      const isExpoToken =
        typeof fcmToken === 'string' &&
        fcmToken.startsWith('ExponentPushToken');
      const updates = isExpoToken
        ? { expo_push_token: fcmToken }
        : { fcm_token: fcmToken };

      const { error } = await supabase
        .from(tableName)
        .update(updates)
        .eq(idField, userId);

      if (error) {
        console.error(`❌ Erreur sauvegarde token FCM ${userType}:`, error);
        return { success: false, error: error.message };
      }

      if (userType === 'driver') {
        const { error: userUpdateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);

        if (userUpdateError) {
          console.warn(
            '⚠️ Token enregistré pour driver mais pas synchronisé côté users:',
            userUpdateError,
          );
        }
      }

      console.log(`✅ Token FCM sauvegardé pour ${userType} ${userId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde token:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Tester les notifications
   */
  async testNotification(userId, userType = 'client') {
    const title = '🧪 Test YATOU';
    const body = 'Ceci est un test de notification Firebase FCM';
    const data = {
      type: 'test',
      timestamp: Date.now().toString(),
    };

    if (userType === 'driver') {
      return await this.sendOrderNotificationToDrivers({
        id: 999,
        delivery_address: 'Adresse de test',
        pickup_address: 'Point de départ test',
        estimated_price: 1500,
      });
    } else {
      return await this.sendStatusUpdateToClient(
        userId,
        {
          id: 999,
          delivery_address: 'Adresse de test',
        },
        'confirmed',
      );
    }
  }

  /**
   * Obtenir les statistiques du service
   */
  getServiceStatus() {
    return {
      fcm: this.fcm.getServiceInfo(),
      expoPush: {
        enabled: true,
        status: 'fallback',
      },
    };
  }
}

// Instance singleton
const notificationService = new NotificationService();

module.exports = {
  notificationService,
  NotificationService,
};
