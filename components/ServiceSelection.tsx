import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/app/constants/colors';
import { 
  YatouPricingCalculator, 
  PricingFactors, 
  PricingResult,
  ServiceType,
  VehicleType,
  WeatherCondition
} from '@/utils/pricingCalculator';

interface ServiceSelectionProps {
  distance: number;
  onServiceSelected: (service: ServiceType, vehicle: VehicleType, price: number) => void;
}

export default function ServiceSelection({ distance, onServiceSelected }: ServiceSelectionProps) {
  const [selectedService, setSelectedService] = useState<ServiceType>('delivery');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('moto');
  const [packageWeight, setPackageWeight] = useState<string>('');
  const [merchandiseValue, setMerchandiseValue] = useState<string>('');
  const [floorNumber, setFloorNumber] = useState<string>('');
  const [roomCount, setRoomCount] = useState<string>('');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('good');
  const [nearestDriverDistance, setNearestDriverDistance] = useState<string>('1');

  const services = [
    { type: 'delivery' as ServiceType, label: 'Livraison de Colis', icon: 'cube-outline' },
    { type: 'errand' as ServiceType, label: 'Course', icon: 'bag-outline' },
    { type: 'moving' as ServiceType, label: 'Déménagement', icon: 'home-outline' },
  ];

  const vehicles = {
    delivery: [
      { type: 'moto' as VehicleType, label: 'Moto', icon: 'bicycle-outline', maxWeight: '4 kg' }
    ],
    errand: [
      { type: 'moto' as VehicleType, label: 'Moto', icon: 'bicycle-outline' },
      { type: 'tricycle' as VehicleType, label: 'Tricycle', icon: 'car-outline' },
      { type: 'cargo' as VehicleType, label: 'Cargo', icon: 'car-sport-outline' }
    ],
    moving: [
      { type: 'tricycle' as VehicleType, label: 'Tricycle', icon: 'car-outline' },
      { type: 'van' as VehicleType, label: 'Fourgonnette/Camion', icon: 'car-outline' }
    ]
  };

  const calculatePrice = (): PricingResult | null => {
    try {
      const factors: PricingFactors = {
        distance,
        serviceType: selectedService,
        vehicleType: selectedVehicle,
        time: new Date(),
        nearestDriverDistance: parseFloat(nearestDriverDistance) || 1,
        weatherCondition,
        packageWeight: parseFloat(packageWeight) || undefined,
        merchandiseValue: parseFloat(merchandiseValue) || undefined,
        floorNumber: parseFloat(floorNumber) || undefined,
        roomCount: parseFloat(roomCount) || undefined,
      };

      return YatouPricingCalculator.calculatePrice(factors);
    } catch (error) {
      console.error('Erreur lors du calcul du prix:', error);
      return null;
    }
  };

  const handleServiceSelect = () => {
    const pricing = calculatePrice();
    if (pricing) {
      onServiceSelected(selectedService, selectedVehicle, pricing.totalPrice);
    } else {
      Alert.alert('Erreur', 'Impossible de calculer le prix');
    }
  };

  const pricing = calculatePrice();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Sélection du service */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚚 Type de Service</Text>
        <View style={styles.serviceGrid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.type}
              style={[
                styles.serviceCard,
                selectedService === service.type && styles.selectedServiceCard
              ]}
              onPress={() => setSelectedService(service.type)}
            >
              <Ionicons 
                name={service.icon as any} 
                size={24} 
                color={selectedService === service.type ? AppColors.white : AppColors.primary} 
              />
              <Text style={[
                styles.serviceLabel,
                selectedService === service.type && styles.selectedServiceLabel
              ]}>
                {service.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sélection du véhicule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚗 Type de Véhicule</Text>
        <View style={styles.vehicleGrid}>
          {vehicles[selectedService]?.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.type}
              style={[
                styles.vehicleCard,
                selectedVehicle === vehicle.type && styles.selectedVehicleCard
              ]}
              onPress={() => setSelectedVehicle(vehicle.type)}
            >
              <Ionicons 
                name={vehicle.icon as any} 
                size={24} 
                color={selectedVehicle === vehicle.type ? AppColors.white : AppColors.primary} 
              />
              <Text style={[
                styles.vehicleLabel,
                selectedVehicle === vehicle.type && styles.selectedVehicleLabel
              ]}>
                {vehicle.label}
              </Text>
              {vehicle.maxWeight && (
                <Text style={[
                  styles.vehicleDetail,
                  selectedVehicle === vehicle.type && styles.selectedVehicleDetail
                ]}>
                  Max: {vehicle.maxWeight}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Paramètres spécifiques au service */}
      {selectedService === 'delivery' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Détails du Colis</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Poids du colis (kg)</Text>
            <TextInput
              style={styles.input}
              value={packageWeight}
              onChangeText={setPackageWeight}
              placeholder="Ex: 2.5"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {selectedService === 'errand' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛒 Détails de la Course</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Valeur de la marchandise (FCFA)</Text>
            <TextInput
              style={styles.input}
              value={merchandiseValue}
              onChangeText={setMerchandiseValue}
              placeholder="Ex: 5000"
              keyboardType="numeric"
            />
          </View>
        </View>
      )}

      {selectedService === 'moving' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Détails du Déménagement</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Étage</Text>
              <TextInput
                style={styles.input}
                value={floorNumber}
                onChangeText={setFloorNumber}
                placeholder="Ex: 2"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de pièces</Text>
              <TextInput
                style={styles.input}
                value={roomCount}
                onChangeText={setRoomCount}
                placeholder="Ex: 3"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      )}

      {/* Conditions environnementales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌤️ Conditions</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Distance du livreur le plus proche (km)</Text>
          <TextInput
            style={styles.input}
            value={nearestDriverDistance}
            onChangeText={setNearestDriverDistance}
            placeholder="Ex: 1.5"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.weatherContainer}>
          <Text style={styles.inputLabel}>Conditions météo</Text>
          <View style={styles.weatherButtons}>
            <TouchableOpacity
              style={[
                styles.weatherButton,
                weatherCondition === 'good' && styles.selectedWeatherButton
              ]}
              onPress={() => setWeatherCondition('good')}
            >
              <Ionicons name="sunny" size={20} color={weatherCondition === 'good' ? AppColors.white : AppColors.success} />
              <Text style={[
                styles.weatherButtonText,
                weatherCondition === 'good' && styles.selectedWeatherButtonText
              ]}>
                Bonnes
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.weatherButton,
                weatherCondition === 'bad' && styles.selectedWeatherButton
              ]}
              onPress={() => setWeatherCondition('bad')}
            >
              <Ionicons name="rainy" size={20} color={weatherCondition === 'bad' ? AppColors.white : AppColors.error} />
              <Text style={[
                styles.weatherButtonText,
                weatherCondition === 'bad' && styles.selectedWeatherButtonText
              ]}>
                Mauvaises
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Résultat du calcul */}
      {pricing && (
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>💰 Estimation du Prix</Text>
          
          <View style={styles.pricingCard}>
            <View style={styles.pricingHeader}>
              <Text style={styles.pricingTitle}>Prix Total</Text>
              <Text style={styles.pricingAmount}>{pricing.totalPrice.toLocaleString()} FCFA</Text>
            </View>
            
            <View style={styles.pricingDetails}>
              <Text style={styles.pricingSubtitle}>Détail du calcul :</Text>
              {pricing.breakdown.map((item, index) => (
                <Text key={index} style={styles.pricingBreakdown}>• {item}</Text>
              ))}
            </View>
            
            <View style={styles.pricingFooter}>
              <Text style={styles.estimatedTime}>⏱️ Temps estimé : {pricing.estimatedTime}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Bouton de confirmation */}
      <TouchableOpacity 
        style={styles.confirmButton} 
        onPress={handleServiceSelect}
        disabled={!pricing}
      >
        <Text style={styles.confirmButtonText}>
          Confirmer ce Service
        </Text>
        {pricing && (
          <Text style={styles.confirmButtonPrice}>
            {pricing.totalPrice.toLocaleString()} FCFA
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  section: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  serviceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  serviceCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  selectedServiceCard: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedServiceLabel: {
    color: AppColors.white,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 12,
  },
  vehicleCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  selectedVehicleCard: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  vehicleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedVehicleLabel: {
    color: AppColors.white,
  },
  vehicleDetail: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  selectedVehicleDetail: {
    color: AppColors.white,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: AppColors.white,
  },
  weatherContainer: {
    marginTop: 16,
  },
  weatherButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  weatherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: AppColors.surface,
    borderWidth: 2,
    borderColor: 'transparent',
    flex: 1,
    justifyContent: 'center',
  },
  selectedWeatherButton: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  weatherButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginLeft: 8,
  },
  selectedWeatherButtonText: {
    color: AppColors.white,
  },
  pricingSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pricingCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 12,
    padding: 20,
  },
  pricingHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  pricingDetails: {
    marginBottom: 20,
  },
  pricingSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 12,
  },
  pricingBreakdown: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  pricingFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  estimatedTime: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
    marginBottom: 8,
  },
  confirmButtonPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.white,
  },
});
