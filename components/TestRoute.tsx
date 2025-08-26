import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Polyline } from 'react-native-maps';

// Coordonnées de test simples
const TEST_COORDINATES = [
  { latitude: 7.6833, longitude: -5.0333 },
  { latitude: 7.6900, longitude: -5.0300 },
  { latitude: 7.6950, longitude: -5.0250 },
];

export default function TestRoute() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Itinéraire Noir</Text>
      <Text style={styles.subtitle}>Couleur: #000000 (Noir)</Text>
      
      {/* Test avec différentes couleurs pour vérifier */}
      <View style={styles.colorTest}>
        <View style={[styles.colorBox, { backgroundColor: '#1a1a1a' }]}>
          <Text style={styles.colorText}>Noir #1a1a1a</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: '#FF0000' }]}>
          <Text style={styles.colorText}>Rouge #FF0000</Text>
        </View>
        <View style={[styles.colorBox, { backgroundColor: '#00FF00' }]}>
          <Text style={styles.colorText}>Vert #00FF00</Text>
        </View>
      </View>
      
      {/* Itinéraire de test avec couleur très foncée */}
      <Polyline
        coordinates={TEST_COORDINATES}
        strokeColor="#1a1a1a"
        strokeWidth={8}
        lineCap="round"
        lineJoin="round"
        zIndex={1000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  colorTest: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  colorBox: {
    padding: 8,
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  colorText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
