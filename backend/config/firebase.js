const admin = require('firebase-admin');

// Configuration Firebase Admin SDK
let firebaseApp;

const initializeFirebase = () => {
  try {
    // Vérifier si Firebase est déjà initialisé
    if (firebaseApp) {
      return firebaseApp;
    }

    // Configuration avec la clé de service
    const serviceAccount = {
      "type": "service_account",
      "project_id": process.env.FIREBASE_PROJECT_ID || "yatou-91baa",
      "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
      "private_key": process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
      "client_email": process.env.FIREBASE_CLIENT_EMAIL,
      "client_id": process.env.FIREBASE_CLIENT_ID,
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": process.env.FIREBASE_CLIENT_CERT_URL
    };

    // Vérifier que toutes les variables d'environnement sont présentes
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_PRIVATE_KEY_ID',
      'FIREBASE_PRIVATE_KEY',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_CLIENT_ID',
      'FIREBASE_CLIENT_CERT_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.warn('⚠️ Variables Firebase manquantes:', missingVars.join(', '));
      console.warn('⚠️ Firebase FCM désactivé - utilisez les tokens Expo Push en fallback');
      return null;
    }

    // Initialiser Firebase Admin
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });

    console.log('✅ Firebase Admin SDK initialisé avec succès');
    console.log(`🎯 Projet: ${serviceAccount.project_id}`);

    return firebaseApp;

  } catch (error) {
    console.error('❌ Erreur initialisation Firebase:', error.message);
    console.warn('⚠️ Firebase FCM désactivé - utilisez les tokens Expo Push en fallback');
    return null;
  }
};

// Service de notifications FCM
class FCMService {
  constructor() {
    this.admin = initializeFirebase();
    this.isEnabled = !!this.admin;
  }

  /**
   * Envoyer une notification FCM à un token spécifique
   */
  async sendToToken(token, title, body, data = {}) {
    if (!this.isEnabled) {
      throw new Error('Firebase FCM n\'est pas configuré');
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        token,
        android: {
          notification: {
            icon: 'notification_icon',
            color: '#DC2626',
            sound: 'default',
            channelId: 'urgent_orders',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.admin.messaging().send(message);
      console.log('✅ Notification FCM envoyée:', response);

      return {
        success: true,
        messageId: response,
        token: token
      };

    } catch (error) {
      console.error('❌ Erreur envoi FCM:', error);

      // Gérer les tokens invalides
      if (error.code === 'messaging/registration-token-not-registered' ||
          error.code === 'messaging/invalid-registration-token') {
        console.warn('⚠️ Token FCM invalide:', token);
        return {
          success: false,
          error: 'INVALID_TOKEN',
          token: token
        };
      }

      throw error;
    }
  }

  /**
   * Envoyer une notification à plusieurs tokens
   */
  async sendToMultipleTokens(tokens, title, body, data = {}) {
    if (!this.isEnabled) {
      throw new Error('Firebase FCM n\'est pas configuré');
    }

    if (!tokens || tokens.length === 0) {
      return { success: false, error: 'Aucun token fourni' };
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          timestamp: Date.now().toString()
        },
        tokens,
        android: {
          notification: {
            icon: 'notification_icon',
            color: '#DC2626',
            sound: 'default',
            channelId: 'urgent_orders',
            priority: 'high',
          },
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await this.admin.messaging().sendMulticast(message);

      console.log('✅ Notifications FCM envoyées:', {
        successCount: response.successCount,
        failureCount: response.failureCount
      });

      // Analyser les échecs
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: tokens[idx],
            error: resp.error?.code
          });
        }
      });

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };

    } catch (error) {
      console.error('❌ Erreur envoi FCM multiple:', error);
      throw error;
    }
  }

  /**
   * Vérifier si Firebase FCM est activé
   */
  isFirebaseEnabled() {
    return this.isEnabled;
  }

  /**
   * Obtenir les statistiques du service
   */
  getServiceInfo() {
    return {
      enabled: this.isEnabled,
      projectId: this.isEnabled ? this.admin.options.projectId : null,
      status: this.isEnabled ? 'active' : 'disabled'
    };
  }
}

// Instance singleton
const fcmService = new FCMService();

module.exports = {
  fcmService,
  initializeFirebase,
  admin: firebaseApp
};
