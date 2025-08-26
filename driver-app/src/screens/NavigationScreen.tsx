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
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '../constants/colors';
import { Location as LocationType, DeliveryOrder, RouteInfo } from '../types';

const { width, height } = Dimensions.get('window');

export default function NavigationScreen() {
  const [currentLocation, setCurrentLocation] = useState<LocationType | null>(null);
  const [currentOrder, setCurrentOrder] = useState<DeliveryOrder | null>(null);
  const [currentRoute, setCurrentRoute] = useState<RouteInfo | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState<'pickup' | 'delivery'>('pickup');
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    requestLocationPermission();
    // Simuler une commande active
    setCurrentOrder({
      id: '1',
      customerName: 'Jean Dupont',
      customerPhone: '+225 0123456789',
      pickupAddress: '123 Rue de la Paix, Abidjan',
      deliveryAddress: '456 Avenue des Cocotiers, Abidjan',
      pickupLocation: { latitude: 5.3600, longitude: -4.0083 },
      deliveryLocation: { latitude: 5.3700, longitude: -4.0183 },
      packageDetails: 'Colis fragile - Électronique',
      packageWeight: 2.5,
      estimatedPrice: 2500,
      status: 'picked_up',
      createdAt: new Date(),
    });
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        getCurrentLocation();
      } else {
        Alert.alert(
          'Permission refusée',
          'L\'accès à la localisation est nécessaire pour la navigation.'
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

  const startNavigation = (type: 'pickup' | 'delivery') => {
    if (!currentOrder) {
      Alert.alert('Aucune commande', 'Aucune commande active pour la navigation.');
      return;
    }

    setDestination(type);
    setIsNavigating(true);
    
    const targetLocation = type === 'pickup' 
      ? currentOrder.pickupLocation 
      : currentOrder.deliveryLocation;
    
    if (mapRef.current && currentLocation) {
      mapRef.current.animateToRegion({
        ...targetLocation,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }

    // Simuler le calcul d'itinéraire
    const mockRoute: RouteInfo = {
      distance: type === 'pickup' ? 2.5 : 3.2,
      duration: type === 'pickup' ? 8 : 12,
      polyline: '',
      steps: [
        { instruction: 'Continuez tout droit', distance: 0.5, duration: 2, maneuver: 'straight' },
        { instruction: 'Tournez à droite', distance: 1.0, duration: 3, maneuver: 'turn-right' },
        { instruction: 'Arrivée à destination', distance: 0.0, duration: 0, maneuver: 'arrive' },
      ],
    };
    
    setCurrentRoute(mockRoute);
    
    Alert.alert(
      'Navigation démarrée',
      `Direction: ${type === 'pickup' ? 'Point de collecte' : 'Point de livraison'}`
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setCurrentRoute(null);
    Alert.alert('Navigation arrêtée', 'Vous pouvez reprendre la navigation à tout moment.');
  };

  const getDestinationInfo = () => {
    if (!currentOrder) return null;
    
    return destination === 'pickup' 
      ? {
          location: currentOrder.pickupLocation,
          address: currentOrder.pickupAddress,
          title: 'Point de collecte',
          icon: 'bag',
          color: AppColors.pickupMarker,
        }
      : {
          location: currentOrder.deliveryLocation,
          address: currentOrder.deliveryAddress,
          title: 'Point de livraison',
          icon: 'navigate',
          color: AppColors.deliveryMarker,
        };
  };

  const destinationInfo = getDestinationInfo();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />
      
      {/* Header de navigation */}
      {isNavigating && currentRoute && (
        <LinearGradient
          colors={[AppColors.navigationBackground, AppColors.navigationBackground + 'CC']}
          style={styles.navigationHeader}
        >
          <View style={styles.navigationInfo}>
            <Text style={styles.navigationTitle}>
              {destinationInfo?.title}
            </Text>
            <Text style={styles.navigationAddress} numberOfLines={1}>
              {destinationInfo?.address}
            </Text>
          </View>
          
          <View style={styles.routeInfo}>
            <View style={styles.routeItem}>
              <Ionicons name="time" size={16} color={AppColors.navigationText} />
              <Text style={styles.routeText}>{currentRoute.duration} min</Text>
            </View>
            <View style={styles.routeItem}>
              <Ionicons name="location" size={16} color={AppColors.navigationText} />
              <Text style={styles.routeText}>{currentRoute.distance} km</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.stopButton} onPress={stopNavigation}>
            <Ionicons name="stop" size={20} color={AppColors.navigationText} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      {/* Carte de navigation */}
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
          followsUserLocation={isNavigating}
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

          {/* Marqueurs de commande */}
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

          {/* Itinéraire simulé */}
          {currentRoute && currentLocation && destinationInfo && (
            <Polyline
              coordinates={[currentLocation, destinationInfo.location]}
              strokeColor={AppColors.routeColor}
              strokeWidth={4}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>
      )}

      {/* Panneau de contrôle */}
      <View style={styles.controlPanel}>
        {!isNavigating ? (
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: AppColors.pickupMarker }]}
              onPress={() => startNavigation('pickup')}
            >
              <Ionicons name="bag" size={24} color={AppColors.white} />
              <Text style={styles.navButtonText}>Aller au point de collecte</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: AppColors.deliveryMarker }]}
              onPress={() => startNavigation('delivery')}
            >
              <Ionicons name="navigate" size={24} color={AppColors.white} />
              <Text style={styles.navButtonText}>Aller au point de livraison</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.navigationControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => getCurrentLocation()}
            >
              <Ionicons name="locate" size={20} color={AppColors.primary} />
              <Text style={styles.controlButtonText}>Ma position</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => {
                if (destinationInfo && mapRef.current) {
                  mapRef.current.animateToRegion({
                    ...destinationInfo.location,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  }, 1000);
                }
              }}
            >
              <Ionicons name="eye" size={20} color={AppColors.primary} />
              <Text style={styles.controlButtonText}>Voir destination</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Instructions de navigation */}
      {isNavigating && currentRoute && (
        <View style={styles.instructionsPanel}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          {currentRoute.steps.map((step, index) => (
            <View key={index} style={styles.instructionItem}>
              <Ionicons 
                name={step.maneuver === 'turn-right' ? 'arrow-forward' : 
                      step.maneuver === 'turn-left' ? 'arrow-back' : 'arrow-up'} 
                size={16} 
                color={AppColors.primary} 
              />
              <Text style={styles.instructionText}>{step.instruction}</Text>
              <Text style={styles.instructionDistance}>{step.distance} km</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  navigationHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navigationInfo: {
    flex: 1,
  },
  navigationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.navigationText,
    marginBottom: 4,
  },
  navigationAddress: {
    fontSize: 14,
    color: AppColors.navigationText + 'CC',
  },
  routeInfo: {
    flexDirection: 'row',
    gap: 16,
    marginRight: 16,
  },
  routeItem: {
    alignItems: 'center',
    gap: 4,
  },
  routeText: {
    fontSize: 12,
    color: AppColors.navigationText,
    fontWeight: '600',
  },
  stopButton: {
    padding: 8,
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
  controlPanel: {
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
  navigationButtons: {
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  navButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    alignItems: 'center',
    gap: 8,
  },
  controlButtonText: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
  },
  instructionsPanel: {
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
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: AppColors.text,
  },
  instructionDistance: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
});
