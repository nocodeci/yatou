import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_CONFIG } from '@/app/constants/google-maps';

// Style pour éliminer seulement les éléments verts spécifiques
const antiGreenStyle = [
  {
    "featureType": "road.local",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#ffffff" }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry.stroke",
    "stylers": [
      { "color": "#ffffff" }
    ]
  }
];

interface MapViewProps {
  height?: number;
  showUserLocation?: boolean;
  selectedOrigin?: [number, number] | null;
  selectedDestination?: [number, number] | null;
  userLocation?: [number, number] | null;
  onMapPress?: (coordinate: [number, number]) => void;
  children?: React.ReactNode; // Pour les marqueurs de livreurs
}

export default function GoogleMapViewComponent({
  height = 400,
  showUserLocation = true,
  selectedOrigin,
  selectedDestination,
  userLocation,
  onMapPress,
  children,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    if (showUserLocation) {
      requestLocationPermission();
    }
  }, [showUserLocation]);

  const requestLocationPermission = async () => {
    try {
      console.log('Demande de permission de localisation...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Statut de la permission:', status);
      
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        console.log('Permission de localisation refusée');
        setLocationPermission(false);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      console.log('Récupération de la position actuelle...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      const coords: [number, number] = [location.coords.longitude, location.coords.latitude];
      setCurrentUserLocation(coords);
      console.log('Position récupérée:', coords);
    } catch (error) {
      console.error('Erreur lors de la récupération de la position:', error);
    }
  };

  // Centrer la carte quand origine et destination sont sélectionnés
  useEffect(() => {
    if (selectedOrigin && selectedDestination && mapRef.current) {
      console.log('✅ Centrage de la carte sur l\'itinéraire...');
      
      const midLat = (selectedOrigin[1] + selectedDestination[1]) / 2;
      const midLng = (selectedOrigin[0] + selectedDestination[0]) / 2;
      
      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: Math.abs(selectedDestination[1] - selectedOrigin[1]) * 1.5,
        longitudeDelta: Math.abs(selectedDestination[0] - selectedOrigin[0]) * 1.5,
      }, 1000);
    }
  }, [selectedOrigin, selectedDestination]);

  const getMapCenter = () => {
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
    return GOOGLE_MAPS_CONFIG.DEFAULT_CENTER;
  };

  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    const coords: [number, number] = [coordinate.longitude, coordinate.latitude];
    onMapPress?.(coords);
  };

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
        showsTraffic={true}
        showsBuildings={true}
        showsIndoors={false}
        onPress={handleMapPress}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#ffffff"
        customMapStyle={antiGreenStyle}
        onMapReady={() => console.log('🗺️ Carte Google Maps chargée avec succès')}
      >
        {/* Marqueur d'origine */}
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

        {/* Marqueur de destination */}
        {selectedDestination && (
          <Marker
            coordinate={{
              latitude: selectedDestination[1],
              longitude: selectedDestination[0],
            }}
            title="Arrivée"
            description="Point d'arrivée"
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

        {/* Marqueur de position utilisateur */}
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

        {/* Itinéraire Google Maps natif avec MapViewDirections */}
        {selectedOrigin && selectedDestination && (
          <MapViewDirections
            origin={{
              latitude: selectedOrigin[1],
              longitude: selectedOrigin[0],
            }}
            destination={{
              latitude: selectedDestination[1],
              longitude: selectedDestination[0],
            }}
            apikey={GOOGLE_MAPS_CONFIG.API_KEY}
            strokeWidth={5}
            strokeColor="#FF0000"
            strokeColors={['#FF0000']}
            mode="DRIVING"
            precision="high"
            timePrecision="now"
            optimizeWaypoints={true}
            splitWaypoints={false}
            onReady={(result) => {
              console.log('✅ Itinéraire Google Maps natif calculé:', {
                distance: result.distance,
                duration: result.duration,
                coordinates: result.coordinates?.length || 0
              });
              // Centrer automatiquement sur l'itinéraire
              if (mapRef.current && result.coordinates) {
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                  animated: true,
                });
              }
            }}
            onError={(errorMessage) => {
              console.log('❌ Erreur itinéraire Google Maps:', errorMessage);
              console.log('🔑 Clé API utilisée:', GOOGLE_MAPS_CONFIG.API_KEY.substring(0, 10) + '...');
              console.log('📍 Origine:', selectedOrigin);
              console.log('🏁 Destination:', selectedDestination);
            }}
            onStart={(params) => {
              console.log('🚀 Début calcul itinéraire avec paramètres:', params);
            }}
          />
        )}

        {/* Marqueurs de livreurs */}
        {children}

      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
