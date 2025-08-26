import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity, Animated } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import CacheManager from '../utils/cacheManager';
import { useDebounce } from '../hooks/useDebounce';
import CustomRoute from './CustomRoute';
import RouteStyleConfig, { RouteStyle, PREDEFINED_ROUTE_STYLES } from './RouteStyleConfig';
import ColorPicker from './ColorPicker';
import TestRoute from './TestRoute';
import TripDetailsBottomSheet from './TripDetailsBottomSheet';
import { AppColors } from '@/app/constants/colors';


// Style "Light & Clean" pour la carte
const lightCleanMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [ { "color": "#f5f5f5" } ]
  },
      {
    "elementType": "labels.icon",
    "stylers": [ { "visibility": "off" } ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#616161" } ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [ { "color": "#f5f5f5" } ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#bdbdbd" } ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [ { "color": "#eeeeee" } ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#757575" } ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [ { "color": "#e5e5e5" } ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [ { "color": "#ffffff" } ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#757575" } ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [ { "color": "#dadada" } ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#616161" } ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#9e9e9e" } ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [ { "color": "#e5e5e5" } ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [ { "color": "#eeeeee" } ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [ { "color": "#c9c9c9" } ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [ { "color": "#9e9e9e" } ]
  }
];



// Configuration Google Maps inline pour éviter les problèmes d'importation
const GOOGLE_MAPS_CONFIG = {
  // Clé API Google Maps
  API_KEY: "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI",
  
  // Coordonnées de Bouaké, Côte d'Ivoire
  DEFAULT_CENTER: {
    latitude: 7.6833,
    longitude: -5.0333,
  },
  
  // Niveau de zoom par défaut
  DEFAULT_ZOOM: 12,
  
  // Niveau de zoom pour la vue détaillée
  DETAILED_ZOOM: 15,
  
  // Région par défaut (Côte d'Ivoire)
  DEFAULT_REGION: 'ci',
  
  // Langue par défaut
  DEFAULT_LANGUAGE: 'fr',
  
  // Unités par défaut
  DEFAULT_UNITS: 'metric',
};

interface MapViewProps {
  height: number;
  showUserLocation?: boolean;
  selectedDestination?: [number, number] | null;
  selectedOrigin?: [number, number] | null;
  userLocation?: [number, number] | null;
  onMapPress?: (coordinates: [number, number]) => void;
}

