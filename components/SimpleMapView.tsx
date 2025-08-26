import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface SimpleMapViewProps {
  height: number;
}

export default function SimpleMapView({ height }: SimpleMapViewProps) {
  return (
    <View style={[styles.container, { height }]}>
      <Text style={styles.debugText}>
        🗺️ Test Carte - Hauteur: {height}
      </Text>
      
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 5.3600,
          longitude: -4.0083,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onMapReady={() => console.log('🗺️ Carte simple chargée')}
      >
        <Marker
          coordinate={{
            latitude: 5.3600,
            longitude: -4.0083,
          }}
          title="Test - Abidjan"
          description="Point de test"
          pinColor="#FF0000"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: 'red',
  },
  debugText: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'white',
    padding: 10,
    zIndex: 1000,
    fontSize: 16,
    fontWeight: 'bold',
  },
  map: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'blue',
  },
});
