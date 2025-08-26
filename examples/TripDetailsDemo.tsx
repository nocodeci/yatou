import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import TripDetailsBottomSheet from '../components/TripDetailsBottomSheet';
import { AppColors } from '../app/constants/colors';

export default function TripDetailsDemo() {
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // Données de démonstration pour le trajet
  const demoTripData = {
    origin: 'Bouaké Centre, Côte d\'Ivoire',
    destination: 'Université Alassane Ouattara, Bouaké',
    distance: '8.5 km',
    duration: '15 min',
    estimatedPrice: '2 500 FCFA',
    routeType: 'driving' as const,
    trafficLevel: 'medium' as const,
    eta: '14:30',
  };

  const openBottomSheet = () => {
    setIsBottomSheetVisible(true);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Détails du Trajet</Text>
        <Text style={styles.subtitle}>
          Testez le bottom sheet moderne style Uber
        </Text>
      </View>

      <View style={styles.content}>
        {/* Carte d'aperçu du trajet */}
        <View style={styles.tripPreviewCard}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>Trajet de Démonstration</Text>
            <Text style={styles.tripSubtitle}>Bouaké Centre → Université</Text>
          </View>

          <View style={styles.tripStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{demoTripData.duration}</Text>
              <Text style={styles.statLabel}>Durée</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{demoTripData.distance}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{demoTripData.estimatedPrice}</Text>
              <Text style={styles.statLabel}>Prix estimé</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.openButton} onPress={openBottomSheet}>
            <Text style={styles.openButtonText}>Voir les Détails Complets</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>📱 Comment utiliser :</Text>
          <Text style={styles.instructionsText}>
            • Appuyez sur "Voir les Détails Complets" pour ouvrir le bottom sheet
          </Text>
          <Text style={styles.instructionsText}>
            • Glissez vers le haut/bas pour changer la taille
          </Text>
          <Text style={styles.instructionsText}>
            • Glissez vers le bas pour fermer
          </Text>
          <Text style={styles.instructionsText}>
            • Explorez les différentes sections du bottom sheet
          </Text>
        </View>

        {/* Fonctionnalités */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>✨ Fonctionnalités :</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Résumé du trajet avec statistiques</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Détails de l'itinéraire (origine/destination)</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚦</Text>
            <Text style={styles.featureText}>Informations sur le trafic et le transport</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Actions rapides (partager, sauvegarder)</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎨</Text>
            <Text style={styles.featureText}>Design moderne et responsive</Text>
          </View>
        </View>
      </View>

      {/* Bottom Sheet des détails du trajet */}
      <TripDetailsBottomSheet
        isVisible={isBottomSheetVisible}
        onClose={closeBottomSheet}
        tripData={demoTripData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    padding: 20,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  tripPreviewCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripHeader: {
    marginBottom: 20,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  tripSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: AppColors.border,
  },
  openButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  openButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  instructionsText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
  },
  featureText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});
