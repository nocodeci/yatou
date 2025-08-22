import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { MAPBOX_CONFIG } from '@/app/constants/mapbox';

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
  const webViewRef = useRef<WebView>(null);

  // Token Mapbox public - peut être exposé dans le client
  const MAPBOX_TOKEN = 'pk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtrcmtoZzA2dm4yanFyd2dteWoxam8ifQ.4JxRLRtSELRMfYnl8Fa1NQ';

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Mettre à jour la destination quand elle change
  useEffect(() => {
    if (mapReady && selectedDestination) {
      updateDestination(selectedDestination);
    }
  }, [selectedDestination, mapReady]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
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

  const updateDestination = (destination: [number, number]) => {
    if (webViewRef.current) {
      const script = `
        try {
          console.log('Mise à jour de la destination:', [${destination[0]}, ${destination[1]}]);
          
          // Supprimer l'ancien marqueur de destination
          if (window.destinationMarker) {
            window.destinationMarker.remove();
          }
          
          // Ajouter le marqueur de destination
          window.destinationMarker = new mapboxgl.Marker({
            color: '#FF6B35',
            scale: 1.2
          })
          .setLngLat([${destination[0]}, ${destination[1]}])
          .addTo(map);
          
          // Centrer la carte
          map.flyTo({
            center: [${destination[0]}, ${destination[1]}],
            zoom: 14,
            duration: 2000
          });
          
          // Dessiner l'itinéraire si on a une position utilisateur
          if (window.userMarker) {
            const userPos = window.userMarker.getLngLat();
            
            // Supprimer l'ancien itinéraire
            if (map.getSource('route')) {
              map.removeLayer('route');
              map.removeSource('route');
            }
            
            // Créer une ligne droite immédiate
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
            
            console.log('Ligne droite affichée');
            
            // Calculer l'itinéraire optimal
            setTimeout(() => {
              const url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + 
                userPos.lng + ',' + userPos.lat + ';' + ${destination[0]} + ',' + ${destination[1]} + 
                '?geometries=geojson&access_token=${MAPBOX_TOKEN}';
              
              fetch(url)
                .then(response => response.json())
                .then(data => {
                  if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0].geometry;
                    
                    // Mettre à jour avec l'itinéraire optimal
                    map.getSource('route').setData({
                      'type': 'Feature',
                      'properties': {},
                      'geometry': route
                    });
                    
                    // Changer la couleur en bleu
                    map.setPaintProperty('route', 'line-color', '#007AFF');
                    
                    console.log('Itinéraire optimal affiché');
                  }
                })
                .catch(error => {
                  console.error('Erreur calcul itinéraire:', error);
                });
            }, 1000);
          }
        } catch (error) {
          console.error('Erreur mise à jour:', error);
        }
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const generateMapHTML = () => {
    const currentUserLocation = propUserLocation || userLocation;
    const longitude = currentUserLocation?.[0] || MAPBOX_CONFIG.DEFAULT_CENTER[0];
    const latitude = currentUserLocation?.[1] || MAPBOX_CONFIG.DEFAULT_CENTER[1];
    
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
            mapboxgl.accessToken = '${MAPBOX_TOKEN}';
            
            const map = new mapboxgl.Map({
              container: 'map',
              style: '${MAPBOX_CONFIG.STYLES.STREETS}',
              center: [${longitude}, ${latitude}],
              zoom: ${MAPBOX_CONFIG.DEFAULT_ZOOM}
            });

            ${showUserLocation && currentUserLocation ? `
            // Marqueur utilisateur
            window.userMarker = new mapboxgl.Marker({
              color: '#007AFF',
              scale: 0.8
            })
            .setLngLat([${currentUserLocation[0]}, ${currentUserLocation[1]}])
            .addTo(map);
            ` : ''}

            // Gérer les clics
            map.on('click', function(e) {
              const coordinates = e.lngLat;
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapClick',
                coordinates: [coordinates.lng, coordinates.lat]
              }));
            });

            // Carte prête
            map.on('load', function() {
              console.log('Carte chargée');
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapReady'
              }));
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
