import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { X, MapPin, Clock, Route } from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';

interface TripDetailsBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  tripData?: {
    origin?: string;
    destination?: string;
    distance?: number;
    duration?: number;
    estimatedPrice?: number;
    routeType?: string;
    trafficLevel?: 'low' | 'medium' | 'high';
    eta?: string;
  };
  onCalculatePrice?: () => void;
}

const { height: screenHeight } = Dimensions.get('window');
const BOTTOM_SHEET_HEIGHT = screenHeight * 0.6;

export default function TripDetailsBottomSheet({ 
  visible, 
  onClose, 
  tripData,
  onCalculatePrice 
}: TripDetailsBottomSheetProps) {
  const [selectedService, setSelectedService] = useState<'delivery' | 'errand' | 'moving'>('delivery');
  const [selectedVehicle, setSelectedVehicle] = useState<'moto' | 'tricycle' | 'cargo' | 'van'>('moto');
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const slideAnim = useRef(new Animated.Value(BOTTOM_SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: BOTTOM_SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const calculatePrice = () => {
    let basePrice = 0;
    let multiplier = 1;

    switch (selectedService) {
      case 'delivery':
        basePrice = 500;
        break;
      case 'errand':
        basePrice = 800;
        break;
      case 'moving':
        basePrice = 2500;
        break;
    }

    switch (selectedVehicle) {
      case 'moto':
        multiplier = 1;
        break;
      case 'tricycle':
        multiplier = 1.3;
        break;
      case 'cargo':
        multiplier = 1.8;
        break;
      case 'van':
        multiplier = 2.5;
        break;
    }

    const distance = tripData?.distance || 5;
    const finalPrice = Math.round((basePrice + (distance * 120)) * multiplier);
    setCalculatedPrice(finalPrice);
  };

  useEffect(() => {
    if (selectedService && selectedVehicle) {
      calculatePrice();
    }
  }, [selectedService, selectedVehicle, tripData]);

  const services = [
    { id: 'delivery', label: 'Livraison', emoji: '📦', desc: 'Colis & documents' },
    { id: 'errand', label: 'Course', emoji: '🛍️', desc: 'Achats & commissions' },
    { id: 'moving', label: 'Transport', emoji: '📋', desc: 'Déménagement' },
  ];

  const vehicles = [
    { id: 'moto', label: 'Moto', emoji: '🏍️', time: '15-25 min', capacity: '10kg' },
    { id: 'tricycle', label: 'Tricycle', emoji: '🛺', time: '20-30 min', capacity: '50kg' },
    { id: 'cargo', label: 'Cargo', emoji: '🚛', time: '25-40 min', capacity: '200kg' },
    { id: 'van', label: 'Fourgon', emoji: '🚐', time: '30-45 min', capacity: '500kg' },
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[styles.backdrop, { opacity: backdropOpacity }]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      <Animated.View 
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Réserver un transport</Text>
            <Text style={styles.subtitle}>Choisissez votre service</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={22} color={AppColors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Trip Info */}
          {tripData && (
            <View style={styles.tripInfo}>
              <View style={styles.routeInfo}>
                <MapPin size={16} color={AppColors.primary} />
                <Text style={styles.routeText}>
                  {tripData.distance ? `${tripData.distance} km` : 'Distance calculée'}
                </Text>
                <Clock size={16} color={AppColors.textSecondary} />
                <Text style={styles.routeText}>
                  {tripData.duration ? `${tripData.duration} min` : '~20 min'}
                </Text>
              </View>
            </View>
          )}

          {/* Services */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de service</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedService === service.id && styles.selectedServiceCard
                  ]}
                  onPress={() => setSelectedService(service.id as any)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.serviceEmoji}>{service.emoji}</Text>
                  <Text style={[
                    styles.serviceLabel,
                    selectedService === service.id && styles.selectedServiceLabel
                  ]}>
                    {service.label}
                  </Text>
                  <Text style={styles.serviceDesc}>{service.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vehicles */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Véhicule</Text>
            <View style={styles.vehiclesContainer}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle.id && styles.selectedVehicleCard
                  ]}
                  onPress={() => setSelectedVehicle(vehicle.id as any)}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                    <View style={styles.vehicleInfo}>
                      <Text style={[
                        styles.vehicleLabel,
                        selectedVehicle === vehicle.id && styles.selectedVehicleLabel
                      ]}>
                        {vehicle.label}
                      </Text>
                      <Text style={styles.vehicleCapacity}>{vehicle.capacity}</Text>
                    </View>
                    <Text style={styles.vehicleTime}>{vehicle.time}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Price Display */}
          {calculatedPrice > 0 && (
            <View style={styles.priceContainer}>
              <View style={styles.priceHeader}>
                <Text style={styles.priceLabel}>Prix estimé</Text>
                <Route size={18} color={AppColors.primary} />
              </View>
              <Text style={styles.priceAmount}>
                {calculatedPrice.toLocaleString()} FCFA
              </Text>
              <Text style={styles.priceNote}>
                Prix final confirmé après validation
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              calculatedPrice === 0 && styles.disabledButton
            ]}
            onPress={onCalculatePrice}
            disabled={calculatedPrice === 0}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.confirmButtonText,
              calculatedPrice === 0 && styles.disabledButtonText
            ]}>
              Confirmer la commande
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: AppColors.overlay,
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: BOTTOM_SHEET_HEIGHT,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: AppColors.borderLight,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: AppColors.textSecondary,
    fontWeight: '400',
  },
  closeButton: {
    padding: 8,
    marginTop: -4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  tripInfo: {
    backgroundColor: AppColors.redSoft,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedServiceCard: {
    backgroundColor: AppColors.redSoft,
    borderColor: AppColors.primary,
  },
  serviceEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  selectedServiceLabel: {
    color: AppColors.primary,
  },
  serviceDesc: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  vehiclesContainer: {
    gap: 12,
  },
  vehicleCard: {
    backgroundColor: AppColors.backgroundTertiary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedVehicleCard: {
    backgroundColor: AppColors.redSoft,
    borderColor: AppColors.primary,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleEmoji: {
    fontSize: 24,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 2,
  },
  selectedVehicleLabel: {
    color: AppColors.primary,
  },
  vehicleCapacity: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  vehicleTime: {
    fontSize: 13,
    color: AppColors.primary,
    fontWeight: '500',
  },
  priceContainer: {
    backgroundColor: AppColors.backgroundSecondary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: AppColors.primary,
  },
  priceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 15,
    color: AppColors.textSecondary,
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: AppColors.primary,
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 13,
    color: AppColors.textLight,
    fontStyle: 'italic',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.borderLight,
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: AppColors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: AppColors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButtonText: {
    color: AppColors.textLight,
  },
});