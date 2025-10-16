import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MapPin, Navigation, AlertCircle } from 'lucide-react-native';
import { locationService, LocationUpdate } from '@/app/services/locationService';
import { AppColors } from '@/app/constants/colors';

interface LocationStatusProps {
  isOnline: boolean;
  onLocationPress?: () => void;
}

export default function LocationStatus({ isOnline, onLocationPress }: LocationStatusProps) {
  const [currentLocation, setCurrentLocation] = useState<LocationUpdate | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOnline) {
      // Vérifier le statut du suivi
      setIsTracking(locationService.isLocationTrackingActive());
      
      // Obtenir la dernière position connue
      const lastLocation = locationService.getLastKnownLocation();
      if (lastLocation) {
        setCurrentLocation(lastLocation);
      }

      // Mettre à jour périodiquement l'affichage
      const interval = setInterval(() => {
        setIsTracking(locationService.isLocationTrackingActive());
        const lastLocation = locationService.getLastKnownLocation();
        if (lastLocation) {
          setCurrentLocation(lastLocation);
        }
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setCurrentLocation(null);
      setIsTracking(false);
      setLocationError(null);
    }
  }, [isOnline]);

  const getLocationStatusColor = () => {
    if (!isOnline) return '#9CA3AF';
    if (locationError) return AppColors.error;
    if (isTracking && currentLocation) return AppColors.success;
    if (isTracking) return AppColors.warning;
    return '#9CA3AF';
  };

  const getLocationStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (locationError) return 'Erreur GPS';
    if (isTracking && currentLocation) {
      const accuracy = currentLocation.accuracy ? `${Math.round(currentLocation.accuracy)}m` : 'N/A';
      return `GPS actif (${accuracy})`;
    }
    if (isTracking) return 'Recherche GPS...';
    return 'GPS inactif';
  };

  const getLocationIcon = () => {
    if (!isOnline) return MapPin;
    if (locationError) return AlertCircle;
    if (isTracking && currentLocation) return Navigation;
    return MapPin;
  };

  const IconComponent = getLocationIcon();

  return (
    <TouchableOpacity 
      style={[styles.container, { borderColor: getLocationStatusColor() }]}
      onPress={onLocationPress}
      activeOpacity={0.7}
    >
      <IconComponent 
        size={16} 
        color={getLocationStatusColor()} 
      />
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: getLocationStatusColor() }]}>
          {getLocationStatusText()}
        </Text>
        {currentLocation && isOnline && (
          <Text style={styles.coordinatesText}>
            {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});
