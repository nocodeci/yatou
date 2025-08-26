import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRoute from '../components/CustomRoute';
import RouteStyleConfig, { RouteStyle, PREDEFINED_ROUTE_STYLES } from '../components/RouteStyleConfig';
import { AppColors } from '../app/constants/colors';

// Coordonnées d'exemple pour la démonstration
const DEMO_ROUTE_COORDINATES = [
  { latitude: 7.6833, longitude: -5.0333 }, // Bouaké centre
  { latitude: 7.6900, longitude: -5.0300 },
  { latitude: 7.6950, longitude: -5.0250 },
  { latitude: 7.7000, longitude: -5.0200 },
  { latitude: 7.7050, longitude: -5.0150 },
  { latitude: 7.7100, longitude: -5.0100 },
  { latitude: 7.7150, longitude: -5.0050 },
  { latitude: 7.7200, longitude: -5.0000 },
  { latitude: 7.7250, longitude: -4.9950 },
  { latitude: 7.7300, longitude: -4.9900 }, // Destination
];

export default function RouteStylingDemo() {
  const [selectedStyle, setSelectedStyle] = useState<RouteStyle>(PREDEFINED_ROUTE_STYLES[0]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Démonstration des Styles d'Itinéraire</Text>
          <Text style={styles.subtitle}>
            Explorez les différents styles disponibles pour personnaliser vos itinéraires
          </Text>
        </View>

        {/* Configuration des styles */}
        <RouteStyleConfig
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
        />

        {/* Aperçu de l'itinéraire avec le style sélectionné */}
        <View style={styles.routePreview}>
          <Text style={styles.previewTitle}>Aperçu de l'Itinéraire</Text>
          <Text style={styles.previewSubtitle}>
            Style : {selectedStyle.name}
          </Text>
          
          <View style={styles.mapContainer}>
            {/* Simulation d'une carte avec l'itinéraire */}
            <View style={styles.mapSimulation}>
              <CustomRoute
                coordinates={DEMO_ROUTE_COORDINATES}
                strokeColor={selectedStyle.strokeColor}
                strokeWidth={selectedStyle.strokeWidth}
                animated={selectedStyle.animated}
                gradient={selectedStyle.gradient}
                startColor={selectedStyle.startColor}
                endColor={selectedStyle.endColor}
                showDirectionArrows={selectedStyle.showDirectionArrows}
                lineDashPattern={selectedStyle.lineDashPattern}
              />
            </View>
          </View>
        </View>

        {/* Informations détaillées sur le style */}
        <View style={styles.styleDetails}>
          <Text style={styles.detailsTitle}>Détails du Style</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Nom :</Text>
            <Text style={styles.detailValue}>{selectedStyle.name}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Description :</Text>
            <Text style={styles.detailValue}>{selectedStyle.description}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Couleur :</Text>
            <View style={[styles.colorIndicator, { backgroundColor: selectedStyle.strokeColor }]} />
            <Text style={styles.detailValue}>{selectedStyle.strokeColor}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Épaisseur :</Text>
            <Text style={styles.detailValue}>{selectedStyle.strokeWidth}px</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Animé :</Text>
            <Text style={[styles.detailValue, { color: selectedStyle.animated ? AppColors.success : AppColors.error }]}>
              {selectedStyle.animated ? 'Oui' : 'Non'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gradient :</Text>
            <Text style={[styles.detailValue, { color: selectedStyle.gradient ? AppColors.success : AppColors.error }]}>
              {selectedStyle.gradient ? 'Oui' : 'Non'}
            </Text>
          </View>
          
          {selectedStyle.gradient && (
            <>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Couleur début :</Text>
                <View style={[styles.colorIndicator, { backgroundColor: selectedStyle.startColor }]} />
                <Text style={styles.detailValue}>{selectedStyle.startColor}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Couleur fin :</Text>
                <View style={[styles.colorIndicator, { backgroundColor: selectedStyle.endColor }]} />
                <Text style={styles.detailValue}>{selectedStyle.endColor}</Text>
              </View>
            </>
          )}
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Flèches direction :</Text>
            <Text style={[styles.detailValue, { color: selectedStyle.showDirectionArrows ? AppColors.success : AppColors.error }]}>
              {selectedStyle.showDirectionArrows ? 'Oui' : 'Non'}
            </Text>
          </View>
          
          {selectedStyle.lineDashPattern && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Motif pointillés :</Text>
              <Text style={styles.detailValue}>[{selectedStyle.lineDashPattern.join(', ')}]</Text>
            </View>
          )}
        </View>

        {/* Instructions d'utilisation */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📖 Comment Utiliser</Text>
          
          <Text style={styles.instructionText}>
            1. <Text style={styles.bold}>Sélectionnez un style</Text> dans la liste ci-dessus
          </Text>
          
          <Text style={styles.instructionText}>
            2. <Text style={styles.bold}>Observez l'aperçu</Text> de l'itinéraire avec le style choisi
          </Text>
          
          <Text style={styles.instructionText}>
            3. <Text style={styles.bold}>Intégrez dans votre MapView</Text> en remplaçant l'ancien composant Polyline
          </Text>
          
          <Text style={styles.instructionText}>
            4. <Text style={styles.bold}>Personnalisez davantage</Text> en modifiant les propriétés du style
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 20,
    backgroundColor: AppColors.white,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    lineHeight: 22,
  },
  routePreview: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  mapContainer: {
    height: 200,
    backgroundColor: AppColors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mapSimulation: {
    flex: 1,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleDetails: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.textSecondary,
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  instructions: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '600',
    color: AppColors.text,
  },
});
