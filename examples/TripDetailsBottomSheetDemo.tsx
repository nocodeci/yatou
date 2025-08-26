import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { AppColors } from '@/app/constants/colors';
import TripDetailsBottomSheet from '@/components/TripDetailsBottomSheet';

export default function TripDetailsBottomSheetDemo() {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Données de trajet de démonstration
  const demoTripData = {
    origin: 'Bouaké, Centre',
    destination: 'Yamoussoukro, Centre',
    distance: 45.2,
    duration: 65,
    estimatedPrice: 2500,
    routeType: 'Express',
    trafficLevel: 'medium' as const,
    eta: '14:30',
  };

  const handleCalculatePrice = () => {
    Alert.alert(
      'Calcul de Prix YATOU',
      'Redirection vers le calculateur de prix...',
      [{ text: 'OK' }]
    );
  };

  const handleClose = () => {
    setShowBottomSheet(false);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>🚚 Composant TripDetailsBottomSheet</Text>
        <Text style={styles.subtitle}>
          Démonstration du bottom sheet complet pour les détails de trajet
        </Text>
      </View>

      {/* Informations sur le composant */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>📋 Description du Composant</Text>
        <Text style={styles.infoDescription}>
          Le composant TripDetailsBottomSheet est un bottom sheet complet qui affiche tous les détails d'un trajet YATOU, 
          incluant la grille tarifaire, la sélection de services, et la configuration des options.
        </Text>
      </View>

      {/* Fonctionnalités principales */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>✨ Fonctionnalités Principales</Text>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📍</Text>
          <View style={styles.featureDetails}>
            <Text style={styles.featureName}>Détails du Trajet</Text>
            <Text style={styles.featureDescription}>
              Affichage complet des informations de départ, arrivée, distance, durée et trafic
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>💰</Text>
          <View style={styles.featureDetails}>
            <Text style={styles.featureName}>Grille Tarifaire YATOU</Text>
            <Text style={styles.featureDescription}>
              Intégration complète de la grille tarifaire avec tous les services
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>⚙️</Text>
          <View style={styles.featureDetails}>
            <Text style={styles.featureName}>Configuration des Services</Text>
            <Text style={styles.featureDescription}>
              Sélection de service, véhicule et calcul de prix en temps réel
            </Text>
          </View>
        </View>
        
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📱</Text>
          <View style={styles.featureDetails}>
            <Text style={styles.featureName}>Interface Uber-like</Text>
            <Text style={styles.featureDescription}>
              Design moderne avec animations fluides et interactions intuitives
            </Text>
          </View>
        </View>
      </View>

      {/* Données de démonstration */}
      <View style={styles.demoDataSection}>
        <Text style={styles.demoDataTitle}>📊 Données de Démonstration</Text>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Départ :</Text>
          <Text style={styles.dataValue}>{demoTripData.origin}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Arrivée :</Text>
          <Text style={styles.dataValue}>{demoTripData.destination}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Distance :</Text>
          <Text style={styles.dataValue}>{demoTripData.distance} km</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Durée :</Text>
          <Text style={styles.dataValue}>{demoTripData.duration} min</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Type de Route :</Text>
          <Text style={styles.dataValue}>{demoTripData.routeType}</Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>Niveau de Trafic :</Text>
          <Text style={styles.dataValue}>
            {demoTripData.trafficLevel === 'high' ? 'Élevé' : 
             demoTripData.trafficLevel === 'medium' ? 'Modéré' : 'Faible'}
          </Text>
        </View>
        
        <View style={styles.dataItem}>
          <Text style={styles.dataLabel}>ETA :</Text>
          <Text style={styles.dataValue}>{demoTripData.eta}</Text>
        </View>
      </View>

      {/* Bouton de démonstration */}
      <View style={styles.demoSection}>
        <TouchableOpacity 
          style={styles.demoButton}
          onPress={() => setShowBottomSheet(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.demoButtonText}>
            🚀 Ouvrir le Bottom Sheet de Trajet
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.demoInstructions}>
          Appuyez sur le bouton ci-dessus pour voir le bottom sheet en action avec les données de démonstration
        </Text>
      </View>

      {/* Utilisation du composant */}
      <View style={styles.usageSection}>
        <Text style={styles.usageTitle}>💡 Utilisation du Composant</Text>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>🏠</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Écran Principal</Text>
            <Text style={styles.usageDescription}>
              Affichage des détails de trajet après calcul d'itinéraire
            </Text>
          </View>
        </View>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>🗺️</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Carte Interactive</Text>
            <Text style={styles.usageDescription}>
              Bottom sheet qui s'ouvre depuis la carte avec les informations de route
            </Text>
          </View>
        </View>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>📱</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Sélection de Service</Text>
            <Text style={styles.usageDescription}>
              Interface pour choisir le type de service et véhicule
            </Text>
          </View>
        </View>
      </View>

      {/* Props du composant */}
      <View style={styles.propsSection}>
        <Text style={styles.propsTitle}>🔧 Props du Composant</Text>
        
        <View style={styles.propItem}>
          <Text style={styles.propName}>visible</Text>
          <Text style={styles.propType}>boolean</Text>
          <Text style={styles.propDescription}>
            Contrôle la visibilité du bottom sheet
          </Text>
        </View>
        
        <View style={styles.propItem}>
          <Text style={styles.propName}>onClose</Text>
          <Text style={styles.propType}>() => void</Text>
          <Text style={styles.propDescription}>
            Callback appelé lors de la fermeture
          </Text>
        </View>
        
        <View style={styles.propItem}>
          <Text style={styles.propName}>tripData</Text>
          <Text style={styles.propType}>TripData</Text>
          <Text style={styles.propDescription}>
            Données du trajet (origine, destination, distance, etc.)
          </Text>
        </View>
        
        <View style={styles.propItem}>
          <Text style={styles.propName}>onCalculatePrice</Text>
          <Text style={styles.propType}>() => void</Text>
          <Text style={styles.propDescription}>
            Callback pour le calcul de prix
          </Text>
        </View>
      </View>

      {/* Bottom Sheet de démonstration */}
      <TripDetailsBottomSheet
        visible={showBottomSheet}
        onClose={handleClose}
        tripData={demoTripData}
        onCalculatePrice={handleCalculatePrice}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: AppColors.white,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  featuresSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureDetails: {
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  demoDataSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  demoDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  dataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  dataLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '600',
  },
  demoSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  demoButton: {
    backgroundColor: AppColors.primary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 16,
  },
  demoButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  demoInstructions: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  usageSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  usageDetails: {
    flex: 1,
  },
  usageName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  usageDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  propsSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  propsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  propItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  propName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
    marginBottom: 4,
  },
  propType: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  propDescription: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
  },
});
