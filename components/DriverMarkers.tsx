import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { driverService } from '@/app/services/api';

interface Driver {
  id: string;
  userId: string;
  name: string;
  vehicleType: 'moto' | 'fourgon' | 'camion';
  vehicleModel: string;
  vehiclePlate: string;
  rating: number;
  totalDeliveries: number;
  location: {
    latitude: number;
    longitude: number;
  };
  isAvailable: boolean;
}

interface DriverMarkersProps {
  centerLat: number;
  centerLng: number;
  radiusKm?: number;
  onDriverPress?: (driver: Driver) => void;
}

export default function DriverMarkers({ 
  centerLat, 
  centerLng, 
  radiusKm = 10, 
  onDriverPress 
}: DriverMarkersProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableDrivers();
  }, [centerLat, centerLng, radiusKm]);

  // Rafraîchir automatiquement les positions toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadAvailableDrivers();
    }, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval);
  }, [centerLat, centerLng, radiusKm]);

  const loadAvailableDrivers = async () => {
    if (!centerLat || !centerLng) return;

    setIsLoading(true);
    try {
      const availableDrivers = await driverService.getAvailableDriversInArea(
        centerLat, 
        centerLng, 
        radiusKm
      );
      setDrivers(availableDrivers);
    } catch (error) {
      console.error('Erreur lors du chargement des livreurs:', error);
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'moto':
        return require('@/assets/moto.png');
      case 'fourgon':
        return require('@/assets/fourgon.png');
      case 'camion':
        return require('@/assets/gros camion.png');
      default:
        return require('@/assets/moto.png');
    }
  };

  const getVehicleColor = (vehicleType: string) => {
    switch (vehicleType) {
      case 'moto':
        return '#10B981'; // Vert
      case 'fourgon':
        return '#3B82F6'; // Bleu
      case 'camion':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280'; // Gris
    }
  };

  if (isLoading) {
    return null; // Pas de marqueurs pendant le chargement
  }

  if (drivers.length === 0) {
    return (
      <View style={styles.noDriversContainer}>
        <Text style={styles.noDriversText}>
          Aucun livreur visible
        </Text>
        <Text style={styles.noDriversSubtext}>
          Les livreurs doivent activer leur GPS pour apparaître sur la carte
        </Text>
      </View>
    );
  }

  return (
    <>
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          coordinate={driver.location}
          onPress={() => onDriverPress?.(driver)}
        >
          <View style={[styles.markerContainer, { borderColor: getVehicleColor(driver.vehicleType) }]}>
            <Image 
              source={getVehicleIcon(driver.vehicleType)} 
              style={styles.vehicleIcon}
              resizeMode="contain"
            />
            <View style={[styles.statusDot, { backgroundColor: driver.isAvailable ? '#10B981' : '#EF4444' }]} />
          </View>
        </Marker>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  vehicleIcon: {
    width: 24,
    height: 24,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  noDriversContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDriversText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  noDriversSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
});
