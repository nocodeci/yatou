const { supabase } = require('../config/supabase');

const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID;
const ONE_SIGNAL_REST_API_KEY = process.env.ONE_SIGNAL_REST_API_KEY;

if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
  console.warn(
    '⚠️ OneSignal non configuré (ONE_SIGNAL_APP_ID / ONE_SIGNAL_REST_API_KEY manquants). Les notifications push échoueront.',
  );
}

async function sendOneSignalNotification({
  playerIds,
  headings,
  contents,
  data,
}) {
  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
    return {
      success: false,
      error: 'ONESIGNAL_NOT_CONFIGURED',
    };
  }

  if (!playerIds || playerIds.length === 0) {
    return { success: false, error: 'NO_PLAYERS' };
  }

  const payload = {
    app_id: ONE_SIGNAL_APP_ID,
    include_player_ids: playerIds,
    headings: { en: headings },
    contents: { en: contents },
    data,
  };

  const response = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${ONE_SIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('❌ OneSignal API error:', error);
    return { success: false, error };
  }

  const result = await response.json();
  return { success: true, result };
}

class NotificationService {
  async sendOrderNotificationToDrivers(orderData) {
    try {
      const { data: drivers, error } = await supabase
        .from('drivers')
        .select('id, onesignal_player_id')
        .eq('is_active', true)
        .not('onesignal_player_id', 'is', null);

      if (error) {
        console.error('❌ Erreur récupération livreurs:', error);
        return { success: false, error: error.message };
      }

      const playerIds = (drivers || [])
        .map((driver) => driver.onesignal_player_id)
        .filter(Boolean);

      if (playerIds.length === 0) {
        console.warn('⚠️ Aucun player OneSignal enregistré pour les livreurs');
        return { success: false, error: 'NO_DRIVERS' };
      }

      const contents = `Livraison vers ${orderData.delivery_address}`;
      const data = {
        type: 'new_order',
        orderId: orderData.id,
        pickupAddress: orderData.pickup_address,
        deliveryAddress: orderData.delivery_address,
        estimatedPrice: orderData.estimated_price,
        vehicleType: orderData.vehicle_type,
      };

      return await sendOneSignalNotification({
        playerIds,
        headings: '🚚 Nouvelle commande YATOU',
        contents,
        data,
      });
    } catch (error) {
      console.error('❌ Erreur service notification:', error);
      return { success: false, error: error.message };
    }
  }

  async sendStatusUpdateToClient(userId, orderData, newStatus) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('onesignal_player_id')
        .eq('id', userId)
        .single();

      if (error || !user?.onesignal_player_id) {
        console.warn('⚠️ Player OneSignal client introuvable');
        return { success: false, error: 'NO_CLIENT_PLAYER' };
      }

      const messages = {
        confirmed: {
          title: '✅ Commande confirmée',
          body: 'Un livreur a pris votre commande.',
        },
        picked_up: {
          title: '📦 Commande récupérée',
          body: 'Votre commande est en route.',
        },
        in_transit: {
          title: '🚚 En livraison',
          body: 'Le livreur approche de la destination.',
        },
        delivered: {
          title: '🎉 Livraison effectuée',
          body: 'Merci d’avoir utilisé YATOU !',
        },
        cancelled: {
          title: '❌ Commande annulée',
          body: 'Votre commande a été annulée.',
        },
      };

      const notification = messages[newStatus] || {
        title: '📋 Mise à jour commande',
        body: 'Le statut de votre commande a été mis à jour.',
      };

      return await sendOneSignalNotification({
        playerIds: [user.onesignal_player_id],
        headings: notification.title,
        contents: notification.body,
        data: {
          type: 'status_update',
          orderId: orderData.id,
          status: newStatus,
          deliveryAddress: orderData.delivery_address,
        },
      });
    } catch (error) {
      console.error('❌ Erreur notification client:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTestNotificationToDriver(userId) {
    const { data: driver, error } = await supabase
      .from('drivers')
      .select('id, onesignal_player_id')
      .eq('user_id', userId)
      .single();

    if (error || !driver?.onesignal_player_id) {
      return { success: false, error: 'NO_DRIVER_PLAYER' };
    }

    return await sendOneSignalNotification({
      playerIds: [driver.onesignal_player_id],
      headings: '🧪 Test YATOU',
      contents: 'Ceci est une notification de test pour les livreurs.',
      data: {
        type: 'driver_test',
        driverId: driver.id,
        timestamp: Date.now(),
      },
    });
  }

  async sendNotificationToSpecificDriver(notificationData) {
    const { driverId } = notificationData;
    if (!driverId) {
      return { success: false, error: 'DRIVER_ID_REQUIRED' };
    }

    let { data: driver, error } = await supabase
      .from('drivers')
      .select('onesignal_player_id')
      .eq('id', driverId)
      .single();

    if ((error || !driver?.onesignal_player_id) && driverId) {
      const fallback = await supabase
        .from('drivers')
        .select('onesignal_player_id')
        .eq('user_id', driverId)
        .single();

      driver = fallback.data;
      error = fallback.error;
    }

    if (error || !driver?.onesignal_player_id) {
      return { success: false, error: 'NO_DRIVER_PLAYER' };
    }

    return await sendOneSignalNotification({
      playerIds: [driver.onesignal_player_id],
      headings: notificationData.title || 'YATOU',
      contents: notificationData.body || 'Notification YATOU',
      data: notificationData,
    });
  }

  async sendNotificationToClientById(clientId, notificationData) {
    const { data: user, error } = await supabase
      .from('users')
      .select('onesignal_player_id')
      .eq('id', clientId)
      .single();

    if (error || !user?.onesignal_player_id) {
      return { success: false, error: 'NO_CLIENT_PLAYER' };
    }

    return await sendOneSignalNotification({
      playerIds: [user.onesignal_player_id],
      headings: notificationData.title || 'YATOU',
      contents: notificationData.body || 'Notification YATOU',
      data: notificationData,
    });
  }

  async saveUserPlayerId(userId, playerId, userType = 'client') {
    try {
      const updates = {
        onesignal_player_id: playerId,
        updated_at: new Date().toISOString(),
      };

      if (userType === 'driver') {
        const { error } = await supabase
          .from('drivers')
          .update(updates)
          .eq('user_id', userId);

        if (error) {
          console.error('❌ Erreur sauvegarde player ID driver:', error);
          return { success: false, error: error.message };
        }
      } else {
        const { error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);

        if (error) {
          console.error('❌ Erreur sauvegarde player ID utilisateur:', error);
          return { success: false, error: error.message };
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erreur sauvegarde player ID:', error);
      return { success: false, error: error.message };
    }
  }

  async testNotification(userId, userType = 'client') {
    if (userType === 'driver') {
      return await this.sendTestNotificationToDriver(userId);
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('onesignal_player_id')
      .eq('id', userId)
      .single();

    if (error || !user?.onesignal_player_id) {
      return { success: false, error: 'NO_CLIENT_PLAYER' };
    }

    return await sendOneSignalNotification({
      playerIds: [user.onesignal_player_id],
      headings: '🧪 Test YATOU',
      contents: 'Ceci est une notification de test.',
      data: {
        type: 'test',
        timestamp: Date.now(),
      },
    });
  }

  getServiceStatus() {
    return {
      onesignal: {
        configured: !!ONE_SIGNAL_APP_ID && !!ONE_SIGNAL_REST_API_KEY,
        appId: ONE_SIGNAL_APP_ID,
      },
    };
  }
}

module.exports = {
  notificationService: new NotificationService(),
};
