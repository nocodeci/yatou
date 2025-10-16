import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';
import { driverService } from '@/app/services/api';
import { driverRequestService, OrderRequest } from '@/app/services/driverRequestService';

interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
  location: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
}

interface DriverSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onDriverAccepted: (driver: Driver) => void;
  userLocation: [number, number] | null;
  vehicleType: string;
  estimatedPrice: number;
  pickupAddress: string;
  deliveryAddress: string;
}

export default function DriverSearchModal({
  visible,
  onClose,
  onDriverAccepted,
  userLocation,
  vehicleType,
  estimatedPrice,
  pickupAddress,
  deliveryAddress,
}: DriverSearchModalProps) {
  const [searchStatus, setSearchStatus] = useState<'searching' | 'requesting' | 'accepted' | 'timeout'>('searching');
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [searchProgress, setSearchProgress] = useState(0);
  const [timeoutCountdown, setTimeoutCountdown] = useState(30);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [currentDriverIndex, setCurrentDriverIndex] = useState(0);
  const [currentOrderRequest, setCurrentOrderRequest] = useState<OrderRequest | null>(null);

  useEffect(() => {
    if (visible) {
      startDriverSearch();
    } else {
      resetSearch();
    }
  }, [visible]);

  useEffect(() => {
    if (searchStatus === 'requesting' && timeoutCountdown > 0) {
      const timer = setTimeout(() => {
        setTimeoutCountdown(timeoutCountdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (searchStatus === 'requesting' && timeoutCountdown === 0) {
      handleDriverTimeout();
    }
  }, [searchStatus, timeoutCountdown]);

  const startDriverSearch = async () => {
    if (!userLocation) return;

    setSearchStatus('searching');
    setSearchProgress(0);
    setCurrentDriverIndex(0);

    try {
      // Simuler la recherche avec une barre de progression
      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            loadAvailableDrivers();
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Charger les livreurs disponibles
      const drivers = await driverService.getAvailableDriversInArea(
        userLocation[1], // latitude
        userLocation[0], // longitude
        15 // rayon de 15km
      );

      // Filtrer par type de véhicule
      const filteredDrivers = drivers.filter(driver => 
        driver.vehicleType === vehicleType
      );

      setAvailableDrivers(filteredDrivers);
      clearInterval(progressInterval);
      setSearchProgress(100);

      if (filteredDrivers.length === 0) {
        setSearchStatus('timeout');
        Alert.alert(
          'Aucun livreur disponible',
          'Aucun livreur de type ' + vehicleType + ' n\'est disponible dans votre zone. Veuillez réessayer plus tard.',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        // Créer la demande de commande
        const orderRequest = driverRequestService.createOrderRequest(
          'client_id', // À remplacer par l'ID du client connecté
          'Client', // À remplacer par le nom du client
          pickupAddress,
          deliveryAddress,
          estimatedPrice,
          vehicleType,
          userLocation,
          userLocation, // Pour l'instant, même position
          30 // 30 secondes de timeout
        );
        
        setCurrentOrderRequest(orderRequest);
        
        // Commencer à demander aux livreurs
        requestDriver(filteredDrivers[0], 0, orderRequest);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de livreurs:', error);
      setSearchStatus('timeout');
      Alert.alert('Erreur', 'Impossible de rechercher des livreurs disponibles');
    }
  };

  const requestDriver = async (driver: Driver, index: number, orderRequest: OrderRequest) => {
    setCurrentDriver(driver);
    setCurrentDriverIndex(index);
    setSearchStatus('requesting');
    setTimeoutCountdown(30); // 30 secondes pour répondre

    // Envoyer la vraie demande au livreur avec notification push
    const success = await driverRequestService.sendRequestToDriver(driver.id, orderRequest);
    
    if (!success) {
      // Si l'envoi échoue, essayer le livreur suivant
      handleDriverRejected();
    }
  };

  const handleDriverAccepted = () => {
    if (currentDriver) {
      setSearchStatus('accepted');
      setTimeout(() => {
        onDriverAccepted(currentDriver);
        onClose();
      }, 2000);
    }
  };

  const handleDriverRejected = () => {
    const nextIndex = currentDriverIndex + 1;
    
    if (nextIndex < availableDrivers.length && currentOrderRequest) {
      // Demander au livreur suivant
      requestDriver(availableDrivers[nextIndex], nextIndex, currentOrderRequest);
    } else {
      // Aucun autre livreur disponible
      setSearchStatus('timeout');
      if (currentOrderRequest) {
        driverRequestService.removeActiveRequest(currentOrderRequest.id);
      }
      Alert.alert(
        'Aucun livreur disponible',
        'Tous les livreurs disponibles ont refusé la commande. Veuillez réessayer plus tard.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const handleDriverTimeout = () => {
    handleDriverRejected();
  };

  const resetSearch = () => {
    setSearchStatus('searching');
    setCurrentDriver(null);
    setSearchProgress(0);
    setTimeoutCountdown(30);
    setAvailableDrivers([]);
    setCurrentDriverIndex(0);
    if (currentOrderRequest) {
      driverRequestService.removeActiveRequest(currentOrderRequest.id);
    }
    setCurrentOrderRequest(null);
  };

  const getStatusIcon = () => {
    switch (searchStatus) {
      case 'searching':
        return <ActivityIndicator size="large" color={AppColors.primary} />;
      case 'requesting':
        return <Clock size={32} color={AppColors.warning} />;
      case 'accepted':
        return <CheckCircle size={32} color={AppColors.success} />;
      case 'timeout':
        return <XCircle size={32} color={AppColors.error} />;
      default:
        return <ActivityIndicator size="large" color={AppColors.primary} />;
    }
  };

  const getStatusText = () => {
    switch (searchStatus) {
      case 'searching':
        return 'Recherche de livreurs...';
      case 'requesting':
        return `Demande envoyée à ${currentDriver?.name}`;
      case 'accepted':
        return `${currentDriver?.name} a accepté votre commande !`;
      case 'timeout':
        return 'Aucun livreur disponible';
      default:
        return 'Recherche en cours...';
    }
  };

  const getStatusSubtext = () => {
    switch (searchStatus) {
      case 'searching':
        return `Recherche dans un rayon de 15km... ${searchProgress}%`;
      case 'requesting':
        return `Temps restant: ${timeoutCountdown}s • ${currentDriverIndex + 1}/${availableDrivers.length} livreur(s)`;
      case 'accepted':
        return 'Votre commande est en cours de préparation';
      case 'timeout':
        return 'Veuillez réessayer plus tard';
      default:
        return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Recherche de livreur</Text>
            <Text style={styles.subtitle}>
              {vehicleType} • {estimatedPrice.toLocaleString()} FCFA
            </Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Contenu principal */}
        <View style={styles.content}>
          {/* Icône de statut */}
          <View style={styles.statusIconContainer}>
            {getStatusIcon()}
          </View>

          {/* Texte de statut */}
          <Text style={styles.statusText}>{getStatusText()}</Text>
          <Text style={styles.statusSubtext}>{getStatusSubtext()}</Text>

          {/* Informations de la commande */}
          <View style={styles.orderInfo}>
            <View style={styles.orderItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.orderItemText}>Départ: {pickupAddress}</Text>
            </View>
            <View style={styles.orderItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.orderItemText}>Arrivée: {deliveryAddress}</Text>
            </View>
          </View>

          {/* Message informatif pour les vraies notifications */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              🚨 Notifications push en temps réel
            </Text>
            <Text style={styles.infoSubtext}>
              Les livreurs recevront des alertes urgentes avec son sur leur téléphone
            </Text>
          </View>

          {/* Informations du livreur actuel */}
          {currentDriver && searchStatus === 'requesting' && (
            <View style={styles.driverInfo}>
              <Text style={styles.driverInfoTitle}>Livreur contacté:</Text>
              <Text style={styles.driverName}>{currentDriver.name}</Text>
              <Text style={styles.driverDetails}>
                {currentDriver.vehicleModel} • {currentDriver.vehiclePlate}
              </Text>
              <Text style={styles.driverRating}>
                ⭐ {currentDriver.rating.toFixed(1)} • {currentDriver.totalDeliveries} livraisons
              </Text>
            </View>
          )}

          {/* Barre de progression pour la recherche */}
          {searchStatus === 'searching' && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${searchProgress}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{searchProgress}%</Text>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  statusIconContainer: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  orderInfo: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderItemText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  driverInfo: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  driverInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369A1',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  driverDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  driverRating: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: AppColors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.primary,
  },
  infoBox: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0EA5E9',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0C4A6E',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
  },
});