export default function GoogleMapViewComponent({
  height,
  showUserLocation = true,
  selectedDestination,
  selectedOrigin,
  userLocation,
  onMapPress,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [routeStyle, setRouteStyle] = useState<RouteStyle>(PREDEFINED_ROUTE_STYLES[0]);
  const [showRouteConfig, setShowRouteConfig] = useState(false);
  const [customRouteColor, setCustomRouteColor] = useState('#FF0000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);
  const [tripData, setTripData] = useState({
    origin: '',
    destination: '',
    distance: '',
    duration: '',
    estimatedPrice: '',
    routeType: 'driving' as const,
    trafficLevel: 'medium' as 'low' | 'medium' | 'high',
    eta: '',
  });



  useEffect(() => {
    if (showUserLocation) {
      requestLocationPermission();
    }
    
    // Nettoyer le cache expiré au démarrage
    CacheManager.cleanExpiredCache();
    
    // Afficher les statistiques du cache
    CacheManager.getCacheStats().then(stats => {
      console.log('📊 Statistiques du cache:', stats);
    });
  }, [showUserLocation]);

  useEffect(() => {
    console.log('🔄 useEffect itinéraire - selectedOrigin:', selectedOrigin, 'selectedDestination:', selectedDestination, 'mapRef.current:', !!mapRef.current);
    
    if (selectedOrigin && selectedDestination && mapRef.current) {
      console.log('✅ Origine et destination sélectionnées, calcul itinéraire...');
      // Calculer l'itinéraire entre l'origine et la destination sélectionnées
      calculateRoute(selectedOrigin, selectedDestination);
      
      // Centrer la carte pour inclure les deux points
      const midLat = (selectedOrigin[1] + selectedDestination[1]) / 2;
      const midLng = (selectedOrigin[0] + selectedDestination[0]) / 2;
      
      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.abs(selectedDestination[1] - selectedOrigin[1]) * 1.5,
        longitudeDelta: Math.abs(selectedDestination[0] - selectedOrigin[0]) * 1.5,
      }, 1000);
    } else if (selectedDestination && mapRef.current) {
      console.log('✅ Seulement destination sélectionnée, calcul itinéraire depuis position utilisateur...');
      // Fallback : utiliser la position utilisateur comme origine
      const userPos = userLocation || currentUserLocation;
      if (userPos) {
        calculateRoute(userPos, selectedDestination);
      }
    } else {
      // Effacer l'itinéraire quand pas assez d'informations
      console.log('❌ Effacement de l\'itinéraire - selectedOrigin:', selectedOrigin, 'selectedDestination:', selectedDestination, 'mapRef.current:', !!mapRef.current);
      setRouteCoordinates([]);
    }
  }, [selectedOrigin, selectedDestination, userLocation, currentUserLocation]);

  // Recentrer la carte quand la position utilisateur change (seulement si pas d'itinéraire)
  useEffect(() => {
    if (currentUserLocation && mapRef.current && routeCoordinates.length === 0) {
      console.log('Recentrage automatique sur la position utilisateur (pas d\'itinéraire)');
      centerOnUserLocation();
    }
  }, [currentUserLocation, routeCoordinates.length]);

  // Log quand l'itinéraire change
  useEffect(() => {
    console.log('🔄 Itinéraire mis à jour:', routeCoordinates.length, 'points');
    if (routeCoordinates.length > 0) {
      console.log('📍 Premier point:', routeCoordinates[0]);
      console.log('🏁 Dernier point:', routeCoordinates[routeCoordinates.length - 1]);
      console.log('🎨 Couleur actuelle:', customRouteColor);
    } else {
      console.log('❌ Aucun itinéraire affiché');
    }
  }, [routeCoordinates, customRouteColor]);





  const requestLocationPermission = async () => {
    try {
      console.log('Demande de permission de localisation...');
      
      // Vérifier d'abord si les services de localisation sont activés
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.log('Services de localisation désactivés');
        setCurrentUserLocation([GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.longitude, GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.latitude]);
        return;
      }
      
      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Statut de la permission:', status);
      
      if (status === 'granted') {
        setLocationPermission(true);
        await getCurrentLocation();
      } else {
        console.log('Permission de localisation refusée');
        setCurrentUserLocation([GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.longitude, GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.latitude]);
      }
    } catch (error) {
      console.log('Erreur lors de la demande de permission:', error);
      setCurrentUserLocation([GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.longitude, GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.latitude]);
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('Récupération de la position actuelle...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
        distanceInterval: 10,
      });
      
      const coords: [number, number] = [location.coords.longitude, location.coords.latitude];
      console.log('Position récupérée:', coords);
      setCurrentUserLocation(coords);
      
    } catch (error) {
      console.log('Erreur de géolocalisation:', error);
      console.log('Utilisation de la position par défaut (Bouaké)');
      setCurrentUserLocation([GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.longitude, GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.latitude]);
    }
  };



  // Fonction pour calculer un itinéraire avec différents modes de transport
  const calculateRouteWithMode = async (
    origin: [number, number], 
    destination: [number, number], 
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving',
    avoid?: string[]
  ) => {
    try {
      console.log('Calcul itinéraire avec mode:', { origin, destination, mode, avoid })

      const apiKey = GOOGLE_MAPS_CONFIG.API_KEY
      
      const originStr = `${origin[1]},${origin[0]}`
      const destinationStr = `${destination[1]},${destination[0]}`
      
      // Construire les paramètres selon le mode de transport
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: mode,
        language: GOOGLE_MAPS_CONFIG.DEFAULT_LANGUAGE,
        units: GOOGLE_MAPS_CONFIG.DEFAULT_UNITS,
        region: GOOGLE_MAPS_CONFIG.DEFAULT_REGION
      })
      
      // Ajouter les restrictions d'évitement si spécifiées
      if (avoid && avoid.length > 0) {
        params.append('avoid', avoid.join('|'))
      }
      
      // Ajouter l'heure de départ pour les informations de trafic (mode driving uniquement)
      if (mode === 'driving') {
        params.append('departure_time', 'now')
        params.append('traffic_model', 'best_guess')
      }
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
      
      console.log('URL Directions API avec mode:', url)
      
      const response = await fetch(url)
      const data = await response.json()

      console.log('Réponse Directions API:', {
        status: data.status,
        mode: mode,
        routes: data.routes ? data.routes.length : 0,
        error_message: data.error_message
      })

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const polyline = route.overview_polyline.points
        
        const decodedCoordinates = decodePolyline(polyline)
        
        if (decodedCoordinates.length > 0) {
          setRouteCoordinates(decodedCoordinates)
          
          // Afficher les informations spécifiques au mode de transport
          if (route.legs && route.legs.length > 0) {
            const leg = route.legs[0]
            console.log(`Informations itinéraire (${mode}):`, {
              distance: leg.distance?.text,
              duration: leg.duration?.text,
              duration_in_traffic: leg.duration_in_traffic?.text,
              start_address: leg.start_address,
              end_address: leg.end_address,
              warnings: data.warnings
            })
          }
        }
      } else {
        console.error('Erreur dans la réponse Directions:', data.error_message || data.status)
      }
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error)
    }
  }

  // Fonction pour calculer un itinéraire optimisé avec plusieurs waypoints
  const calculateOptimizedRoute = async (origin: [number, number], destination: [number, number], waypoints: string[]) => {
    try {
      console.log('Calcul itinéraire optimisé:', { origin, destination, waypoints })

      const apiKey = GOOGLE_MAPS_CONFIG.API_KEY
      
      const originStr = `${origin[1]},${origin[0]}`
      const destinationStr = `${destination[1]},${destination[0]}`
      
      // Construire la chaîne de waypoints avec optimisation
      const waypointsStr = `optimize:true|${waypoints.join('|')}`
      
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: 'driving',
        language: GOOGLE_MAPS_CONFIG.DEFAULT_LANGUAGE,
        units: GOOGLE_MAPS_CONFIG.DEFAULT_UNITS,
        region: GOOGLE_MAPS_CONFIG.DEFAULT_REGION,
        waypoints: waypointsStr
      })
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
      
      console.log('URL Directions API optimisée:', url)
      
      const response = await fetch(url)
      const data = await response.json()

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const polyline = route.overview_polyline.points
        
        console.log('Itinéraire optimisé:', {
          waypoint_order: route.waypoint_order,
          total_distance: route.legs?.reduce((sum: number, leg: any) => sum + (leg.distance?.value || 0), 0),
          total_duration: route.legs?.reduce((sum: number, leg: any) => sum + (leg.duration?.value || 0), 0)
        })
        
        const decodedCoordinates = decodePolyline(polyline)
        setRouteCoordinates(decodedCoordinates)
      }
    } catch (error) {
      console.error('Erreur itinéraire optimisé:', error)
    }
  }



  const calculateRoute = async (origin: [number, number], destination: [number, number]) => {
    try {
      console.log('Calcul itinéraire:', { origin, destination })

      // Validation des coordonnées
      if (!origin || !destination || 
          origin.length !== 2 || destination.length !== 2 ||
          isNaN(origin[0]) || isNaN(origin[1]) || 
          isNaN(destination[0]) || isNaN(destination[1])) {
        console.error('Coordonnées invalides:', { origin, destination })
        throw new Error('Coordonnées invalides')
      }

      // Vérifier que les coordonnées sont dans des plages raisonnables pour la Côte d'Ivoire
      const isValidLatitude = (lat: number) => lat >= 4.0 && lat <= 11.0
      const isValidLongitude = (lng: number) => lng >= -8.5 && lng <= -2.0

      if (!isValidLatitude(origin[1]) || !isValidLongitude(origin[0]) ||
          !isValidLatitude(destination[1]) || !isValidLongitude(destination[0])) {
        console.error('Coordonnées hors de la Côte d\'Ivoire:', { origin, destination })
        throw new Error('Coordonnées hors de la zone de service')
      }

      // Créer des clés de cache basées sur les coordonnées arrondies (optimisation)
      const originKey = `${Math.round(origin[1] * 1000) / 1000},${Math.round(origin[0] * 1000) / 1000}`
      const destinationKey = `${Math.round(destination[1] * 1000) / 1000},${Math.round(destination[0] * 1000) / 1000}`
      
      // Vérifier le cache d'abord
      const cachedRoute = await CacheManager.getCachedRoute(originKey, destinationKey)
      if (cachedRoute) {
        console.log('✅ Itinéraire récupéré du cache')
        setRouteCoordinates(cachedRoute.coordinates)
        return
      }

      // Utiliser directement l'API Google Directions avec les meilleures pratiques
      const apiKey = GOOGLE_MAPS_CONFIG.API_KEY
      
      // Format des coordonnées : "lat,lng" (sans espace)
      // origin et destination sont au format [longitude, latitude]
      const originStr = `${origin[1]},${origin[0]}` // lat,lng
      const destinationStr = `${destination[1]},${destination[0]}` // lat,lng
      
      // 📍 DÉBOGAGE : Afficher les valeurs exactes envoyées à l'API
      console.log("📍 Appel API avec Origine:", originStr);
      console.log("🏁 Appel API avec Destination:", destinationStr);

      
      // Construire l'URL avec les paramètres optimaux selon la documentation
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: 'driving', // Mode de transport par défaut
        language: GOOGLE_MAPS_CONFIG.DEFAULT_LANGUAGE, // Langue française
        units: GOOGLE_MAPS_CONFIG.DEFAULT_UNITS, // Unités métriques
        alternatives: 'false', // Pas d'alternatives pour simplifier
        region: GOOGLE_MAPS_CONFIG.DEFAULT_REGION, // Région Côte d'Ivoire
        departure_time: 'now', // Heure de départ actuelle
        traffic_model: 'best_guess' // Modèle de trafic
      })
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
      
      console.log('URL Directions API:', url)
      
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log('Réponse Directions API:', {
        status: data.status,
        routes: data.routes ? data.routes.length : 0,
        waypoint_order: data.routes?.[0]?.waypoint_order,
        error_message: data.error_message
      })

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        
        // NOUVELLE LOGIQUE : On assemble un itinéraire haute-définition
        let highDetailCoordinates: { latitude: number; longitude: number }[] = [];

        // On parcourt chaque segment du trajet (souvent un seul, mais peut y en avoir plus)
        route.legs.forEach((leg: any) => {
          // Dans chaque segment, on parcourt chaque étape (ex: "Tourner à droite rue X")
          leg.steps.forEach((step: any) => {
            // On décode la polyline de CETTE étape
            const decodedStep = decodePolyline(step.polyline.points);
            // On l'ajoute à notre tableau principal
            highDetailCoordinates.push(...decodedStep);
          });
        });

        // Éliminer les doublons consécutifs pour optimiser le rendu
        const optimizedCoordinates = highDetailCoordinates.filter((coord, index) => {
          if (index === 0) return true;
          const prevCoord = highDetailCoordinates[index - 1];
          return !(coord.latitude === prevCoord.latitude && coord.longitude === prevCoord.longitude);
        });

        console.log(`Itinéraire haute-définition généré: ${highDetailCoordinates.length} points`);
        console.log(`Itinéraire optimisé: ${optimizedCoordinates.length} points`);
        
        // Vérifier que les coordonnées sont valides
        if (optimizedCoordinates.length > 0) {
          setRouteCoordinates(optimizedCoordinates)
          
          // Sauvegarder en cache pour les prochaines utilisations
          const routeData = {
            coordinates: optimizedCoordinates,
            distance: route.legs?.[0]?.distance?.text || '',
            duration: route.legs?.[0]?.duration?.text || ''
          }
          await CacheManager.setCachedRoute(originKey, destinationKey, routeData)
          
          // Afficher les informations détaillées de l'itinéraire
          if (route.legs && route.legs.length > 0) {
            console.log('Détails de l\'itinéraire:')
            route.legs.forEach((leg: any, index: number) => {
              console.log(`Étape ${index + 1}:`, {
                distance: leg.distance?.text,
                duration: leg.duration?.text,
                duration_in_traffic: leg.duration_in_traffic?.text,
                start_address: leg.start_address,
                end_address: leg.end_address,
                steps: leg.steps?.length || 0
              })
            })
            
            // Calculer les totaux
            const totalDistance = route.legs.reduce((sum: number, leg: any) => 
              sum + (leg.distance?.value || 0), 0)
            const totalDuration = route.legs.reduce((sum: number, leg: any) => 
              sum + (leg.duration?.value || 0), 0)
            
            console.log('Totaux:', {
              distance: `${(totalDistance / 1000).toFixed(1)} km`,
              duration: `${Math.round(totalDuration / 60)} min`
            })
            
            // Mettre à jour les données du trajet pour le bottom sheet
            const leg = route.legs[0];
            setTripData({
              origin: leg.start_address || 'Origine',
              destination: leg.end_address || 'Destination',
              distance: leg.distance?.text || '',
              duration: leg.duration?.text || '',
              estimatedPrice: calculateEstimatedPrice(totalDistance / 1000),
              routeType: 'driving',
              trafficLevel: getTrafficLevel(leg.duration_in_traffic?.value, leg.duration?.value),
              eta: calculateETA(leg.duration?.value),
            });
          }
        } else {
          throw new Error('Aucune coordonnée valide dans l\'itinéraire haute-définition')
        }
      } else {
        console.error('Erreur dans la réponse Directions:', data.error_message || data.status)
        
        if (data.status === 'ZERO_RESULTS') {
          console.log('Aucun itinéraire trouvé - utilisation d\'un itinéraire direct')
          // Pour ZERO_RESULTS, créer un itinéraire direct simple
          const directRoute = [
            { latitude: origin[1], longitude: origin[0] },
            { latitude: destination[1], longitude: destination[0] }
          ]
          setRouteCoordinates(directRoute)
        } else {
          // Fallback vers un itinéraire simulé avec waypoints pour les autres erreurs
        const simulatedRoute = [
            { latitude: origin[1], longitude: origin[0] },
            { latitude: origin[1] + (destination[1] - origin[1]) * 0.25, longitude: origin[0] + (destination[0] - origin[0]) * 0.25 },
            { latitude: origin[1] + (destination[1] - origin[1]) * 0.5, longitude: origin[0] + (destination[0] - origin[0]) * 0.5 },
            { latitude: origin[1] + (destination[1] - origin[1]) * 0.75, longitude: origin[0] + (destination[0] - origin[0]) * 0.75 },
            { latitude: destination[1], longitude: destination[0] }
        ]
        setRouteCoordinates(simulatedRoute)
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error)
      // Fallback vers un itinéraire simulé en cas d'erreur
      const simulatedRoute = [
        { latitude: origin[1], longitude: origin[0] },
        { latitude: origin[1] + (destination[1] - origin[1]) * 0.3, longitude: origin[0] + (destination[0] - origin[0]) * 0.3 },
        { latitude: origin[1] + (destination[1] - origin[1]) * 0.7, longitude: origin[0] + (destination[0] - origin[0]) * 0.7 },
        { latitude: destination[1], longitude: destination[0] }
      ]
      setRouteCoordinates(simulatedRoute)
    }
  }

  // Fonctions utilitaires pour le bottom sheet
  const calculateEstimatedPrice = (distanceKm: number): string => {
    // Prix de base : 500 FCFA + 200 FCFA par km
    const basePrice = 500;
    const pricePerKm = 200;
    const totalPrice = basePrice + (distanceKm * pricePerKm);
    return `${totalPrice.toFixed(0)} FCFA`;
  };

  const getTrafficLevel = (durationInTraffic?: number, normalDuration?: number): 'low' | 'medium' | 'high' => {
    if (!durationInTraffic || !normalDuration) return 'medium';
    
    const trafficRatio = durationInTraffic / normalDuration;
    if (trafficRatio < 1.2) return 'low';
    if (trafficRatio < 1.5) return 'medium';
    return 'high';
  };

  const calculateETA = (durationSeconds?: number): string => {
    if (!durationSeconds) return '';
    
    const now = new Date();
    const eta = new Date(now.getTime() + durationSeconds * 1000);
    return eta.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Fonction d'encodage de polylines selon l'algorithme Google Maps
  const encodePolyline = (points: { latitude: number; longitude: number }[]) => {
    if (points.length === 0) return '';

    let encoded = '';
    let prevLat = 0;
    let prevLng = 0;

    for (const point of points) {
      // Convertir en coordonnées E5 (multiplier par 1e5)
      const lat = Math.round(point.latitude * 1e5);
      const lng = Math.round(point.longitude * 1e5);

      // Calculer les différences
      const dLat = lat - prevLat;
      const dLng = lng - prevLng;

      // Encoder les différences
      encoded += encodeSignedNumber(dLat) + encodeSignedNumber(dLng);

      prevLat = lat;
      prevLng = lng;
    }

    return encoded;
  };

  // Fonction helper pour encoder un nombre signé
  const encodeSignedNumber = (num: number): string => {
    // Décale d'un bit vers la gauche
    let sgn_num = num << 1;
    
    // Si le nombre est négatif, inverse tous les bits
    if (num < 0) {
      sgn_num = ~sgn_num;
    }

    return encodeUnsignedNumber(sgn_num);
  };

  // Fonction helper pour encoder un nombre non signé
  const encodeUnsignedNumber = (num: number): string => {
    let encoded = '';
    
    while (num >= 0x20) {
      encoded += String.fromCharCode((0x20 | (num & 0x1f)) + 63);
      num >>= 5;
    }
    
    encoded += String.fromCharCode(num + 63);
    return encoded;
  };

  // Fonction de décodage de polylines selon l'algorithme Google Maps (version corrigée)
  const decodePolyline = (encoded: string) => {
    try {
      const points: { latitude: number; longitude: number }[] = [];
      let index = 0;
      let lat = 0;
      let lng = 0;

      const decodeNumber = (): number => {
        let shift = 0;
        let result = 0;
        let byte;

        do {
          byte = encoded.charCodeAt(index++) - 63;
          result |= (byte & 0x1f) << shift;
        shift += 5;
        } while (byte >= 0x20);

        return (result & 1) ? ~(result >> 1) : (result >> 1);
      };

      while (index < encoded.length) {
        // Décoder latitude et longitude
        lat += decodeNumber();
        lng += decodeNumber();

        // Convertir en degrés décimaux
        const latitude = lat / 1e5;
        const longitude = lng / 1e5;

        points.push({ latitude, longitude });
      }

      console.log('Polyline décodé avec succès:', points.length, 'points');
      if (points.length > 0) {
        console.log('Premier point:', points[0]);
        console.log('Dernier point:', points[points.length - 1]);
      }

      return points;
    } catch (error) {
      console.error('Erreur lors du décodage du polyline:', error);
      return [];
    }
  };

  const getMapCenter = () => {
    // Priorité à la position utilisateur actuelle
    if (currentUserLocation) {
      return {
        latitude: currentUserLocation[1],
        longitude: currentUserLocation[0],
      };
    }
    if (userLocation) {
      return {
        latitude: userLocation[1],
        longitude: userLocation[0],
      };
    }
    // Fallback sur Bouaké
    return GOOGLE_MAPS_CONFIG.DEFAULT_CENTER;
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const coords: [number, number] = [coordinate.longitude, coordinate.latitude];

    if (onMapPress) {
      onMapPress(coords);
    }
  };

  // Fonction pour centrer la carte sur la position utilisateur
  const centerOnUserLocation = () => {
    if (mapRef.current) {
      const center = getMapCenter();
      mapRef.current.animateToRegion({
        ...center,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  const mapCenter = getMapCenter();
  console.log('🎯 Centre de la carte:', mapCenter);
  console.log('📏 Hauteur de la carte:', height);
  console.log('📍 Position utilisateur:', currentUserLocation);
  console.log('🏁 Origine sélectionnée:', selectedOrigin);
  console.log('🎯 Destination sélectionnée:', selectedDestination);
  console.log('🎯 Rendu marqueur origine:', selectedOrigin ? `[${selectedOrigin[0]}, ${selectedOrigin[1]}]` : 'null');
  console.log('🎯 Rendu marqueur destination:', selectedDestination ? `[${selectedDestination[0]}, ${selectedDestination[1]}]` : 'null');
  console.log('🎯 Rendu itinéraire:', routeCoordinates.length > 0 ? `${routeCoordinates.length} points` : 'aucun');





  return (
    <View style={[styles.container, { height }]}>

      
      <MapView
        ref={mapRef}
        style={[styles.map, { height: height || 400 }]}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...getMapCenter(),
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation={showUserLocation && locationPermission}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={false}
        showsIndoors={false}
        onPress={handleMapPress}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#ffffff"
        onMapReady={() => console.log('🗺️ Carte Google Maps chargée avec succès')}
      >
        {/* Marqueur d'origine - style rectangle avec texte */}
        {selectedOrigin && (
          <Marker
            coordinate={{
              latitude: selectedOrigin[1],
              longitude: selectedOrigin[0],
            }}
            title="Départ"
            description="Point de départ"
            opacity={1}
            zIndex={1000}
          >
            <View style={{
              backgroundColor: '#000000',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 60
            }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                marginRight: 6
              }} />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600'
              }}>
                Départ
              </Text>
            </View>
          </Marker>
        )}

        {/* Marqueur de destination - style rectangle avec texte */}
        {selectedDestination && (
          <Marker
            coordinate={{
              latitude: selectedDestination[1],
              longitude: selectedDestination[0],
            }}
            title="Destination"
            description="Point de livraison"
            opacity={1}
            zIndex={1000}
          >
            <View style={{
              backgroundColor: '#000000',
              borderRadius: 6,
              paddingHorizontal: 8,
              paddingVertical: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              flexDirection: 'row',
              alignItems: 'center',
              minWidth: 60
            }}>
              <View style={{
                width: 12,
                height: 12,
                backgroundColor: '#FFFFFF',
                borderRadius: 2,
                marginRight: 6
              }} />
              <Text style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600'
              }}>
                Arrivée
              </Text>
            </View>
          </Marker>
        )}

                 {/* Marqueur de position utilisateur (si pas de showUserLocation) */}
         {!showUserLocation && currentUserLocation && (
           <Marker
             coordinate={{
               latitude: currentUserLocation[1],
               longitude: currentUserLocation[0],
             }}
             title="Votre position"
             description="Position actuelle"
             pinColor="#007AFF"
           />
         )}

        {/* Itinéraire personnalisé avec styles avancés */}
        {routeCoordinates.length > 0 && (
          <>
            {/* Log pour déboguer */}
            {console.log('🗺️ MapView - Affichage CustomRoute avec couleur:', customRouteColor, 'routeCoordinates:', routeCoordinates.length)}
            {console.log('🔍 Vérification - customRouteColor === #000000:', customRouteColor === '#000000')}
            <CustomRoute
              coordinates={routeCoordinates}
              strokeColor={customRouteColor}
              strokeWidth={routeStyle.strokeWidth}
              animated={routeStyle.animated}
              gradient={routeStyle.gradient}
              startColor={routeStyle.startColor}
              endColor={routeStyle.endColor}
              showDirectionArrows={routeStyle.showDirectionArrows}
              lineDashPattern={routeStyle.lineDashPattern}
              zIndex={1000}
            />
          </>
        )}
       </MapView>

       {/* Composant de test pour vérifier la couleur noire */}
       <TestRoute />

       {/* Bouton de configuration du style d'itinéraire */}
       {routeCoordinates.length > 0 && (
         <TouchableOpacity
           style={styles.routeConfigButton}
           onPress={() => setShowRouteConfig(!showRouteConfig)}
         >
           <Text style={styles.routeConfigButtonText}>🎨</Text>
         </TouchableOpacity>
       )}

       {/* Bouton de sélection de couleurs */}
       {routeCoordinates.length > 0 && (
         <TouchableOpacity
           style={styles.colorPickerButton}
           onPress={() => setShowColorPicker(!showColorPicker)}
         >
           <Text style={styles.colorPickerButtonText}>🎨</Text>
         </TouchableOpacity>
       )}

       {/* Bouton des détails du trajet */}
       {routeCoordinates.length > 0 && (
         <TouchableOpacity
           style={styles.tripDetailsButton}
           onPress={() => setShowTripDetails(true)}
         >
           <Text style={styles.tripDetailsButtonText}>📋</Text>
         </TouchableOpacity>
       )}

       {/* Panneau de configuration du style d'itinéraire */}
       {showRouteConfig && routeCoordinates.length > 0 && (
         <RouteStyleConfig
           selectedStyle={routeStyle}
           onStyleChange={setRouteStyle}
         />
       )}

       {/* Panneau de sélection de couleurs */}
       {showColorPicker && routeCoordinates.length > 0 && (
         <ColorPicker
           selectedColor={customRouteColor}
           onColorChange={setCustomRouteColor}
           title="Couleur de l'Itinéraire"
         />
       )}

       {/* Bottom Sheet des détails du trajet */}
       <TripDetailsBottomSheet
         visible={showTripDetails}
         onClose={() => setShowTripDetails(false)}
         tripData={tripData}
         onCalculatePrice={() => console.log('Calcul de prix demandé')}
       />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  routeConfigButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  routeConfigButtonText: {
    fontSize: 24,
  },
  colorPickerButton: {
    position: 'absolute',
    top: 80,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  colorPickerButtonText: {
    fontSize: 20,
  },
  tripDetailsButton: {
    position: 'absolute',
    top: 140,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tripDetailsButtonText: {
    fontSize: 20,
  },
});
