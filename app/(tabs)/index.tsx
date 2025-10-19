'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { Plus, MapPin, Clock, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { AppColors } from '@/app/constants/colors';
import YatouLogo from '@/components/YatouLogo';
import GoogleMapViewComponent from '@/components/MapViewSimple';
import DeliveryBottomSheet from '@/components/DeliveryBottomSheet';
import ErrandBottomSheet from '@/components/ErrandBottomSheet';
import MovingBottomSheet from '@/components/MovingBottomSheet';
// import YatouPricingSystem from "@/components/YatouPricingSystem" // Plus utilisé
import YatouVehicleSelector from '@/components/YatouVehicleSelector';
import DriverMarkers from '@/components/DriverMarkers';
import DriverSearchModal from '@/components/DriverSearchModal';
import { notificationService } from '@/app/services/notificationService';
import { useDeliveryStore } from '@/app/store/delivery-store';
import { useAuthStore } from '@/app/store/authStore';

export default function ImprovedHomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuthStore();
  const { loadData } = useDeliveryStore();

  // On destructure les paramètres pour obtenir des valeurs stables (primitives)
  const {
    originName,
    destinationName,
    originCoords: originCoordsStr, // Renommer pour éviter la confusion
    destinationCoords: destinationCoordsStr,
  } = params;

  const { height } = Dimensions.get('window');
  const [selectedDestination, setSelectedDestination] = useState<
    [number, number] | null
  >(null);
  const [selectedOrigin, setSelectedOrigin] = useState<[number, number] | null>(
    null,
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      name: string;
      address: string;
      coordinates: [number, number];
    }>
  >([]);
  const [selectedDestinationName, setSelectedDestinationName] =
    useState<string>('');
  const [selectedOriginName, setSelectedOriginName] = useState<string>('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [selectedServiceType, setSelectedServiceType] = useState<
    'standard' | 'express'
  >('standard');
  const [showDeliveryBottomSheet, setShowDeliveryBottomSheet] = useState(false);
  const [showErrandBottomSheet, setShowErrandBottomSheet] = useState(false);
  const [showMovingBottomSheet, setShowMovingBottomSheet] = useState(false);
  // const [showPricingSystem, setShowPricingSystem] = useState(false) // Plus utilisé
  const [selectedVehicle, setSelectedVehicle] = useState<
    'moto' | 'fourgon' | 'camion' | null
  >(null);
  const [showDriverSearch, setShowDriverSearch] = useState(false);
  const [selectedVehiclePricing, setSelectedVehiclePricing] =
    useState<any>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Position utilisateur à Bouaké
    setUserLocation([-5.0333, 7.6833]);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Écouter les notifications côté client
  useEffect(() => {
    if (!user) return;

    console.log('🔔 Configuration des notifications côté client...');

    // Écouter les notifications reçues
    const notificationListener =
      notificationService.addNotificationReceivedListener((notification) => {
        console.log('📱 Client - Notification reçue:', notification);

        // Vérifier si c'est une notification d'acceptation de commande
        if (notification.request.content.data?.type === 'order_accepted') {
          const orderId = notification.request.content.data?.orderId;
          const driverId = notification.request.content.data?.driverId;

          console.log(
            `✅ Commande acceptée - OrderID: ${orderId}, DriverID: ${driverId}`,
          );

          // Recharger les données des livraisons
          loadData()
            .then(() => {
              console.log('🔄 Données des livraisons rechargées côté client');
            })
            .catch((error) => {
              console.error(
                '❌ Erreur lors du rechargement des livraisons:',
                error,
              );
            });

          // Afficher une notification à l'utilisateur
          Alert.alert(
            '✅ Commande acceptée !',
            `Un livreur a accepté votre commande. Il sera bientôt en route !`,
            [
              {
                text: 'Voir ma commande',
                onPress: () => router.push('/(tabs)/deliveries'),
              },
              { text: 'OK' },
            ],
          );
        }
      });

    // Écouter les interactions avec les notifications (quand l'utilisateur tape sur la notification)
    const notificationResponseListener =
      notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('📱 Client - Interaction avec notification:', response);

          const notificationData = response.notification.request.content.data;

          if (notificationData?.type === 'order_accepted') {
            // Rediriger vers l'écran de suivi des livraisons
            router.push('/(tabs)/deliveries');
          }
        },
      );

    return () => {
      notificationListener.remove();
      notificationResponseListener.remove();
    };
  }, [user, loadData, router]);

  // Fonction pour normaliser les coordonnées au format [longitude, latitude]
  const normalizeCoordinates = (
    coordinates: [number, number],
  ): [number, number] => {
    const [first, second] = coordinates;

    // Si le premier nombre est dans la plage de longitude et le second dans la plage de latitude
    if (first >= -8.5 && first <= -2.0 && second >= 4.0 && second <= 11.0) {
      return [first, second]; // [longitude, latitude] - déjà correct
    }

    // Si le premier nombre est dans la plage de latitude et le second dans la plage de longitude
    if (first >= 4.0 && first <= 11.0 && second >= -8.5 && second <= -2.0) {
      return [second, first]; // Inverser pour avoir [longitude, latitude]
    }

    // Si aucune validation ne passe, retourner tel quel
    return coordinates;
  };

  // Gérer les paramètres de retour depuis la page de sélection des lieux
  useEffect(() => {
    console.log('📱 Paramètres reçus:', {
      originName,
      destinationName,
      originCoordsStr,
      destinationCoordsStr,
    });

    // Le useEffect ne s'exécute que si ces valeurs changent vraiment
    if (
      originName &&
      destinationName &&
      originCoordsStr &&
      destinationCoordsStr
    ) {
      const originCoords = (originCoordsStr as string)
        .split(',')
        .map(Number) as [number, number];
      const destinationCoords = (destinationCoordsStr as string)
        .split(',')
        .map(Number) as [number, number];

      // Valider et normaliser les coordonnées avant de les utiliser
      if (validateCoordinates(originCoords)) {
        const normalizedOrigin = normalizeCoordinates(originCoords);
        setSelectedOrigin(normalizedOrigin);
        setSelectedOriginName(originName as string);
        console.log('✅ Origine définie:', normalizedOrigin, originName);
      } else {
        console.error("❌ Coordonnées d'origine invalides:", originCoords);
      }

      if (validateCoordinates(destinationCoords)) {
        const normalizedDestination = normalizeCoordinates(destinationCoords);
        setSelectedDestination(normalizedDestination);
        setSelectedDestinationName(destinationName as string);
        setSearchQuery(destinationName as string);

        // Activer le panneau de trajet si on vient de select-locations
        if (originName && destinationName) {
          console.log('Prix calculé');
        }

        console.log(
          '✅ Destination définie:',
          normalizedDestination,
          destinationName,
        );
        console.log('🎯 État final - Destination:', normalizedDestination);
      } else {
        console.error(
          '❌ Coordonnées de destination invalides:',
          destinationCoords,
        );
      }
    }
  }, [originName, destinationName, originCoordsStr, destinationCoordsStr]);

  const handleSearchBarPress = () => {
    router.push('/select-locations');
  };

  const handleBookRide = () => {
    if (selectedServiceType) {
      alert(
        `Commande créée : ${selectedOriginName} → ${selectedDestinationName} (${selectedServiceType})`,
      );
    }
  };

  // Fonction pour valider les coordonnées
  const validateCoordinates = (coordinates: [number, number]): boolean => {
    if (!coordinates || coordinates.length !== 2) return false;

    const [first, second] = coordinates;
    if (isNaN(first) || isNaN(second)) return false;

    // Les coordonnées peuvent être dans deux formats :
    // 1. [longitude, latitude] - format standard
    // 2. [latitude, longitude] - format inversé (provenant de certaines APIs)

    // Vérifier si c'est le format [longitude, latitude]
    const isValidFormat1 =
      first >= -8.5 && first <= -2.0 && second >= 4.0 && second <= 11.0;

    // Vérifier si c'est le format [latitude, longitude] (inversé)
    const isValidFormat2 =
      first >= 4.0 && first <= 11.0 && second >= -8.5 && second <= -2.0;

    const isValid = isValidFormat1 || isValidFormat2;

    return isValid;
  };

  // Fonction pour rechercher des adresses réelles avec Google Places API
  const performSearch = async (query: string) => {
    console.log('Recherche pour:', query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      // Utiliser directement l'API Google Places pour l'autocomplétion avec les meilleures pratiques
      const apiKey = 'AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI';

      // Construire l'URL avec les paramètres optimaux selon la documentation
      const params = new URLSearchParams({
        input: query,
        key: apiKey,
        language: 'fr', // Langue française
        components: 'country:ci', // Restreindre à la Côte d'Ivoire
        location: '7.6833,-5.0333', // Centre de Bouaké
        radius: '50000', // Rayon de 50km
        types: 'establishment', // Types d'établissements
        sessiontoken: 'yatou_session_' + Date.now(), // Token de session pour optimiser les coûts
      });

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;

      console.log('URL Places Autocomplete:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Réponse Places Autocomplete:', {
        status: data.status,
        predictions: data.predictions ? data.predictions.length : 0,
        error_message: data.error_message,
      });

      if (data.predictions && data.predictions.length > 0) {
        const results = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction: any) => {
            try {
              // Obtenir les détails de chaque lieu directement via l'API
              const detailsParams = new URLSearchParams({
                place_id: prediction.place_id,
                key: apiKey,
                language: 'fr',
                fields: 'geometry,formatted_address,name,place_id',
              });

              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();

              if (detailsData.result && detailsData.result.geometry) {
                const { lat, lng } = detailsData.result.geometry.location;
                return {
                  id: prediction.place_id,
                  name: prediction.structured_formatting.main_text,
                  address: prediction.structured_formatting.secondary_text,
                  coordinates: [lng, lat] as [number, number],
                };
              }
            } catch (error) {
              console.error(
                'Erreur lors de la récupération des détails:',
                error,
              );
            }
            return null;
          }),
        );

        const validResults = results.filter((result) => result !== null);
        console.log('Résultats trouvés:', validResults.length);
        setSearchResults(validResults);
      } else {
        console.log('Aucune prédiction trouvée');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      setSearchResults([]);
    }
  };

  // Calculer la distance et les prix basés sur la destination sélectionnée
  const calculatePricing = useMemo(() => {
    const origin = selectedOrigin || userLocation;
    const destination = selectedDestination;

    if (!destination || !origin) {
      return {
        distance: 0,
        standardPrice: 0,
        premiumPrice: 0,
        duration: 0,
        basePrice: 0,
      };
    }

    // Calculer la distance en utilisant la formule de Haversine
    const R = 6371; // Rayon de la Terre en km
    const lat1 = (origin[1] * Math.PI) / 180;
    const lat2 = (destination[1] * Math.PI) / 180;
    const deltaLat = ((destination[1] - origin[1]) * Math.PI) / 180;
    const deltaLng = ((destination[0] - origin[0]) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLng / 2) *
        Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    // Calculer les prix basés sur la distance
    const basePrice = 500; // Prix de base en FCFA
    const pricePerKm = 200; // Prix par km en FCFA

    const standardPrice = Math.round(basePrice + distance * pricePerKm);
    const premiumPrice = Math.round(standardPrice * 1.5); // 50% plus cher pour le premium
    const duration = (Math.round(distance * 10) / 10) * 2; // Estimation basique de la durée en minutes

    return {
      distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
      standardPrice,
      premiumPrice,
      duration,
      basePrice,
    };
  }, [selectedDestination, selectedOrigin, userLocation]);

  const pricingOptions = useMemo(
    () => [
      {
        id: 'standard',
        name: 'Standard',
        price: calculatePricing.standardPrice,
        time: '15-20',
        icon: '🏍️',
        description: 'Livraison standard',
        type: 'Standard',
        details:
          "Livraison standard avec un temps d'attente de 15 à 20 minutes.",
      },
      {
        id: 'express',
        name: 'Express',
        price: calculatePricing.premiumPrice,
        time: '5-10',
        icon: '⚡',
        description: 'Livraison express',
        type: 'Express',
        details: "Livraison express avec un temps d'attente de 5 à 10 minutes.",
      },
    ],
    [calculatePricing],
  );

  console.log('📱 Index - selectedOrigin:', selectedOrigin);
  console.log('📱 Index - selectedDestination:', selectedDestination);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <View style={styles.mapContainer}>
        <GoogleMapViewComponent
          height={height}
          showUserLocation={true}
          selectedDestination={selectedDestination}
          selectedOrigin={selectedOrigin}
          userLocation={userLocation}
          onMapPress={(coordinates) => {}}
        >
          {/* Marqueurs des livreurs disponibles */}
          {userLocation && (
            <DriverMarkers
              centerLat={userLocation[1]}
              centerLng={userLocation[0]}
              radiusKm={15}
              onDriverPress={(driver) => {
                console.log('Livreur sélectionné:', driver);
                // Ici vous pouvez ajouter une logique pour afficher les détails du livreur
              }}
            />
          )}
        </GoogleMapViewComponent>

        <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
          <View style={styles.topBarContent}>
            <View style={styles.topBarLeft}>
              <YatouLogo
                size="large"
                showText={false}
                variant="01"
                style={styles.topBarLogo}
              />
              <View style={styles.locationIndicator}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.locationText}>Bouaké</Text>
                <View style={styles.onlineIndicator} />
              </View>
            </View>

            <View style={styles.topBarRight}>
              <TouchableOpacity
                style={styles.notificationButton}
                activeOpacity={0.7}
              >
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>2</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuContainer}
                onPress={() => router.push('/(tabs)/profile')}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.searchBar, isSearching && styles.searchBarActive]}
            onPress={handleSearchBarPress}
            activeOpacity={0.8}
          >
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text
              style={[
                styles.searchBarText,
                searchQuery && styles.searchBarTextActive,
              ]}
            >
              {searchQuery || 'Où souhaitez-vous aller ?'}
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            if (userLocation) {
              setUserLocation([...userLocation]);
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.locationButtonInner}>
            <MapPin size={20} color="#10B981" />
          </View>
          <View style={styles.locationPulse} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => router.push('/select-locations')}
          activeOpacity={0.8}
        >
          <Plus size={24} color={AppColors.white} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets Individuels pour Chaque Service */}
      <DeliveryBottomSheet
        visible={showDeliveryBottomSheet}
        onClose={() => setShowDeliveryBottomSheet(false)}
        tripData={{
          distance: calculatePricing.distance,
          duration: calculatePricing.duration,
        }}
        onServiceSelected={(service, vehicle, price) => {
          console.log(
            `Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`,
          );
          alert(
            `Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`,
          );
          setShowDeliveryBottomSheet(false);
        }}
      />

      <ErrandBottomSheet
        visible={showErrandBottomSheet}
        onClose={() => setShowErrandBottomSheet(false)}
        tripData={{
          distance: calculatePricing.distance,
          duration: calculatePricing.duration,
        }}
        onServiceSelected={(service, vehicle, price) => {
          console.log(
            `Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`,
          );
          alert(
            `Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`,
          );
          setShowErrandBottomSheet(false);
        }}
      />

      <MovingBottomSheet
        visible={showMovingBottomSheet}
        onClose={() => setShowMovingBottomSheet(false)}
        tripData={{
          distance: calculatePricing.distance,
          duration: calculatePricing.duration,
        }}
        onServiceSelected={(service, vehicle, price) => {
          console.log(
            `Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`,
          );
          alert(
            `Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`,
          );
          setShowMovingBottomSheet(false);
        }}
      />

      {/* Système de tarification YATOU complet */}
      {/* YatouPricingSystem supprimé - on utilise maintenant les options de service directement */}

      {/* Overlay YatouVehicleSelector sur la carte */}
      {selectedOrigin && selectedDestination && (
        <View style={styles.vehicleSelectorOverlay}>
          <YatouVehicleSelector
            distance={calculatePricing.distance}
            onVehicleSelected={(vehicleType, pricing) => {
              setSelectedVehicle(vehicleType);
              setSelectedVehiclePricing(pricing);
              // Le prix inclut maintenant automatiquement les options de service
              console.log(
                `Véhicule sélectionné: ${vehicleType}, Prix final: ${pricing.totalPrice} FCFA`,
              );
            }}
            onOrderRequest={async (vehicleType, pricing) => {
              setSelectedVehicle(vehicleType);
              setSelectedVehiclePricing(pricing);
              console.log(
                `Commande demandée pour: ${vehicleType}, Prix: ${pricing.totalPrice} FCFA`,
              );

              try {
                console.log('🚀 Création de la commande via addDelivery...');

                // CRÉER LA COMMANDE VIA addDelivery (le vrai système)
                const { useDeliveryStore } = await import(
                  '@/app/store/delivery-store'
                );
                const { addDelivery } = useDeliveryStore.getState();

                // Créer l'objet delivery
                const deliveryRecord = {
                  status: 'pending' as const,
                  pickupAddress: {
                    id: Date.now().toString(),
                    name: 'Expéditeur',
                    address: selectedOriginName || 'Adresse de départ',
                    city: 'Bouaké',
                    postalCode: '00000',
                    phone: '-',
                    instructions: '',
                    coordinates: selectedOrigin || [-5.0189, 7.6995], // Ajouter les coordonnées
                  },
                  deliveryAddress: {
                    id: (Date.now() + 1).toString(),
                    name: 'Destinataire',
                    address:
                      selectedDestinationName || 'Adresse de destination',
                    city: 'Bouaké',
                    postalCode: '00000',
                    phone: '-',
                    instructions: '',
                    coordinates: selectedDestination || [-5.0189, 7.6995], // Ajouter les coordonnées
                  },
                  package: {
                    id: (Date.now() + 2).toString(),
                    description: `Livraison ${vehicleType}`,
                    weight: 0,
                    value: pricing.totalPrice,
                    fragile: false,
                    dimensions: { length: 0, width: 0, height: 0 },
                  },
                  scheduledDate: new Date(),
                  price: pricing.totalPrice,
                };

                // Créer la commande en base de données
                await addDelivery(deliveryRecord as any);

                console.log(
                  '✅ Commande créée en base de données via addDelivery',
                );

                // Maintenant ouvrir le modal pour la recherche de livreurs
                setShowDriverSearch(true);
              } catch (error) {
                console.error(
                  '❌ Erreur lors de la création de la commande:',
                  error,
                );
                Alert.alert(
                  'Erreur',
                  'Impossible de créer la commande. Veuillez réessayer.',
                );
              }
            }}
            selectedVehicle={selectedVehicle}
            showDetails={false}
          />
        </View>
      )}

      {/* Modal de recherche automatique de livreurs */}
      <DriverSearchModal
        visible={showDriverSearch}
        onClose={() => setShowDriverSearch(false)}
        onDriverAccepted={(driver) => {
          console.log('Livreur accepté:', driver);
          // Ici vous pouvez ajouter la logique pour créer la commande
          setShowDriverSearch(false);
          // Rediriger vers l'écran de suivi de commande ou afficher un message de confirmation
          Alert.alert(
            'Commande confirmée !',
            `${driver.name} a accepté votre commande. Il arrivera bientôt !`,
            [{ text: 'OK' }],
          );
        }}
        userLocation={userLocation}
        vehicleType={selectedVehicle || 'moto'}
        estimatedPrice={selectedVehiclePricing?.totalPrice || 0}
        pickupAddress={selectedOriginName || 'Adresse de départ'}
        deliveryAddress={selectedDestinationName || 'Adresse de destination'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 68,
    backgroundColor: AppColors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  topBarLogo: {},
  locationIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginLeft: 4,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  menuContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    gap: 3,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: AppColors.text,
    borderRadius: 1,
  },

  mapContainer: {
    flex: 1,
    position: 'relative',
    marginTop: 8,
  },

  searchBarContainer: {
    position: 'absolute',
    top: 130,
    left: 16,
    right: 80,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarActive: {
    borderColor: AppColors.primary,
    backgroundColor: '#F0F9FF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchBarText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
    flex: 1,
  },
  searchBarTextActive: {
    color: AppColors.text,
    fontWeight: '600',
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  locationButton: {
    position: 'absolute',
    top: 130,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  locationButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    opacity: 0.2,
  },

  floatingButton: {
    position: 'absolute',
    bottom: 220,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  serviceHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  serviceInfo: {
    alignItems: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 3,
    textAlign: 'center',
  },
  serviceNameSelected: {
    color: AppColors.primary,
  },
  serviceDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  serviceDetails: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  serviceTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'center',
  },
  serviceTimeText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.text,
    textAlign: 'center',
  },
  servicePriceSelected: {
    color: AppColors.primary,
  },

  scrollContent: {
    flex: 1,
    paddingBottom: 16,
  },

  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardMain: {
    maxWidth: 280,
    backgroundColor: '#F0F9FF',
    borderColor: AppColors.primary,
    borderWidth: 2,
    shadowColor: AppColors.primary,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceCardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  serviceCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  serviceCardArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardArrowText: {
    fontSize: 14,
    color: AppColors.white,
    fontWeight: 'bold',
  },

  // Styles pour le système de tarification
  pricingSystemModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 2000,
  },
  closePricingButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closePricingButtonText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },

  // Overlay pour le sélecteur de véhicules
  vehicleSelectorOverlay: {
    position: 'absolute',
    bottom: 0, // Position en bas de l'écran
    left: 0,
    right: 0,
    zIndex: 1500, // Au-dessus de la carte mais en dessous des modals
  },
});
