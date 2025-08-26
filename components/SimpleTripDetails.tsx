import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/app/constants/colors';
import { YatouPricingCalculator, PricingFactors, ServiceType, VehicleType } from '@/utils/pricingCalculator';
import ServiceSelection from './ServiceSelection';

const { height: screenHeight } = Dimensions.get('window');

interface SimpleTripDetailsProps {
  isVisible: boolean;
  onClose: () => void;
  tripData: {
    origin: string;
    destination: string;
    distance: string;
    duration: string;
    estimatedPrice?: string;
    routeType: 'driving' | 'walking' | 'transit';
    trafficLevel?: 'low' | 'medium' | 'high';
    eta?: string;
  };
}

export default function SimpleTripDetails({ isVisible, onClose, tripData }: SimpleTripDetailsProps) {
  const [slideAnim] = useState(new Animated.Value(screenHeight));
  const [showPricing, setShowPricing] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceType>('delivery');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('moto');
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const getTrafficIcon = (level?: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low':
        return { icon: 'checkmark-circle', color: AppColors.success, text: 'Trafic fluide' };
      case 'medium':
        return { icon: 'alert-circle', color: AppColors.warning, text: 'Trafic modéré' };
      case 'high':
        return { icon: 'close-circle', color: AppColors.error, text: 'Trafic dense' };
      default:
        return { icon: 'information-circle', color: AppColors.textSecondary, text: 'Trafic normal' };
    }
  };

  const getRouteTypeIcon = (type: 'driving' | 'walking' | 'transit') => {
    switch (type) {
      case 'driving':
        return { icon: 'car', color: AppColors.primary, text: 'En voiture' };
      case 'walking':
        return { icon: 'footsteps', color: AppColors.success, text: 'À pied' };
      case 'transit':
        return { icon: 'bus', color: AppColors.secondary, text: 'Transport public' };
      default:
        return { icon: 'car', color: AppColors.primary, text: 'En voiture' };
    }
  };

  const handleServiceSelection = (service: ServiceType, vehicle: VehicleType, price: number) => {
    setSelectedService(service);
    setSelectedVehicle(vehicle);
    setCalculatedPrice(price);
    setShowPricing(false);
  };

  const calculateYatouPrice = () => {
    // Extraire la distance en km depuis tripData.distance
    const distanceMatch = tripData.distance.match(/(\d+(?:,\d+)?)/);
    const distance = distanceMatch ? parseFloat(distanceMatch[1].replace(',', '.')) : 0;
    
    if (distance === 0) return;

    const factors: PricingFactors = {
      distance,
      serviceType: selectedService,
      vehicleType: selectedVehicle,
      time: new Date(),
      nearestDriverDistance: 1.5, // Distance moyenne du livreur
      weatherCondition: 'good',
    };

    const pricing = YatouPricingCalculator.calculatePrice(factors);
    if (pricing) {
      setCalculatedPrice(pricing.totalPrice);
    }
  };

  const getServiceIcon = (service: ServiceType) => {
    switch (service) {
      case 'delivery': return 'cube-outline';
      case 'errand': return 'bag-outline';
      case 'moving': return 'home-outline';
      default: return 'car-outline';
    }
  };

  const getVehicleIcon = (vehicle: VehicleType) => {
    switch (vehicle) {
      case 'moto': return 'bicycle-outline';
      case 'tricycle': return 'car-outline';
      case 'cargo': return 'car-sport-outline';
      case 'van': return 'car-outline';
      default: return 'car-outline';
    }
  };

  const getServiceLabel = (service: ServiceType) => {
    switch (service) {
      case 'delivery': return 'Livraison de Colis';
      case 'errand': return 'Course';
      case 'moving': return 'Déménagement';
      default: return 'Service';
    }
  };

  const getVehicleLabel = (vehicle: VehicleType) => {
    switch (vehicle) {
      case 'moto': return 'Moto';
      case 'tricycle': return 'Tricycle';
      case 'cargo': return 'Cargo';
      case 'van': return 'Fourgonnette';
      default: return 'Véhicule';
    }
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <Animated.View 
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Handle indicator */}
          <View style={styles.handleIndicator} />
          
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Détails du Trajet</Text>
              <Text style={styles.subtitle}>Informations complètes sur votre itinéraire</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <Ionicons name="map" size={24} color={AppColors.primary} />
                <Text style={styles.summaryTitle}>Résumé du Trajet</Text>
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={20} color={AppColors.textSecondary} />
                  <Text style={styles.statValue}>{tripData.duration}</Text>
                  <Text style={styles.statLabel}>Durée</Text>
                </View>
                
                <View style={styles.statDivider} />
                
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={20} color={AppColors.textSecondary} />
                  <Text style={styles.statValue}>{tripData.distance}</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
                
                {tripData.estimatedPrice && (
                  <>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                      <Ionicons name="card-outline" size={20} color={AppColors.textSecondary} />
                      <Text style={styles.statValue}>{tripData.estimatedPrice}</Text>
                      <Text style={styles.statLabel}>Prix estimé</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Route Details */}
            <View style={styles.routeDetailsCard}>
              <Text style={styles.cardTitle}>Détails de l'Itinéraire</Text>
              
              {/* Origin */}
              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color={AppColors.success} />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Départ</Text>
                  <Text style={styles.locationText}>{tripData.origin}</Text>
                </View>
              </View>

              {/* Connection Line */}
              <View style={styles.connectionLine}>
                <View style={styles.connectionDot} />
                <View style={styles.connectionLineInner} />
                <View style={styles.connectionDot} />
              </View>

              {/* Destination */}
              <View style={styles.locationItem}>
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color={AppColors.error} />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationLabel}>Arrivée</Text>
                  <Text style={styles.locationText}>{tripData.destination}</Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Informations Supplémentaires</Text>
              
              <View style={styles.infoGrid}>
                {/* Route Type */}
                <View style={styles.infoItem}>
                  <View style={[styles.infoIcon, { backgroundColor: getRouteTypeIcon(tripData.routeType).color + '20' }]}>
                    <Ionicons 
                      name={getRouteTypeIcon(tripData.routeType).icon as any} 
                      size={20} 
                      color={getRouteTypeIcon(tripData.routeType).color} 
                    />
                  </View>
                  <Text style={styles.infoLabel}>{getRouteTypeIcon(tripData.routeType).text}</Text>
                </View>

                {/* Traffic Level */}
                <View style={styles.infoItem}>
                  <View style={[styles.infoIcon, { backgroundColor: getTrafficIcon(tripData.trafficLevel).color + '20' }]}>
                    <Ionicons 
                      name={getTrafficIcon(tripData.trafficLevel).icon as any} 
                      size={20} 
                      color={getTrafficIcon(tripData.trafficLevel).color} 
                    />
                  </View>
                  <Text style={styles.infoLabel}>{getTrafficIcon(tripData.trafficLevel).text}</Text>
                </View>

                {/* ETA */}
                {tripData.eta && (
                  <View style={styles.infoItem}>
                    <View style={[styles.infoIcon, { backgroundColor: AppColors.primary + '20' }]}>
                      <Ionicons name="time" size={20} color={AppColors.primary} />
                    </View>
                    <Text style={styles.infoLabel}>Arrivée: {tripData.eta}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* YATOU Services Overview */}
            <View style={styles.servicesOverviewCard}>
              <Text style={styles.cardTitle}>🚚 Services YATOU</Text>
              
              {/* Services Disponibles */}
              <View style={styles.servicesSection}>
                <Text style={styles.sectionSubtitle}>Services Disponibles :</Text>
                
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceIcon}>📦</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>Livraison de Colis</Text>
                    <Text style={styles.serviceDescription}>Moto (max 4kg)</Text>
                  </View>
                </View>
                
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceIcon}>🛒</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>Course</Text>
                    <Text style={styles.serviceDescription}>Moto, Tricycle, Cargo</Text>
                  </View>
                </View>
                
                <View style={styles.serviceItem}>
                  <Text style={styles.serviceIcon}>🏠</Text>
                  <View style={styles.serviceDetails}>
                    <Text style={styles.serviceName}>Déménagement</Text>
                    <Text style={styles.serviceDescription}>Tricycle, Fourgonnette/Camion</Text>
                  </View>
                </View>
              </View>

              {/* Calculs Intelligents */}
              <View style={styles.calculationsSection}>
                <Text style={styles.sectionSubtitle}>Calculs Intelligents :</Text>
                
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationIcon}>💰</Text>
                  <Text style={styles.calculationText}>Prix de base selon service et véhicule</Text>
                </View>
                
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationIcon}>📏</Text>
                  <Text style={styles.calculationText}>Suppléments distance (après 2km)</Text>
                </View>
                
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationIcon}>⏰</Text>
                  <Text style={styles.calculationText}>Ajustements horaires (après 20h)</Text>
                </View>
                
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationIcon}>🌤️</Text>
                  <Text style={styles.calculationText}>Suppléments météo (mauvaises conditions)</Text>
                </View>
                
                <View style={styles.calculationItem}>
                  <Text style={styles.calculationIcon}>🏢</Text>
                  <Text style={styles.calculationText}>Suppléments déménagement (étage, pièces)</Text>
                </View>
              </View>

              {/* Plans d'Abonnement */}
              <View style={styles.subscriptionsSection}>
                <Text style={styles.sectionSubtitle}>Plans d'Abonnement :</Text>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.subscriptionIcon}>👥</Text>
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionName}>Particuliers</Text>
                    <Text style={styles.subscriptionDescription}>Express, Flex, Premium</Text>
                  </View>
                </View>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.subscriptionIcon}>🏢</Text>
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionName}>Entreprises</Text>
                    <Text style={styles.subscriptionDescription}>Pro, Pro Plus, Unlimited</Text>
                  </View>
                </View>
                
                <View style={styles.subscriptionItem}>
                  <Text style={styles.subscriptionIcon}>🛒</Text>
                  <View style={styles.subscriptionDetails}>
                    <Text style={styles.subscriptionName}>E-commerce</Text>
                    <Text style={styles.subscriptionDescription}>E-Start, E-Plus, E-Premium</Text>
                  </View>
                </View>
              </View>

              {/* Bouton d'Action */}
              <TouchableOpacity 
                style={styles.exploreServicesButton}
                onPress={() => setShowPricing(true)}
              >
                <Text style={styles.exploreServicesButtonText}>
                  🚀 Explorer nos Services
                </Text>
              </TouchableOpacity>
            </View>

            {/* YATOU Pricing Section */}
            <View style={styles.pricingCard}>
              <Text style={styles.cardTitle}>💰 Calcul de Prix</Text>
              
              {!showPricing ? (
                <View style={styles.pricingPreview}>
                  <View style={styles.servicePreview}>
                    <View style={styles.serviceIcon}>
                      <Ionicons name={getServiceIcon(selectedService)} size={24} color={AppColors.primary} />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{getServiceLabel(selectedService)}</Text>
                      <Text style={styles.vehicleName}>{getVehicleLabel(selectedVehicle)}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.changeServiceButton}
                      onPress={() => setShowPricing(true)}
                    >
                      <Text style={styles.changeServiceButtonText}>Changer</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {calculatedPrice > 0 && (
                    <View style={styles.priceDisplay}>
                      <Text style={styles.priceLabel}>Prix YATOU :</Text>
                      <Text style={styles.priceAmount}>{calculatedPrice.toLocaleString()} FCFA</Text>
                    </View>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.calculatePriceButton}
                    onPress={calculateYatouPrice}
                  >
                    <Text style={styles.calculatePriceButtonText}>
                      Calculer le Prix YATOU
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ServiceSelection 
                  distance={parseFloat(tripData.distance.replace(/[^\d.,]/g, '').replace(',', '.')) || 0}
                  onServiceSelected={handleServiceSelection}
                />
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.cardTitle}>Actions Rapides</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-outline" size={20} color={AppColors.primary} />
                  <Text style={styles.actionButtonText}>Partager</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="bookmark-outline" size={20} color={AppColors.primary} />
                  <Text style={styles.actionButtonText}>Sauvegarder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="refresh-outline" size={20} color={AppColors.primary} />
                  <Text style={styles.actionButtonText}>Actualiser</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: AppColors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: AppColors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginLeft: 12,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: AppColors.border,
  },
  routeDetailsCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: '500',
  },
  connectionLine: {
    alignItems: 'center',
    marginVertical: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.border,
  },
  connectionLineInner: {
    width: 2,
    height: 20,
    backgroundColor: AppColors.border,
    marginVertical: 4,
  },
  infoCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: AppColors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: AppColors.surface,
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 12,
    color: AppColors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  pricingCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  pricingPreview: {
    gap: 16,
  },
  servicePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.surface,
    padding: 16,
    borderRadius: 12,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: AppColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  changeServiceButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeServiceButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  priceDisplay: {
    backgroundColor: AppColors.success + '20',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.success,
  },
  calculatePriceButton: {
    backgroundColor: AppColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  calculatePriceButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  servicesOverviewCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 12,
    marginTop: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  calculationsSection: {
    marginBottom: 20,
  },
  calculationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
  },
  calculationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  calculationText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  subscriptionsSection: {
    marginBottom: 20,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  subscriptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  subscriptionDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  exploreServicesButton: {
    backgroundColor: AppColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  exploreServicesButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
