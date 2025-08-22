import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MAPBOX_CONFIG } from '@/app/constants/mapbox';

// URL du backend (à ajuster selon votre configuration)
const BACKEND_URL = 'http://192.168.100.191:3000';

const { width, height } = Dimensions.get('window');

interface MapViewProps {
  style?: any;
  showUserLocation?: boolean;
  onMapPress?: (coordinates: [number, number]) => void;
  height?: number;
  selectedDestination?: [number, number] | null;
  userLocation?: [number, number] | null;
}

const MapView: React.FC<MapViewProps> = ({ 
  style, 
  showUserLocation = true, 
  onMapPress,
  height: mapHeight = 200,
  selectedDestination = null,
  userLocation: propUserLocation = null
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    requestLocationPermission();
    fetchMapboxToken();
  }, []);

  // Mettre à jour la destination quand elle change
  useEffect(() => {
    if (mapReady) {
      if (selectedDestination) {
        updateDestination(selectedDestination);
      } else {
        // Nettoyer la carte si pas de destination
        clearDestination();
      }
    }
  }, [selectedDestination, mapReady]);

  // Régénérer la carte quand le token est récupéré
  useEffect(() => {
    if (mapboxToken && !mapReady) {
      setMapReady(false); // Forcer la régénération
    }
  }, [mapboxToken]);

  const fetchMapboxToken = async () => {
    try {
      console.log('Tentative de récupération du token Mapbox depuis:', `${BACKEND_URL}/api/mapbox/token`);
      
      const response = await fetch(`${BACKEND_URL}/api/mapbox/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.token) {
        setMapboxToken(data.token);
        console.log('Token Mapbox récupéré avec succès');
      } else {
        console.error('Erreur lors de la récupération du token Mapbox:', data.error);
        setMapboxToken('pk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtrcmtoZzA2dm4yanFyd2dteWoxam8ifQ.4JxRLRtSELRMfYnl8Fa1NQ');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token Mapbox:', error);
      console.log('Utilisation du token de fallback...');
      setMapboxToken('pk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtrcmtoZzA2dm4yanFyd2dteWoxam8ifQ.4JxRLRtSELRMfYnl8Fa1NQ');
    }
  };

  const clearDestination = () => {
    if (webViewRef.current) {
      const script = `
        try {
          console.log('Nettoyage de la destination');
          
          if (window.destinationMarker) {
            window.destinationMarker.remove();
            window.destinationMarker = null;
            console.log('Marqueur de destination supprimé');
          }
          
          if (map.getSource('route')) {
            map.removeLayer('route');
            map.removeSource('route');
            console.log('Itinéraire supprimé');
          }
        } catch (error) {
          console.error('Erreur lors du nettoyage:', error);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const updateDestination = (destination: [number, number]) => {
    if (webViewRef.current && mapboxToken) {
      const script = `
        try {
          console.log('Mise à jour de la destination:', [${destination[0]}, ${destination[1]}]);
          
          // Supprimer l'ancien marqueur de destination s'il existe
          if (window.destinationMarker) {
            window.destinationMarker.remove();
          }
          
          // Ajouter un nouveau marqueur pour la destination
          window.destinationMarker = new mapboxgl.Marker({
            color: '#FF6B35',
            scale: 1.2
          })
          .setLngLat([${destination[0]}, ${destination[1]}])
          .addTo(map);
          
          // Centrer la carte sur la destination
          map.flyTo({
            center: [${destination[0]}, ${destination[1]}],
            zoom: 14,
            duration: 2000
          });
          
          // Dessiner l'itinéraire si on a une position utilisateur
          if (window.userMarker) {
            const userPos = window.userMarker.getLngLat();
            console.log('Position utilisateur:', userPos);
            console.log('Destination:', [${destination[0]}, ${destination[1]}]);
            
            // Supprimer l'ancien itinéraire s'il existe
            if (map.getSource('route')) {
              map.removeLayer('route');
              map.removeSource('route');
            }
            
            // Créer d'abord une ligne droite pour feedback immédiat
            const routeData = {
              'type': 'Feature',
              'properties': {},
              'geometry': {
                'type': 'LineString',
                'coordinates': [
                  [userPos.lng, userPos.lat],
                  [${destination[0]}, ${destination[1]}]
                ]
              }
            };
            
            map.addSource('route', {
              'type': 'geojson',
              'data': routeData
            });
            
            map.addLayer({
              'id': 'route',
              'type': 'line',
              'source': 'route',
              'layout': {
                'line-join': 'round',
                'line-cap': 'round'
              },
              'paint': {
                'line-color': '#FF0000',
                'line-width': 4,
                'line-opacity': 0.8
              }
            });
            
            console.log('Ligne droite affichée immédiatement');
            
            // Ensuite, essayer de calculer l'itinéraire réel
            setTimeout(() => {
              const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + 
                userPos.lng + ',' + userPos.lat + ';' + ${destination[0]} + ',' + ${destination[1]} + 
                '?geometries=geojson&access_token=${mapboxToken}';
              
              console.log('Calcul de l\'itinéraire réel...');
              
              fetch(url)
                .then(response => {
                  console.log('Réponse API reçue:', response.status);
                  return response.json();
                })
                .then(data => {
                  console.log('Données API reçues');
                  if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0].geometry;
                    
                    // Mettre à jour la source avec l'itinéraire réel
                    map.getSource('route').setData({
                      'type': 'Feature',
                      'properties': {},
                      'geometry': route
                    });
                    
                    // Changer la couleur en bleu pour l'itinéraire réel
                    map.setPaintProperty('route', 'line-color', '#007AFF');
                    
                    console.log('Itinéraire réel affiché avec succès');
                  } else {
                    console.log('Aucun itinéraire trouvé, garde la ligne droite');
                  }
                })
                .catch(error => {
                  console.error('Erreur lors du calcul de l\'itinéraire:', error);
                  console.log('Garde la ligne droite en cas d\'erreur');
                });
            }, 1000); // Attendre 1 seconde avant de calculer l'itinéraire réel
          } else {
            console.log('Pas de marqueur utilisateur trouvé');
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        // Position par défaut
        setUserLocation(MAPBOX_CONFIG.DEFAULT_CENTER);
      }
    } catch (error) {
      console.log('Erreur de permission:', error);
      setUserLocation(MAPBOX_CONFIG.DEFAULT_CENTER);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setUserLocation([location.coords.longitude, location.coords.latitude]);
    } catch (error) {
      console.log('Erreur de géolocalisation:', error);
      setUserLocation(MAPBOX_CONFIG.DEFAULT_CENTER);
    }
  };

  const generateMapHTML = () => {
    const currentUserLocation = propUserLocation || userLocation;
    const longitude = currentUserLocation?.[0] || MAPBOX_CONFIG.DEFAULT_CENTER[0];
    const latitude = currentUserLocation?.[1] || MAPBOX_CONFIG.DEFAULT_CENTER[1];
    
    if (!mapboxToken) {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Map</title>
            <style>
              body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; }
              .loading { text-align: center; color: #666; }
            </style>
          </head>
          <body>
            <div class="loading">Chargement du token Mapbox...</div>
          </body>
        </html>
      `;
    }
    
    console.log('Génération de la carte avec le token:', mapboxToken);
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Map</title>
          <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
          <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet">
          <script src="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js"></script>
          <style>
            body { margin: 0; padding: 0; }
            #map { position: absolute; top: 0; bottom: 0; width: 100%; }
            .mapboxgl-ctrl-top-right { display: none; }
            .mapboxgl-ctrl-bottom-right { display: none; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            mapboxgl.accessToken = '${mapboxToken}';
            
            const map = new mapboxgl.Map({
              container: 'map',
              style: '${MAPBOX_CONFIG.STYLES.STREETS}',
              center: [${longitude}, ${latitude}],
              zoom: ${MAPBOX_CONFIG.DEFAULT_ZOOM}
            });

            ${showUserLocation && currentUserLocation ? `
            // Ajouter un marqueur pour la position de l'utilisateur
            window.userMarker = new mapboxgl.Marker({
              color: '#007AFF',
              scale: 0.8
            })
            .setLngLat([${currentUserLocation[0]}, ${currentUserLocation[1]}])
            .addTo(map);
            ` : ''}

            // Gérer les clics sur la carte
            map.on('click', function(e) {
              const coordinates = e.lngLat;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                coordinates: [coordinates.lng, coordinates.lat]
              }));
            });

            // Marquer la carte comme prête
            map.on('load', function() {
              console.log('Carte Mapbox chargée avec succès');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
              
              // Stocker l'instance de la carte
              window.mapInstance = map;
              
              // Fonction de logging pour debug
              window.logToReactNative = function(message) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'log',
                  message: message
                }));
              };
              
              console.log = function(message) {
                window.logToReactNative(message);
              };
              
              console.error = function(message) {
                window.logToReactNative('ERROR: ' + message);
              };
            });
            
            // Gérer les erreurs de la carte
            map.on('error', function(e) {
              console.error('Erreur Mapbox:', e);
            });
          </script>
        </body>
      </html>
    `;
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapClick' && onMapPress) {
        onMapPress(data.coordinates);
      } else if (data.type === 'mapReady') {
        setMapReady(true);
        console.log('Carte prête');
      } else if (data.type === 'log') {
        console.log('WebView log:', data.message);
      }
    } catch (error) {
      console.log('Erreur parsing message:', error);
    }
  };

  if (!userLocation) {
    return (
      <View style={[styles.container, { height: mapHeight }, style]}>
        <Text style={styles.loadingText}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: mapHeight }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  webview: {
    flex: 1,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default MapView;
