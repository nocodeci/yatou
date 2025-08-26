import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomRoute from '../components/CustomRoute';
import ColorPicker from '../components/ColorPicker';
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

export default function DynamicColorsDemo() {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [deliveryStatus, setDeliveryStatus] = useState('pending');
  const [deliveryPriority, setDeliveryPriority] = useState('medium');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [distance, setDistance] = useState(15);
  const [trafficLevel, setTrafficLevel] = useState<'low' | 'medium' | 'high'>('medium');

  const statusOptions = [
    { key: 'pending', label: 'En Attente', color: '#FFA500' },
    { key: 'confirmed', label: 'Confirmé', color: '#4169E1' },
    { key: 'picked_up', label: 'Ramassé', color: '#32CD32' },
    { key: 'in_transit', label: 'En Transit', color: '#FFD700' },
    { key: 'delivered', label: 'Livré', color: '#00FF00' },
    { key: 'cancelled', label: 'Annulé', color: '#FF0000' },
  ];

  const priorityOptions = [
    { key: 'high', label: 'Haute', color: '#FF0000' },
    { key: 'medium', label: 'Moyenne', color: '#FFA500' },
    { key: 'low', label: 'Basse', color: '#00FF00' },
  ];

  const typeOptions = [
    { key: 'express', label: 'Express', color: '#FF1493' },
    { key: 'standard', label: 'Standard', color: '#4169E1' },
    { key: 'economy', label: 'Économique', color: '#32CD32' },
    { key: 'premium', label: 'Premium', color: '#FFD700' },
  ];

  const trafficOptions = [
    { key: 'low', label: 'Faible', color: '#00FF00' },
    { key: 'medium', label: 'Moyen', color: '#FFA500' },
    { key: 'high', label: 'Élevé', color: '#FF0000' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🎨 Couleurs Dynamiques des Itinéraires</Text>
          <Text style={styles.subtitle}>
            Découvrez comment les couleurs changent automatiquement selon différents critères
          </Text>
        </View>

        {/* Sélecteur de couleurs personnalisées */}
        <ColorPicker
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          title="Couleur Personnalisée"
        />

        {/* Contrôles pour les couleurs dynamiques */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>🎯 Couleurs selon le Statut</Text>
          <View style={styles.optionsGrid}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color },
                  deliveryStatus === option.key && styles.selectedOption
                ]}
                onPress={() => setDeliveryStatus(option.key)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>⚡ Couleurs selon la Priorité</Text>
          <View style={styles.optionsGrid}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color },
                  deliveryPriority === option.key && styles.selectedOption
                ]}
                onPress={() => setDeliveryPriority(option.key)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>🚚 Couleurs selon le Type</Text>
          <View style={styles.optionsGrid}>
            {typeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color },
                  deliveryType === option.key && styles.selectedOption
                ]}
                onPress={() => setDeliveryType(option.key)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>🚦 Couleurs selon le Trafic</Text>
          <View style={styles.optionsGrid}>
            {trafficOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.optionButton,
                  { backgroundColor: option.color },
                  trafficLevel === option.key && styles.selectedOption
                ]}
                onPress={() => setTrafficLevel(option.key as 'low' | 'medium' | 'high')}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>📏 Couleurs selon la Distance</Text>
          <View style={styles.distanceControl}>
            <Text style={styles.distanceLabel}>Distance: {distance} km</Text>
            <View style={styles.distanceButtons}>
              <TouchableOpacity
                style={[styles.distanceButton, distance < 5 && styles.activeDistance]}
                onPress={() => setDistance(3)}
              >
                <Text style={styles.distanceButtonText}>Court</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.distanceButton, distance >= 5 && distance < 20 && styles.activeDistance]}
                onPress={() => setDistance(15)}
              >
                <Text style={styles.distanceButtonText}>Moyen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.distanceButton, distance >= 20 && styles.activeDistance]}
                onPress={() => setDistance(25)}
              >
                <Text style={styles.distanceButtonText}>Long</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Aperçu de l'itinéraire avec couleurs dynamiques */}
        <View style={styles.routePreview}>
          <Text style={styles.previewTitle}>Aperçu de l'Itinéraire</Text>
          <Text style={styles.previewSubtitle}>
            Couleur dynamique basée sur les critères sélectionnés
          </Text>
          
          <View style={styles.mapContainer}>
            <View style={styles.mapSimulation}>
              <CustomRoute
                coordinates={DEMO_ROUTE_COORDINATES}
                strokeColor={selectedColor}
                strokeWidth={8}
                animated={true}
                showDirectionArrows={true}
                deliveryStatus={deliveryStatus}
                deliveryPriority={deliveryPriority}
                deliveryType={deliveryType}
                distance={distance}
                trafficLevel={trafficLevel}
              />
            </View>
          </View>
        </View>

        {/* Informations sur la couleur actuelle */}
        <View style={styles.colorInfo}>
          <Text style={styles.colorInfoTitle}>Informations sur la Couleur</Text>
          
          <View style={styles.colorInfoGrid}>
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Couleur personnalisée :</Text>
              <View style={[styles.colorIndicator, { backgroundColor: selectedColor }]} />
              <Text style={styles.colorInfoValue}>{selectedColor}</Text>
            </View>
            
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Statut :</Text>
              <Text style={styles.colorInfoValue}>{deliveryStatus}</Text>
            </View>
            
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Priorité :</Text>
              <Text style={styles.colorInfoValue}>{deliveryPriority}</Text>
            </View>
            
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Type :</Text>
              <Text style={styles.colorInfoValue}>{deliveryType}</Text>
            </View>
            
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Distance :</Text>
              <Text style={styles.colorInfoValue}>{distance} km</Text>
            </View>
            
            <View style={styles.colorInfoItem}>
              <Text style={styles.colorInfoLabel}>Trafic :</Text>
              <Text style={styles.colorInfoValue}>{trafficLevel}</Text>
            </View>
          </View>
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
  controlsSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: AppColors.white,
    borderWidth: 3,
  },
  optionText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  distanceControl: {
    alignItems: 'center',
  },
  distanceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  distanceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  distanceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    borderWidth: 2,
    borderColor: AppColors.border,
  },
  activeDistance: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  distanceButtonText: {
    color: AppColors.text,
    fontSize: 14,
    fontWeight: '600',
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
  colorInfo: {
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
  colorInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  colorInfoGrid: {
    gap: 12,
  },
  colorInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colorInfoLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    width: 120,
  },
  colorInfoValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '500',
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
});
