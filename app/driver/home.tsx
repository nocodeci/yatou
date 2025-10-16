import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { 
  MapPin, 
  Clock, 
  Package, 
  DollarSign, 
  User, 
  LogOut,
  Bell,
  Settings
} from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';
import YatouLogo from '@/components/YatouLogo';
import { useAuthStore } from '@/app/store/authStore';
import { driverService, deliveryService } from '@/app/services/api';
import { locationService } from '@/app/services/locationService';
import { notificationService } from '@/app/services/notificationService';
import { driverRequestService } from '@/app/services/driverRequestService';
import LocationStatus from '@/components/LocationStatus';

const { width } = Dimensions.get('window');

export default function DriverHomeScreen() {
  const { user, logout } = useAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [driverProfile, setDriverProfile] = useState(null);
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [hasNewOrderNotification, setHasNewOrderNotification] = useState(false);
  const [driverStats, setDriverStats] = useState({
    todayEarnings: 0,
    todayDeliveries: 0,
    rating: 0,
    totalDeliveries: 0,
  });

  // Charger les données du livreur
  useEffect(() => {
    loadDriverData();
  }, []);

  // Configurer les notifications quand le profil est chargé
  useEffect(() => {
    if (driverProfile) {
      setupNotifications();
    }
  }, [driverProfile]);

  // Configurer les notifications
  const setupNotifications = async () => {
    try {
      // Enregistrer le device pour les notifications push
      const token = await notificationService.registerForPushNotifications(driverProfile?.id);
      if (token) {
        console.log('Token de notification enregistré:', token);
        console.log('✅ Le token sera automatiquement sauvegardé en base de données');
      }

      // Écouter les notifications reçues
      const notificationListener = notificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification reçue:', notification);
          setHasNewOrderNotification(true);
          
          // Afficher une alerte pour les nouvelles commandes
          if (notification.request.content.data?.type === 'new_order') {
            Alert.alert(
              '🚨 NOUVELLE COMMANDE !',
              notification.request.content.body,
              [
                {
                  text: 'Refuser',
                  style: 'cancel',
                  onPress: () => handleOrderResponse(false, notification.request.content.data?.orderId),
                },
                {
                  text: 'Accepter',
                  style: 'default',
                  onPress: () => handleOrderResponse(true, notification.request.content.data?.orderId),
                },
              ],
              { cancelable: false }
            );
          }
        }
      );

      return () => {
        notificationListener.remove();
      };
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  // Gérer la réponse du livreur à une commande
  const handleOrderResponse = async (accepted: boolean, orderId?: string) => {
    if (!orderId) return;

    try {
      // Envoyer la réponse au système
      const success = await driverRequestService.handleDriverResponse({
        driverId: driverProfile?.id || '',
        orderId: orderId,
        accepted: accepted,
        timestamp: new Date(),
      });

      if (success && accepted) {
        Alert.alert(
          'Commande acceptée !',
          'Vous avez accepté la commande. Rendez-vous à l\'adresse de départ.',
          [{ text: 'OK' }]
        );
        // Rediriger vers l'écran de suivi de commande
        router.push('/driver/orders');
      } else if (!accepted) {
        Alert.alert('Commande refusée', 'Vous avez refusé cette commande.');
      }
    } catch (error) {
      console.error('Erreur lors de la réponse à la commande:', error);
      Alert.alert('Erreur', 'Impossible de traiter votre réponse.');
    }
  };

  // Gérer le suivi de position
  useEffect(() => {
    if (isOnline && driverProfile) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [isOnline, driverProfile]);

  // Mettre à jour la position actuelle périodiquement
  useEffect(() => {
    if (!isOnline || !isLocationTracking) return;

    const interval = setInterval(async () => {
      const location = locationService.getLastKnownLocation();
      if (location) {
        setCurrentLocation(location);
      }
    }, 3000); // Mise à jour toutes les 3 secondes

    return () => clearInterval(interval);
  }, [isOnline, isLocationTracking]);

  const loadDriverData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Charger le profil du livreur
      const profile = await driverService.getDriverProfile(user.id);
      if (profile) {
        setDriverProfile(profile);
        setIsOnline(profile.isAvailable);
        setDriverStats({
          todayEarnings: 0, // À calculer depuis les livraisons du jour
          todayDeliveries: 0, // À calculer depuis les livraisons du jour
          rating: profile.rating,
          totalDeliveries: profile.totalDeliveries,
        });
      } else {
        // Si pas de profil livreur, créer un profil par défaut
        console.log('Aucun profil livreur trouvé, création d\'un profil par défaut');
        setDriverStats({
          todayEarnings: 0,
          todayDeliveries: 0,
          rating: 0,
          totalDeliveries: 0,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du livreur:', error);
      Alert.alert('Erreur', 'Impossible de charger les données du livreur');
    } finally {
      setIsLoading(false);
    }
  };

  const startLocationTracking = async () => {
    if (!driverProfile) return;

    try {
      const success = await locationService.startLocationTracking(
        driverProfile.id,
        user.id
      );
      
      if (success) {
        setIsLocationTracking(true);
        console.log('✅ Suivi de position démarré');
        
        // Obtenir la position actuelle
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
        }
      } else {
        Alert.alert(
          'Géolocalisation',
          'Impossible de démarrer le suivi de position. Vérifiez les permissions.'
        );
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du suivi:', error);
    }
  };

  const stopLocationTracking = () => {
    locationService.stopLocationTracking();
    setIsLocationTracking(false);
    console.log('📍 Suivi de position arrêté');
  };

  const handleToggleOnline = async () => {
    if (!user || !driverProfile) return;

    try {
      const newStatus = !isOnline;
      await driverService.updateDriverAvailability(driverProfile.id, newStatus);
      setIsOnline(newStatus);

      Alert.alert(
        newStatus ? 'En ligne' : 'Hors ligne',
        newStatus
          ? 'Vous êtes maintenant en ligne et recevrez des commandes'
          : 'Vous êtes maintenant hors ligne'
      );
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      Alert.alert('Erreur', 'Impossible de changer votre statut');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
        <Text style={styles.loadingText}>Chargement de vos données...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <YatouLogo size={40} />
            <Text style={styles.headerTitle}>YATOU Driver</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={24} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
              <LogOut size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Statut en ligne */}
        <View style={styles.statusContainer}>
          <View style={styles.statusInfo}>
            <Text style={styles.driverName}>{user?.firstName || 'Livreur'}</Text>
            <Text style={styles.driverVehicle}>
              {driverProfile?.vehicleInfo?.type || 'Véhicule'} • {driverProfile?.vehicleInfo?.plate || 'N/A'}
            </Text>
            <LocationStatus 
              isOnline={isOnline}
              onLocationPress={() => {
                if (currentLocation) {
                  Alert.alert(
                    'Position GPS',
                    `Latitude: ${currentLocation.latitude.toFixed(6)}\nLongitude: ${currentLocation.longitude.toFixed(6)}\nPrécision: ${currentLocation.accuracy ? Math.round(currentLocation.accuracy) + 'm' : 'N/A'}`
                  );
                }
              }}
            />
          </View>
          <TouchableOpacity
            style={[styles.onlineButton, isOnline && styles.onlineButtonActive]}
            onPress={handleToggleOnline}
          >
            <View style={[styles.statusDot, isOnline && styles.statusDotActive]} />
            <Text style={[styles.statusText, isOnline && styles.statusTextActive]}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistiques du jour */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={24} color={AppColors.primary} />
              <Text style={styles.statValue}>{driverStats.todayEarnings} FCFA</Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>
            <View style={styles.statCard}>
              <Package size={24} color={AppColors.primary} />
              <Text style={styles.statValue}>{driverStats.todayDeliveries}</Text>
              <Text style={styles.statLabel}>Livraisons</Text>
            </View>
            <View style={styles.statCard}>
              <User size={24} color={AppColors.primary} />
              <Text style={styles.statValue}>{driverStats.rating}</Text>
              <Text style={styles.statLabel}>Note</Text>
            </View>
            <View style={styles.statCard}>
              <Clock size={24} color={AppColors.primary} />
              <Text style={styles.statValue}>{driverStats.totalDeliveries}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/driver/orders')}
            >
              <Package size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Commandes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/driver/earnings')}
            >
              <DollarSign size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Gains</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/driver/profile')}
            >
              <User size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Profil</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/driver/map')}
            >
              <MapPin size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Carte</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Commandes en attente */}
        <View style={styles.ordersContainer}>
          <Text style={styles.sectionTitle}>Commandes disponibles</Text>
          <View style={styles.noOrdersCard}>
            <Package size={48} color="#D1D5DB" />
            <Text style={styles.noOrdersTitle}>Aucune commande</Text>
            <Text style={styles.noOrdersText}>
              {isOnline 
                ? 'Restez en ligne pour recevoir des commandes'
                : 'Activez votre statut pour recevoir des commandes'
              }
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
  },
  driverVehicle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  locationStatus: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '500',
  },
  onlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  onlineButtonActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#16A34A',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9CA3AF',
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusTextActive: {
    color: '#16A34A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  statsContainer: {
    marginTop: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 8,
  },
  ordersContainer: {
    marginBottom: 24,
  },
  noOrdersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noOrdersTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 16,
  },
  noOrdersText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.textSecondary,
  },
});
