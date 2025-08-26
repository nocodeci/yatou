import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import CacheManager from '../utils/cacheManager';

interface CacheStatsProps {
  visible?: boolean;
}

const CacheStats: React.FC<CacheStatsProps> = ({ visible = false }) => {
  const [stats, setStats] = useState({ geocodes: 0, routes: 0 });
  const [savings, setSavings] = useState({ requests: 0, cost: 0 });

  useEffect(() => {
    if (visible) {
      loadStats();
    }
  }, [visible]);

  const loadStats = async () => {
    const cacheStats = await CacheManager.getCacheStats();
    setStats(cacheStats);
    
    // Calculer les économies (estimation)
    // Chaque requête Google Maps coûte environ $0.005
    const estimatedSavings = (cacheStats.geocodes + cacheStats.routes) * 0.005;
    setSavings({
      requests: cacheStats.geocodes + cacheStats.routes,
      cost: estimatedSavings
    });
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Optimisations Google Maps</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Géocodages en cache</Text>
          <Text style={styles.statValue}>{stats.geocodes}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Itinéraires en cache</Text>
          <Text style={styles.statValue}>{stats.routes}</Text>
        </View>
      </View>
      
      <View style={styles.savingsContainer}>
        <Text style={styles.savingsTitle}>💰 Économies estimées</Text>
        <Text style={styles.savingsText}>
          {savings.requests} requêtes évitées
        </Text>
        <Text style={styles.savingsCost}>
          ~${savings.cost.toFixed(2)} économisés
        </Text>
      </View>
      
      <TouchableOpacity style={styles.refreshButton} onPress={loadStats}>
        <Text style={styles.refreshText}>🔄 Actualiser</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  savingsContainer: {
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  savingsText: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 2,
  },
  savingsCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    padding: 8,
    alignItems: 'center',
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default CacheStats;
