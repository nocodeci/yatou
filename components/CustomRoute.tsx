import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Polyline, Marker } from 'react-native-maps';
import { AppColors } from '@/app/constants/colors';
import { STATUS_COLORS, PRIORITY_COLORS, DELIVERY_COLORS } from './ColorPicker';

interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

interface CustomRouteProps {
  coordinates: RouteCoordinate[];
  strokeColor?: string;
  strokeWidth?: number;
  animated?: boolean;
  gradient?: boolean;
  startColor?: string;
  endColor?: string;
  showDirectionArrows?: boolean;
  lineDashPattern?: number[];
  zIndex?: number;
  // Nouvelles propriétés pour les couleurs dynamiques
  deliveryStatus?: string;
  deliveryPriority?: string;
  deliveryType?: string;
  distance?: number;
  trafficLevel?: 'low' | 'medium' | 'high';
}

export default function CustomRoute({
  coordinates,
  strokeColor = AppColors.primary,
  strokeWidth = 6,
  animated = true,
  gradient = false,
  startColor = '#FF6B6B',
  endColor = '#4ECDC4',
  showDirectionArrows = true,
  lineDashPattern,
  zIndex = 1000,
  deliveryStatus,
  deliveryPriority,
  deliveryType,
  distance,
  trafficLevel
}: CustomRouteProps) {
  const [visibleCoordinates, setVisibleCoordinates] = useState<RouteCoordinate[]>([]);
  const animationIndex = useRef(0);

  // Animation de l'itinéraire
  useEffect(() => {
    if (!animated || coordinates.length === 0) {
      setVisibleCoordinates(coordinates);
      return;
    }

    const interval = setInterval(() => {
      if (animationIndex.current < coordinates.length) {
        setVisibleCoordinates(prevCoords => [
          ...prevCoords,
          coordinates[animationIndex.current],
        ]);
        animationIndex.current += 1;
      } else {
        clearInterval(interval);
      }
    }, 50); // Ajoute un point toutes les 50ms

    return () => clearInterval(interval);
  }, [coordinates, animated]);

  // Fonction pour interpoler les couleurs (gradient)
  const interpolateColor = (progress: number, start: string, end: string) => {
    // Convertir les couleurs hex en RGB
    const startRGB = hexToRgb(start);
    const endRGB = hexToRgb(end);
    
    if (!startRGB || !endRGB) return strokeColor;
    
    const r = Math.round(startRGB.r + (endRGB.r - startRGB.r) * progress);
    const g = Math.round(startRGB.g + (endRGB.g - startRGB.g) * progress);
    const b = Math.round(startRGB.b + (endRGB.b - startRGB.b) * progress);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Fonction helper pour convertir hex en RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Fonctions pour les couleurs dynamiques
  const getDynamicColor = () => {
    // Priorité 1: Couleur selon le statut de livraison
    if (deliveryStatus && STATUS_COLORS[deliveryStatus as keyof typeof STATUS_COLORS]) {
      return STATUS_COLORS[deliveryStatus as keyof typeof STATUS_COLORS];
    }
    
    // Priorité 2: Couleur selon la priorité
    if (deliveryPriority && PRIORITY_COLORS[deliveryPriority as keyof typeof PRIORITY_COLORS]) {
      return PRIORITY_COLORS[deliveryPriority as keyof typeof PRIORITY_COLORS];
    }
    
    // Priorité 3: Couleur selon le type de livraison
    if (deliveryType && DELIVERY_COLORS[deliveryType as keyof typeof DELIVERY_COLORS]) {
      return DELIVERY_COLORS[deliveryType as keyof typeof DELIVERY_COLORS];
    }
    
    // Priorité 4: Couleur selon la distance
    if (distance !== undefined) {
      return getColorByDistance(distance);
    }
    
    // Priorité 5: Couleur selon le niveau de trafic
    if (trafficLevel) {
      return getColorByTraffic(trafficLevel);
    }
    
    // Couleur par défaut
    return strokeColor;
  };

  const getColorByDistance = (distance: number) => {
    if (distance < 5) return '#00FF00';      // Vert (court)
    if (distance < 20) return '#FFA500';     // Orange (moyen)
    return '#FF0000';                         // Rouge (long)
  };

  const getColorByTraffic = (trafficLevel: 'low' | 'medium' | 'high') => {
    switch (trafficLevel) {
      case 'low': return '#00FF00';     // Vert
      case 'medium': return '#FFA500';  // Orange
      case 'high': return '#FF0000';    // Rouge
      default: return '#0000FF';        // Bleu
    }
  };

  // Rendu d'un itinéraire avec gradient
  const renderGradientRoute = () => {
    if (coordinates.length < 2) return null;

    return coordinates.map((coord, index) => {
      if (index === 0) return null;

      const segmentCoords = [coordinates[index - 1], coord];
      const progress = index / (coordinates.length - 1);
      const segmentColor = interpolateColor(progress, startColor, endColor);

      return (
        <Polyline
          key={`gradient-segment-${index}`}
          coordinates={segmentCoords}
          strokeColor={segmentColor}
          strokeWidth={strokeWidth}
          lineCap="round"
          lineJoin="round"
          zIndex={zIndex}
        />
      );
    });
  };

  // Rendu d'un itinéraire simple
  const renderSimpleRoute = () => {
    const coords = animated ? visibleCoordinates : coordinates;
    
    if (coords.length < 2) return null;

    // FORCER l'utilisation de la couleur personnalisée (strokeColor)
    const finalColor = strokeColor;
    
    // Log pour déboguer la couleur
    console.log('🎨 CustomRoute - Couleur finale FORCÉE:', finalColor, 'strokeColor original:', strokeColor);

    return (
      <Polyline
        coordinates={coords}
        strokeColor={finalColor}
        strokeWidth={strokeWidth}
        lineCap="round"
        lineJoin="round"
        lineDashPattern={lineDashPattern}
        zIndex={zIndex}
        tappable={true}
        geodesic={true}
      />
    );
  };

  // Rendu des flèches de direction
  const renderDirectionArrows = () => {
    if (!showDirectionArrows || coordinates.length < 2) return null;

    // Afficher des flèches tous les 5 points pour éviter la surcharge
    const arrowStep = Math.max(1, Math.floor(coordinates.length / 10));
    
    return coordinates.map((coord, index) => {
      if (index % arrowStep !== 0 || index === coordinates.length - 1) return null;
      
      const nextCoord = coordinates[index + 1];
      if (!nextCoord) return null;

      // Calculer l'angle de la direction
      const angle = Math.atan2(
        nextCoord.latitude - coord.latitude,
        nextCoord.longitude - coord.longitude
      );

      return (
        <Marker
          key={`arrow-${index}`}
          coordinate={coord}
          anchor={{ x: 0.5, y: 0.5 }}
          rotation={angle * 180 / Math.PI}
          zIndex={zIndex + 1}
        >
          <View style={[styles.directionArrow, { transform: [{ rotate: `${angle}rad` }] }]}>
            <View style={styles.arrowHead} />
          </View>
        </Marker>
      );
    });
  };

  // Rendu des points de début et fin
  const renderRouteEndpoints = () => {
    if (coordinates.length < 2) return null;

    return (
      <>
        {/* Point de départ */}
        <Marker
          coordinate={coordinates[0]}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={zIndex + 2}
        >
          <View style={[styles.endpoint, styles.startPoint]} />
        </Marker>

        {/* Point d'arrivée */}
        <Marker
          coordinate={coordinates[coordinates.length - 1]}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={zIndex + 2}
        >
          <View style={[styles.endpoint, styles.endPoint]} />
        </Marker>
      </>
    );
  };

  return (
    <>
      {/* Itinéraire principal */}
      {gradient ? renderGradientRoute() : renderSimpleRoute()}
      
      {/* Flèches de direction */}
      {renderDirectionArrows()}
      
      {/* Points de début et fin */}
      {renderRouteEndpoints()}
    </>
  );
}

const styles = StyleSheet.create({
  directionArrow: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowHead: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: AppColors.primary,
    transform: [{ rotate: '90deg' }],
  },
  endpoint: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: AppColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  startPoint: {
    backgroundColor: AppColors.success,
  },
  endPoint: {
    backgroundColor: AppColors.error,
  },
});
