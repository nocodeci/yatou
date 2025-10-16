import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Clock, Package, MapPin, Zap, Check } from 'lucide-react-native';
import {
  calculateYatouPrice,
  calculateAllVehiclePrices,
  formatPrice,
  VehicleType,
  PricingOptions,
  PricingResult,
  VEHICLE_TYPES,
} from '@/utils/yatouPricingCalculator';
import { AppColors } from '@/app/constants/colors';

interface YatouVehicleSelectorProps {
  distance: number;
  options?: PricingOptions;
  onVehicleSelected?: (vehicle: VehicleType, pricing: PricingResult) => void;
  onOrderRequest?: (vehicle: VehicleType, pricing: PricingResult) => void;
  selectedVehicle?: VehicleType | null;
  showDetails?: boolean;
}

export default function YatouVehicleSelector({
  distance,
  options = {},
  onVehicleSelected,
  onOrderRequest,
  selectedVehicle,
  showDetails = true,
}: YatouVehicleSelectorProps) {
  const [pricingResults, setPricingResults] = useState<Array<PricingResult & { vehicleInfo: any }>>([]);
  const [urgentVehicles, setUrgentVehicles] = useState<Set<VehicleType>>(new Set());

  // Stabiliser l'objet options pour éviter les re-rendus inutiles
  const stableOptions = useMemo(() => options, [
    options.loading,
    options.moving,
    options.packaging,
    options.waiting,
    options.rushHour,
    options.weekend,
  ]);

  useEffect(() => {
    if (distance > 0) {
      // Calculer les prix pour chaque véhicule avec son état urgent individuel
      const vehicleTypes: VehicleType[] = ['moto', 'fourgon', 'camion'];
      const results = vehicleTypes.map(vehicleType => {
        const vehicleOptions = {
          ...stableOptions,
          urgent: urgentVehicles.has(vehicleType)
        };
        const pricingResult = calculateYatouPrice(distance, vehicleType, vehicleOptions);
        return {
          ...pricingResult,
          vehicleInfo: VEHICLE_TYPES[vehicleType]
        };
      });
      setPricingResults(results);
    }
  }, [distance, stableOptions, urgentVehicles]);

  const handleUrgentToggle = (vehicleType: VehicleType) => {
    setUrgentVehicles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vehicleType)) {
        newSet.delete(vehicleType);
      } else {
        newSet.add(vehicleType);
      }
      return newSet;
    });
  };

  const handleVehicleSelect = (vehicleType: VehicleType) => {
    // Calculer le prix final avec les options de service appliquées automatiquement
    const vehicleOptions = {
      ...options,
      urgent: urgentVehicles.has(vehicleType)
    };
    const finalResult = calculateYatouPrice(
      distance,
      vehicleType,
      vehicleOptions
    );
    
    // Appeler le callback avec le prix final incluant les options
    if (onVehicleSelected) {
      onVehicleSelected(vehicleType, finalResult);
    }
  };


  if (distance <= 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <MapPin size={24} color="#9CA3AF" />
          <Text style={styles.placeholderText}>
            Sélectionnez une destination pour voir les tarifs
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.vehiclesContainer}
      >
        {pricingResults.map((result) => {
          const isSelected = selectedVehicle === result.vehicle;
          const vehicleInfo = VEHICLE_TYPES[result.vehicle];
          
          return (
            <TouchableOpacity
              key={result.vehicle}
              style={[
                styles.vehicleCard,
                isSelected && styles.vehicleCardSelected
              ]}
              onPress={() => handleVehicleSelect(result.vehicle)}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleIcon}>{vehicleInfo.icon}</Text>
                <View style={styles.vehicleInfo}>
                  <Text style={[
                    styles.vehicleName,
                    isSelected && styles.vehicleNameSelected
                  ]}>
                    {vehicleInfo.name}
                  </Text>
                  <Text style={styles.vehicleCapacity}>
                    {vehicleInfo.capacity}
                  </Text>
                </View>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Text style={styles.selectedIndicatorText}>✓</Text>
                  </View>
                )}
              </View>

              <Text style={styles.vehicleDescription}>
                {vehicleInfo.description}
              </Text>

              <View style={styles.pricingSection}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Prix total</Text>
                  <Text style={[
                    styles.priceValue,
                    isSelected && styles.priceValueSelected
                  ]}>
                    {formatPrice(result.totalPrice)}
                  </Text>
                </View>

                {showDetails && (
                  <View style={styles.priceBreakdown}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Prix de base</Text>
                      <Text style={styles.breakdownValue}>
                        {formatPrice(result.basePrice)}
                      </Text>
                    </View>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Distance ({distance}km)</Text>
                      <Text style={styles.breakdownValue}>
                        {formatPrice(result.distancePrice)}
                      </Text>
                    </View>
                    {result.breakdown.supplements.length > 0 && (
                      <View style={styles.supplementsSection}>
                        {result.breakdown.supplements.map((supplement, index) => (
                          <View key={index} style={styles.breakdownRow}>
                            <Text style={styles.breakdownLabel}>
                              {supplement.name}
                            </Text>
                            <Text style={styles.breakdownValue}>
                              {formatPrice(supplement.price)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* Option Urgente pour ce véhicule */}
              <View style={styles.urgentOptionContainer}>
                <TouchableOpacity
                  style={[
                    styles.urgentCheckbox,
                    urgentVehicles.has(result.vehicle) && styles.urgentCheckboxActive
                  ]}
                  onPress={() => handleUrgentToggle(result.vehicle)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    urgentVehicles.has(result.vehicle) && styles.checkboxActive
                  ]}>
                    {urgentVehicles.has(result.vehicle) && (
                      <Check size={12} color="#FFFFFF" />
                    )}
                  </View>
                  <View style={styles.urgentTextContainer}>
                    <Text style={[
                      styles.urgentText,
                      urgentVehicles.has(result.vehicle) && styles.urgentTextActive
                    ]}>
                      Commande Urgente
                    </Text>
                    <Text style={[
                      styles.urgentPrice,
                      urgentVehicles.has(result.vehicle) && styles.urgentPriceActive
                    ]}>
                      +200 FCFA
                    </Text>
                  </View>
                  <Zap 
                    size={16} 
                    color={urgentVehicles.has(result.vehicle) ? "#F59E0B" : "#9CA3AF"} 
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.vehicleFooter}>
                <View style={styles.timeInfo}>
                  <Clock size={14} color="#6B7280" />
                  <Text style={styles.timeText}>
                    {result.estimatedTime} min
                  </Text>
                </View>
                <View style={styles.capacityInfo}>
                  <Package size={14} color="#6B7280" />
                  <Text style={styles.capacityText}>
                    {vehicleInfo.capacity}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {showDetails && selectedVehicle && (
        <View style={styles.selectedVehicleDetails}>
          <Text style={styles.detailsTitle}>
            Détails de votre sélection
          </Text>
          {(() => {
            const selected = pricingResults.find(r => r.vehicle === selectedVehicle);
            if (!selected) return null;
            
            return (
              <View style={styles.detailsContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Véhicule</Text>
                  <Text style={styles.detailValue}>
                    {VEHICLE_TYPES[selectedVehicle].name}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Distance</Text>
                  <Text style={styles.detailValue}>
                    {distance.toFixed(1)} km
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Temps estimé</Text>
                  <Text style={styles.detailValue}>
                    {selected.estimatedTime} minutes
                  </Text>
                </View>
                <View style={[styles.detailRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>
                    {formatPrice(selected.totalPrice)}
                  </Text>
                </View>
              </View>
            );
          })()}
        </View>
      )}

      {/* Bouton Commander */}
      {selectedVehicle && onOrderRequest && (
        <View style={styles.orderButtonContainer}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={() => {
              const selected = pricingResults.find(r => r.vehicle === selectedVehicle);
              if (selected && onOrderRequest) {
                onOrderRequest(selectedVehicle, selected);
              }
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.orderButtonText}>
              Commander maintenant
            </Text>
            <Text style={styles.orderButtonSubtext}>
              Rechercher des livreurs disponibles
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  vehiclesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  vehicleCard: {
    width: cardWidth,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleCardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: '#F0F9FF',
    shadowColor: AppColors.primary,
    shadowOpacity: 0.1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 2,
  },
  vehicleNameSelected: {
    color: AppColors.primary,
  },
  vehicleCapacity: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  pricingSection: {
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.text,
  },
  priceValueSelected: {
    color: AppColors.primary,
  },
  priceBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  supplementsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
    marginTop: 8,
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  capacityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  capacityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedVehicleDetails: {
    margin: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 16,
  },
  detailsContent: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: AppColors.primary,
  },
  // Styles pour l'option urgente dans chaque véhicule
  urgentOptionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  urgentCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  urgentCheckboxActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  urgentTextContainer: {
    flex: 1,
  },
  urgentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  urgentTextActive: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  urgentPrice: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  urgentPriceActive: {
    color: '#D97706',
    fontWeight: '600',
  },
  // Styles pour le bouton Commander
  orderButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  orderButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.white,
    marginBottom: 4,
  },
  orderButtonSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
