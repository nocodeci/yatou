import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput
} from 'react-native';
import { notificationService } from '@/app/services/notificationService';
import { AppColors } from '@/app/constants/colors';

interface NotificationTesterProps {
  visible?: boolean;
  onClose?: () => void;
}

export default function NotificationTester({ visible = false, onClose }: NotificationTesterProps) {
  const [testOrderId, setTestOrderId] = useState('test_order_' + Date.now());
  const [testDriverId, setTestDriverId] = useState('test_driver_123');
  const [testClientId, setTestClientId] = useState('test_client_456');
  const [isLoading, setIsLoading] = useState(false);

  if (!visible || !__DEV__) return null;

  const handleTestLocalNotification = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Test notification locale...');

      await notificationService.sendLocalNotification({
        type: 'new_order',
        orderId: testOrderId,
        clientName: 'Client Test',
        pickupAddress: 'Collège Privé Tesla, Bouaké, Côte d\'Ivoire',
        deliveryAddress: 'SOCOCE, A8, Bouaké, Côte d\'Ivoire',
        estimatedPrice: 1500,
        vehicleType: 'moto',
      });

      Alert.alert('✅ Succès', 'Notification locale envoyée !');
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      Alert.alert('❌ Erreur', 'Échec du test de notification');
    }
    setIsLoading(false);
  };

  const handleTestOrderAccepted = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Test notification commande acceptée...');

      await notificationService.sendLocalNotification({
        type: 'order_accepted',
        orderId: testOrderId,
        driverId: testDriverId,
      });

      Alert.alert('✅ Succès', 'Notification d\'acceptation envoyée !');
    } catch (error) {
      console.error('❌ Erreur test notification:', error);
      Alert.alert('❌ Erreur', 'Échec du test de notification');
    }
    setIsLoading(false);
  };

  const handleTestPermissions = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Test des permissions...');

      const token = await notificationService.registerForPushNotifications();

      if (token) {
        Alert.alert(
          '✅ Permissions OK',
          `Token généré :\n${token.substring(0, 50)}...`
        );
      } else {
        Alert.alert('❌ Permissions', 'Permissions refusées ou erreur');
      }
    } catch (error) {
      console.error('❌ Erreur test permissions:', error);
      Alert.alert('❌ Erreur', 'Échec du test des permissions');
    }
    setIsLoading(false);
  };

  const handleTestTokenValidation = () => {
    const currentToken = notificationService.getExpoPushToken();

    if (currentToken) {
      Alert.alert(
        'Token actuel',
        `${currentToken.substring(0, 50)}...\n\nFormat: ${
          currentToken.startsWith('ExponentPushToken[') ? 'Valide' : 'Invalide'
        }`
      );
    } else {
      Alert.alert('Aucun token', 'Aucun token Expo Push trouvé');
    }
  };

  const handleClearNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
      await notificationService.clearBadge();
      Alert.alert('✅ Succès', 'Notifications supprimées');
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de supprimer les notifications');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <ScrollView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>🧪 Test des Notifications</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Order ID:</Text>
              <TextInput
                style={styles.input}
                value={testOrderId}
                onChangeText={setTestOrderId}
                placeholder="test_order_123"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Driver ID:</Text>
              <TextInput
                style={styles.input}
                value={testDriverId}
                onChangeText={setTestDriverId}
                placeholder="test_driver_123"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Client ID:</Text>
              <TextInput
                style={styles.input}
                value={testClientId}
                onChangeText={setTestClientId}
                placeholder="test_client_123"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tests de Base</Text>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestPermissions}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                🔐 Tester Permissions & Token
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestTokenValidation}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                🔍 Vérifier Token Actuel
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tests de Notifications</Text>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestLocalNotification}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                📱 Nouvelle Commande (Local)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testButton}
              onPress={handleTestOrderAccepted}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                ✅ Commande Acceptée (Local)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Utilitaires</Text>

            <TouchableOpacity
              style={[styles.testButton, styles.utilityButton]}
              onPress={handleClearNotifications}
              disabled={isLoading}
            >
              <Text style={styles.testButtonText}>
                🗑️ Supprimer Toutes les Notifications
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.info}>
            <Text style={styles.infoText}>
              ℹ️ Ce composant n'est visible qu'en mode développement.
              Utilisez-le pour tester la configuration des notifications push.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  content: {
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  testButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  utilityButton: {
    backgroundColor: '#6B7280',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    padding: 20,
    backgroundColor: '#F0F9FF',
    margin: 20,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
});
