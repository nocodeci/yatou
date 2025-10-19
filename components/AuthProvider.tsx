import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useAuthStore } from '@/app/store/authStore';
import { notificationService } from '@/app/services/notificationService';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [user?.id]);

  const initializeAuth = async () => {
    try {
      setIsInitializing(true);
      console.log("🔄 Initialisation de l'authentification...");

      // Toujours enregistrer les notifications, même sans utilisateur connecté
      console.log('🔔 Configuration des notifications push...');

      try {
        // Enregistrer le token Expo pour les notifications push
        let token = null;

        const userType = user?.role === 'driver' ? 'driver' : 'client';

        if (user) {
          console.log(
            '👤 Utilisateur connecté - enregistrement avec ID utilisateur:',
            user.id,
          );
          token = await notificationService.registerForPushNotifications(
            undefined,
            userType,
          );
        } else {
          console.log("👤 Pas d'utilisateur connecté - enregistrement anonyme");
          // En mode production sans utilisateur, ne pas essayer d'enregistrer
          if (__DEV__) {
            token = await notificationService.registerForPushNotifications();
          } else {
            console.log(
              "⚠️ Mode production: Pas d'enregistrement sans utilisateur",
            );
          }
        }

        if (token) {
          console.log('✅ Token Expo généré:', token.substring(0, 50) + '...');

          // Sauvegarder le token en base de données si utilisateur connecté
          if (user && userType === 'client') {
            await saveClientToken(user.id, token);
          }

          // Test de notification locale en développement
          if (__DEV__) {
            console.log('🧪 Test de notification en mode développement...');
            // Test différé uniquement en développement
            if (__DEV__) {
              setTimeout(() => {
                notificationService.sendLocalNotification({
                  type: 'new_order',
                  orderId: 'test_dev_' + Date.now(),
                  clientName: 'Client Test Dev',
                  pickupAddress: 'Adresse de test',
                  deliveryAddress: 'Destination de test',
                  estimatedPrice: 500,
                  vehicleType: 'moto',
                });
              }, 2000);
            }
          }
        } else {
          console.log('❌ Impossible de générer le token de notification');
        }
      } catch (notifError) {
        console.error(
          '❌ Erreur lors de la configuration des notifications:',
          notifError,
        );
        // En production, ne pas afficher d'alert pour éviter de bloquer l'utilisateur
        if (__DEV__) {
          console.log(
            '⚠️ Mode développement: Configuration des notifications échouée',
          );
        } else {
          console.log(
            '⚠️ Mode production: Notifications non configurées, continuons sans elles',
          );
        }
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'initialisation de l'authentification:",
        error,
      );
      // Ne pas déconnecter l'utilisateur en cas d'erreur de notification
      // L'app doit continuer à fonctionner même sans notifications
      console.log('🔄 Application continue sans notifications push');
    } finally {
      setIsInitializing(false);
      console.log("✅ Initialisation de l'authentification terminée");
    }
  };

  const saveClientToken = async (userId: string, token: string) => {
    try {
      console.log('💾 Sauvegarde du token client pour:', userId);

      const { supabase } = await import('@/app/services/api');

      // Vérifier d'abord si l'utilisateur existe
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, expo_push_token')
        .eq('id', userId)
        .single();

      if (checkError) {
        console.error('❌ Utilisateur non trouvé:', checkError);
        return;
      }

      // Mettre à jour le token
      const { error } = await supabase
        .from('users')
        .update({
          expo_push_token: token,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error(
          '❌ Erreur lors de la sauvegarde du token client:',
          error,
        );
      } else {
        console.log('✅ Token client sauvegardé en base de données');

        // Vérification de la sauvegarde
        const { data: updatedUser } = await supabase
          .from('users')
          .select('expo_push_token')
          .eq('id', userId)
          .single();

        if (updatedUser?.expo_push_token === token) {
          console.log('✅ Vérification: Token sauvegardé correctement');
        } else {
          console.log('⚠️ Vérification: Token non sauvegardé correctement');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token client:', error);
    }
  };

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
