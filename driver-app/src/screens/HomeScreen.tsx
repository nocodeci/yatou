import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '../constants/colors';
import { Location as LocationType, DeliveryOrder } from '../types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour cette application.'
        );
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const newLocation: LocationType = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setCurrentLocation(newLocation);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newLocation, 1000);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      Alert.alert('En ligne', 'Vous êtes maintenant disponible pour les livraisons !');
    } else {
      Alert.alert('Hors ligne', 'Vous n\'êtes plus disponible pour les livraisons.');
    }
  };

  const handleNewOrder = () => {
    // Simulation d'une nouvelle commande
    const mockOrder: DeliveryOrder = {
      id: '1',
      customerName: 'Jean Dupont',
      customerPhone: '+225 0123456789',
      pickupAddress: '123 Rue de la Paix, Abidjan',
      deliveryAddress: '456 Avenue des Cocotiers, Abidjan',
      pickupLocation: {
        latitude: 5.3600,
        longitude: -4.0083,
      },
      deliveryLocation: {
        latitude: 5.3700,
        longitude: -4.0183,
      },
      packageDetails: 'Colis fragile - Électronique',
      packageWeight: 2.5,
      estimatedPrice: 2500,
      status: 'pending',
      createdAt: new Date(),
    };
    
    setCurrentOrder(mockOrder);
    Alert.alert(
      'Nouvelle commande !',
      `Livraison pour ${mockOrder.customerName}\nPrix: ${mockOrder.estimatedPrice} FCFA`,
      [
        { text: 'Refuser', style: 'cancel' },
        { text: 'Accepter', onPress: () => acceptOrder(mockOrder) },
      ]
    );
  };

  const acceptOrder = (order: DeliveryOrder) => {
    setCurrentOrder(order);
    Alert.alert('Commande acceptée !', 'Rendez-vous au point de collecte.');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />
      
      {/* Header avec statut en ligne */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? AppColors.success : AppColors.danger }]} />
          </View>
          
          <TouchableOpacity
            style={[styles.onlineButton, { backgroundColor: isOnline ? AppColors.danger : AppColors.success }]}
            onPress={toggleOnlineStatus}
          >
            <Text style={styles.onlineButtonText}>
              {isOnline ? 'Se déconnecter' : 'Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Carte principale */}
      {currentLocation && (
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={currentLocation}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          showsScale={true}
        >
          {/* Marqueur du livreur */}
          <Marker
            coordinate={currentLocation}
            title="Votre position"
            description="Livreur YATOU"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="bicycle" size={20} color={AppColors.white} />
            </View>
          </Marker>

          {/* Marqueurs de commande si disponible */}
          {currentOrder && (
            <>
              <Marker
                coordinate={currentOrder.pickupLocation}
                title="Point de collecte"
                description={currentOrder.pickupAddress}
                pinColor={AppColors.pickupMarker}
              />
              <Marker
                coordinate={currentOrder.deliveryLocation}
                title="Point de livraison"
                description={currentOrder.deliveryAddress}
                pinColor={AppColors.deliveryMarker}
              />
            </>
          )}
        </MapView>
      )}

      {/* Panneau d'informations */}
      <View style={styles.infoPanel}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>Statut actuel</Text>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Ionicons name="refresh" size={20} color={AppColors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoContent}>
          <View style={styles.infoRow}>
            <Ionicons name="location" size={16} color={AppColors.textSecondary} />
            <Text style={styles.infoText}>
              {currentLocation ? 'Position actuelle' : 'Localisation en cours...'}
            </Text>
          </View>
          
          {currentOrder && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Commande en cours</Text>
              <Text style={styles.orderDetails}>
                {currentOrder.customerName} • {currentOrder.packageDetails}
              </Text>
              <Text style={styles.orderPrice}>
                {currentOrder.estimatedPrice} FCFA
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Bouton flottant pour nouvelle commande */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleNewOrder}
        disabled={!isOnline}
      >
        <Ionicons name="add" size={24} color={AppColors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  onlineButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: AppColors.driverMarker,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  infoPanel: {
    backgroundColor: AppColors.white,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  infoContent: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  orderInfo: {
    backgroundColor: AppColors.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  orderDetails: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: AppColors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
