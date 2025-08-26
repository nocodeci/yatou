import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Marker } from 'react-native-maps';
import { AppColors } from '@/app/constants/colors';

interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  data?: any;
}

interface MarkerClusterProps {
  points: ClusterPoint[];
  onMarkerPress?: (point: ClusterPoint) => void;
  onClusterPress?: (cluster: ClusterPoint[]) => void;
  clusterRadius?: number;
  minZoom?: number;
  maxZoom?: number;
}

export default function MarkerCluster({
  points,
  onMarkerPress,
  onClusterPress,
  clusterRadius = 50,
  minZoom = 10,
  maxZoom = 20
}: MarkerClusterProps) {
  const [clusters, setClusters] = useState<{
    center: { latitude: number; longitude: number };
    points: ClusterPoint[];
    count: number;
  }[]>([]);

  // Algorithme de clustering simple basé sur la distance
  const calculateClusters = useMemo(() => {
    if (points.length === 0) return [];

    const clusters: {
      center: { latitude: number; longitude: number };
      points: ClusterPoint[];
      count: number;
    }[] = [];

    const processed = new Set<string>();

    for (const point of points) {
      if (processed.has(point.id)) continue;

      const cluster = [point];
      processed.add(point.id);

      // Chercher les points proches
      for (const otherPoint of points) {
        if (processed.has(otherPoint.id)) continue;

        const distance = calculateDistance(
          point.latitude,
          point.longitude,
          otherPoint.latitude,
          otherPoint.longitude
        );

        if (distance <= clusterRadius) {
          cluster.push(otherPoint);
          processed.add(otherPoint.id);
        }
      }

      // Calculer le centre du cluster
      const center = calculateClusterCenter(cluster);

      clusters.push({
        center,
        points: cluster,
        count: cluster.length
      });
    }

    return clusters;
  }, [points, clusterRadius]);

  useEffect(() => {
    setClusters(calculateClusters);
  }, [calculateClusters]);

  // Calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Retourner en mètres
  };

  // Calculer le centre d'un cluster
  const calculateClusterCenter = (clusterPoints: ClusterPoint[]) => {
    const totalLat = clusterPoints.reduce((sum, point) => sum + point.latitude, 0);
    const totalLon = clusterPoints.reduce((sum, point) => sum + point.longitude, 0);
    
    return {
      latitude: totalLat / clusterPoints.length,
      longitude: totalLon / clusterPoints.length
    };
  };

  // Rendu d'un cluster
  const renderCluster = (cluster: typeof clusters[0], index: number) => {
    if (cluster.count === 1) {
      // Marqueur unique
      const point = cluster.points[0];
      return (
        <Marker
          key={`marker-${point.id}`}
          coordinate={{
            latitude: point.latitude,
            longitude: point.longitude
          }}
          title={point.title}
          description={point.description}
          onPress={() => onMarkerPress?.(point)}
        >
          <View style={styles.singleMarker}>
            <View style={styles.markerDot} />
          </View>
        </Marker>
      );
    }

    // Cluster de plusieurs marqueurs
    return (
      <Marker
        key={`cluster-${index}`}
        coordinate={cluster.center}
        onPress={() => onClusterPress?.(cluster.points)}
      >
        <TouchableOpacity
          style={styles.clusterMarker}
          onPress={() => onClusterPress?.(cluster.points)}
        >
          <Text style={styles.clusterText}>{cluster.count}</Text>
        </TouchableOpacity>
      </Marker>
    );
  };

  return (
    <>
      {clusters.map((cluster, index) => renderCluster(cluster, index))}
    </>
  );
}

const styles = StyleSheet.create({
  singleMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: AppColors.primary,
    borderWidth: 2,
    borderColor: AppColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  clusterMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    borderWidth: 3,
    borderColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  clusterText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
