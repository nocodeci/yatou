const express = require('express');
const { notificationService } = require('../services/notificationService');
const { authenticateToken } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Limite de taux pour les notifications
const notificationLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Maximum 10 notifications par minute
  message: {
    success: false,
    message: 'Trop de notifications envoyées. Réessayez dans une minute.',
  },
});

/**
 * POST /api/notifications/register-player
 * Enregistrer un identifiant OneSignal pour un utilisateur
 */
router.post('/register-player', authenticateToken, async (req, res) => {
  try {
    const { playerId, userType = 'client' } = req.body;
    const userId = req.user.id;

    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'playerId requis',
      });
    }

    const normalizedPlayerId = playerId.trim();

    const result = await notificationService.saveUserPlayerId(
      userId,
      normalizedPlayerId,
      userType,
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de l'enregistrement du playerId",
      });
    }

    res.json({
      success: true,
      message: 'Player OneSignal enregistré avec succès',
      data: {
        userId,
        userType,
        playerRegistered: true,
      },
    });
  } catch (error) {
    console.error('Erreur enregistrement player OneSignal:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

/**
 * POST /api/notifications/send-order
 * Envoyer notification de nouvelle commande aux livreurs
 * (Usage interne - appelé lors de la création d'une commande)
 */
router.post(
  '/send-order',
  authenticateToken,
  notificationLimit,
  async (req, res) => {
    try {
      const { orderData } = req.body;

      if (!orderData || !orderData.id) {
        return res.status(400).json({
          success: false,
          message: 'Données de commande requises',
        });
      }

      const result =
        await notificationService.sendOrderNotificationToDrivers(orderData);

      res.json({
        success: result.success,
        message: result.success
          ? 'Notifications envoyées aux livreurs'
          : "Erreur lors de l'envoi des notifications",
        data: result,
      });
    } catch (error) {
      console.error('Erreur envoi notification commande:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  },
);

/**
 * POST /api/notifications/send-status-update
 * Envoyer notification de changement de statut au client
 * (Usage interne - appelé lors de la mise à jour d'une commande)
 */
router.post(
  '/send-status-update',
  authenticateToken,
  notificationLimit,
  async (req, res) => {
    try {
      const { userId, orderData, newStatus } = req.body;

      if (!userId || !orderData || !newStatus) {
        return res.status(400).json({
          success: false,
          message: 'userId, orderData et newStatus sont requis',
        });
      }

      const result = await notificationService.sendStatusUpdateToClient(
        userId,
        orderData,
        newStatus,
      );

      res.json({
        success: result.success,
        message: result.success
          ? 'Notification de statut envoyée'
          : "Erreur lors de l'envoi de la notification",
        data: result,
      });
    } catch (error) {
      console.error('Erreur envoi notification statut:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur interne du serveur',
      });
    }
  },
);

/**
 * POST /api/notifications/send-driver
 * Envoyer une notification ciblée à un livreur connecté
 */
router.post('/send-driver', authenticateToken, async (req, res) => {
  try {
    const { notificationData } = req.body;

    if (!notificationData) {
      return res.status(400).json({
        success: false,
        message: 'notificationData requis',
      });
    }

    const result =
      await notificationService.sendNotificationToSpecificDriver(
        notificationData,
      );

    res.json({
      success: result.success,
      message: result.success
        ? 'Notification envoyée au livreur'
        : "Erreur lors de l'envoi de la notification",
      data: result,
    });
  } catch (error) {
    console.error('Erreur envoi notification driver:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

/**
 * POST /api/notifications/send-client
 * Envoyer une notification ciblée à un client
 */
router.post('/send-client', authenticateToken, async (req, res) => {
  try {
    const { clientId, notificationData } = req.body;

    if (!clientId || !notificationData) {
      return res.status(400).json({
        success: false,
        message: 'clientId et notificationData sont requis',
      });
    }

    const result = await notificationService.sendNotificationToClientById(
      clientId,
      notificationData,
    );

    res.json({
      success: result.success,
      message: result.success
        ? 'Notification envoyée au client'
        : "Erreur lors de l'envoi de la notification",
      data: result,
    });
  } catch (error) {
    console.error('Erreur envoi notification client:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

/**
 * POST /api/notifications/test
 * Tester l'envoi de notifications (développement uniquement)
 */
router.post('/test', authenticateToken, async (req, res) => {
  try {
    // Vérifier que nous sommes en développement
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test de notifications disponible uniquement en développement',
      });
    }

    const { userType = 'client' } = req.body;
    const userId = req.user.id;

    const result = await notificationService.testNotification(userId, userType);

    res.json({
      success: true,
      message: 'Notification de test envoyée',
      data: result,
    });
  } catch (error) {
    console.error('Erreur test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

/**
 * GET /api/notifications/status
 * Obtenir le statut du service de notifications
 */
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const status = notificationService.getServiceStatus();

    res.json({
      success: true,
      message: 'Statut du service de notifications',
      data: status,
    });
  } catch (error) {
    console.error('Erreur récupération statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

/**
 * DELETE /api/notifications/token
 * Supprimer le token FCM d'un utilisateur
 */
router.delete('/token', authenticateToken, async (req, res) => {
  try {
    const { userType = 'client' } = req.body;
    const userId = req.user.id;

    const result = await notificationService.saveUserPlayerId(
      userId,
      null,
      userType,
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression du token',
      });
    }

    res.json({
      success: true,
      message: 'Token FCM supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur suppression token:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur',
    });
  }
});

module.exports = router;
