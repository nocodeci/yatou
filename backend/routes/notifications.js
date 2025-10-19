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
 * POST /api/notifications/register-token
 * Enregistrer un token FCM pour un utilisateur
 */
router.post('/register-token', authenticateToken, async (req, res) => {
  try {
    const { fcmToken, userType = 'client' } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM requis',
      });
    }

    // Valider le format du token FCM (s'assurer que c'est une chaîne non vide)
    if (typeof fcmToken !== 'string' || fcmToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Format de token invalide',
      });
    }

    const normalizedToken = fcmToken.trim();

    const result = await notificationService.saveUserFCMToken(
      userId,
      normalizedToken,
      userType,
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la sauvegarde du token',
      });
    }

    res.json({
      success: true,
      message: 'Token FCM enregistré avec succès',
      data: {
        userId,
        userType,
        tokenRegistered: true,
      },
    });
  } catch (error) {
    console.error('Erreur enregistrement token FCM:', error);
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

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi des notifications",
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Notifications envoyées aux livreurs',
        data: {
          driversNotified: result.driversNotified,
          successfulNotifications: result.successfulNotifications,
          results: result.results,
        },
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

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: "Erreur lors de l'envoi de la notification",
          error: result.error,
        });
      }

      res.json({
        success: true,
        message: 'Notification de statut envoyée',
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

    const result = await notificationService.saveUserFCMToken(
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
