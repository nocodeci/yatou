import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

// Configuration Google Maps
const GOOGLE_MAPS_CONFIG = {
  // Clé API Google Maps
  API_KEY: "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI",
  // Coordonnées de Bouaké, Côte d'Ivoire
  DEFAULT_CENTER: {
    latitude: 7.6833,
    longitude: -5.0333,
  },
  DEFAULT_ZOOM: 12,
  DETAILED_ZOOM: 15,
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
  userLocation,
  onMapPress,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  useEffect(() => {
    if (showUserLocation) {
      requestLocationPermission();
    }
  }, [showUserLocation]);

  useEffect(() => {
    if (selectedDestination && mapRef.current) {
      console.log('Destination sélectionnée, calcul itinéraire...');
      updateDestination(selectedDestination);
    } else {
      // Effacer l'itinéraire quand pas de destination
      console.log('Effacement de l\'itinéraire');
      setRouteCoordinates([]);
    }
  }, [selectedDestination, userLocation, currentUserLocation]);

  // Log quand l'itinéraire change
  useEffect(() => {
    console.log('Itinéraire mis à jour:', routeCoordinates.length, 'points');
    if (routeCoordinates.length > 0) {
      console.log('Premier point:', routeCoordinates[0]);
      console.log('Dernier point:', routeCoordinates[routeCoordinates.length - 1]);
    }
  }, [routeCoordinates]);

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

  const updateDestination = async (destination: [number, number]) => {
    if (mapRef.current) {
      console.log('Mise à jour de la destination:', destination);
      
      // Obtenir la position utilisateur actuelle
      const userPos = userLocation || currentUserLocation;
      
      if (userPos) {
        // Calculer l'itinéraire
        await calculateRoute(userPos, destination);
        
        // Centrer la carte pour inclure l'itinéraire
        const midLat = (userPos[1] + destination[1]) / 2;
        const midLng = (userPos[0] + destination[0]) / 2;
        
        mapRef.current.animateToRegion({
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      } else {
        // Centrer seulement sur la destination
        mapRef.current.animateToRegion({
          latitude: destination[1],
          longitude: destination[0],
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
      }
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

      const apiKey = "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI"
      
      const originStr = `${origin[1]},${origin[0]}`
      const destinationStr = `${destination[1]},${destination[0]}`
      
      // Construire les paramètres selon le mode de transport
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: mode,
        language: 'fr',
        units: 'metric',
        region: 'ci'
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

      const apiKey = "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI"
      
      const originStr = `${origin[1]},${origin[0]}`
      const destinationStr = `${destination[1]},${destination[0]}`
      
      // Construire la chaîne de waypoints avec optimisation
      const waypointsStr = `optimize:true|${waypoints.join('|')}`
      
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: 'driving',
        language: 'fr',
        units: 'metric',
        region: 'ci',
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

      // Utiliser directement l'API Google Directions avec les meilleures pratiques
      const apiKey = "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI"
      
      // Format des coordonnées : "lat,lng" (sans espace)
      const originStr = `${origin[1]},${origin[0]}` // lat,lng
      const destinationStr = `${destination[1]},${destination[0]}` // lat,lng
      
      // Créer des via points intermédiaires pour un itinéraire plus réaliste
      const createViaWaypoints = (start: [number, number], end: [number, number]) => {
        const waypoints = []
        
        // Calculer le point milieu
        const midLat = (start[1] + end[1]) / 2
        const midLng = (start[0] + end[0]) / 2
        
        // Ajouter 2 via points intermédiaires pour simuler un itinéraire routier
        // Utiliser le préfixe via: pour éviter les arrêts
        const viaPoint1 = `via:${midLat - (end[1] - start[1]) * 0.2},${midLng - (end[0] - start[0]) * 0.2}`
        const viaPoint2 = `via:${midLat + (end[1] - start[1]) * 0.1},${midLng + (end[0] - start[0]) * 0.1}`
        
        waypoints.push(viaPoint1, viaPoint2)
        
        return waypoints
      }
      
      const viaWaypoints = createViaWaypoints(origin, destination)
      const waypointsStr = viaWaypoints.join('|')
      
      console.log('Via waypoints créés:', viaWaypoints)
      
      // Construire l'URL avec les paramètres optimaux selon la documentation
      const params = new URLSearchParams({
        origin: originStr,
        destination: destinationStr,
        key: apiKey,
        mode: 'driving', // Mode de transport par défaut
        language: 'fr', // Langue française
        units: 'metric', // Unités métriques
        alternatives: 'false', // Pas d'alternatives pour simplifier
        region: 'ci', // Région Côte d'Ivoire
        departure_time: 'now', // Heure de départ actuelle
        traffic_model: 'best_guess' // Modèle de trafic
      })
      
      // Ajouter les via waypoints s'ils existent
      if (viaWaypoints.length > 0) {
        params.append('waypoints', waypointsStr)
      }
      
      const url = `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`
      
      console.log('URL Directions API avec via waypoints:', url)
      
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
        const polyline = route.overview_polyline.points
        
        console.log('Polyline reçu:', polyline.substring(0, 50) + '...')
        
        // Décoder le polyline
        const decodedCoordinates = decodePolyline(polyline)
        console.log('Coordonnées décodées:', decodedCoordinates.length, 'points')
        
        // Vérifier que les coordonnées sont valides
        if (decodedCoordinates.length > 0) {
          setRouteCoordinates(decodedCoordinates)
          
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
          }
        } else {
          throw new Error('Aucune coordonnée valide dans le polyline')
        }
      } else {
        console.error('Erreur dans la réponse Directions:', data.error_message || data.status)
        // Fallback vers un itinéraire simulé avec waypoints
        const simulatedRoute = [
          origin,
          [origin[0] + (destination[0] - origin[0]) * 0.25, origin[1] + (destination[1] - origin[1]) * 0.25],
          [origin[0] + (destination[0] - origin[0]) * 0.5, origin[1] + (destination[1] - origin[1]) * 0.5],
          [origin[0] + (destination[0] - origin[0]) * 0.75, origin[1] + (destination[1] - origin[1]) * 0.75],
          destination,
        ]
        setRouteCoordinates(simulatedRoute)
      }
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error)
      // Fallback vers un itinéraire simulé en cas d'erreur
      const simulatedRoute = [
        origin,
        [origin[0] + (destination[0] - origin[0]) * 0.3, origin[1] + (destination[1] - origin[1]) * 0.3],
        [origin[0] + (destination[0] - origin[0]) * 0.7, origin[1] + (destination[1] - origin[1]) * 0.7],
        destination,
      ]
      setRouteCoordinates(simulatedRoute)
    }
  }

  const decodePolyline = (encoded: string) => {
    const poly = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let shift = 0, result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        let b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (result >= 0x20);

      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      poly.push({
        latitude: lat / 1E5,
        longitude: lng / 1E5
      });
    }

    console.log('Premier point décodé:', poly[0]);
    console.log('Dernier point décodé:', poly[poly.length - 1]);
    
    return poly;
  };

  const getMapCenter = () => {
    if (userLocation) {
      return {
        latitude: userLocation[1],
        longitude: userLocation[0],
      };
    }
    if (currentUserLocation) {
      return {
        latitude: currentUserLocation[1],
        longitude: currentUserLocation[0],
      };
    }
    return GOOGLE_MAPS_CONFIG.DEFAULT_CENTER;
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const coords: [number, number] = [coordinate.longitude, coordinate.latitude];
    console.log('Carte cliquée aux coordonnées:', coords);
    if (onMapPress) {
      onMapPress(coords);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...getMapCenter(),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={showUserLocation && locationPermission}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        onPress={handleMapPress}
        mapType="standard"
      >
        {/* Marqueur de destination */}
        {selectedDestination && (
          <Marker
            coordinate={{
              latitude: selectedDestination[1],
              longitude: selectedDestination[0],
            }}
            title="Destination"
            description="Point de livraison"
            pinColor="#FF6B35"
          />
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

         {/* Itinéraire */}
         {routeCoordinates.length > 0 && (
           <Polyline
             coordinates={routeCoordinates}
             strokeColor="#4285F4"
             strokeWidth={6}
             lineDashPattern={[1]}
             zIndex={2}
           />
         )}
       </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
