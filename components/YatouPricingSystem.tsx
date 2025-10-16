import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MapPin, Clock, Package, CreditCard } from 'lucide-react-native';
import YatouVehicleSelector from './YatouVehicleSelector';
import YatouServiceOptions from './YatouServiceOptions';
import YatouPaymentSelector from './YatouPaymentSelector';
import {
  calculateYatouPrice,
  VehicleType,
  PricingOptions,
  PricingResult,
  formatPrice,
} from '@/utils/yatouPricingCalculator';
import { AppColors } from '@/app/constants/colors';

interface YatouPricingSystemProps {
  distance: number;
  originName?: string;
  destinationName?: string;
  onOrderConfirmed?: (order: OrderDetails) => void;
  initialVehicleType?: VehicleType;
}

interface OrderDetails {
  vehicleType: VehicleType;
  pricing: PricingResult;
  options: PricingOptions;
  paymentMethod: string;
  originName: string;
  destinationName: string;
  distance: number;
  estimatedTime: number;
}

export default function YatouPricingSystem({
  distance,
  originName = 'Point de départ',
  destinationName = 'Destination',
  onOrderConfirmed,
  initialVehicleType,
}: YatouPricingSystemProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType | null>(initialVehicleType || null);
  const [pricingResult, setPricingResult] = useState<PricingResult | null>(null);
  const [serviceOptions, setServiceOptions] = useState<PricingOptions>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'vehicle' | 'options' | 'payment'>('vehicle');

  // Recalculer le prix quand les options changent
  useEffect(() => {
    if (selectedVehicle && distance > 0) {
      const result = calculateYatouPrice(distance, selectedVehicle, serviceOptions);
      setPricingResult(result);
    }
  }, [selectedVehicle, distance, serviceOptions]);

  const handleVehicleSelected = (vehicleType: VehicleType, pricing: PricingResult) => {
    setSelectedVehicle(vehicleType);
    setPricingResult(pricing);
    setCurrentStep('options');
  };

  const handleOptionsChange = (options: PricingOptions) => {
    setServiceOptions(options);
  };

  const handlePaymentMethodSelected = (method: string) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('payment');
  };

  const handleConfirmOrder = () => {
    if (!selectedVehicle || !pricingResult || !selectedPaymentMethod) {
      Alert.alert('Information manquante', 'Veuillez compléter toutes les étapes avant de confirmer votre commande.');
      return;
    }

    const orderDetails: OrderDetails = {
      vehicleType: selectedVehicle,
      pricing: pricingResult,
      options: serviceOptions,
      paymentMethod: selectedPaymentMethod,
      originName,
      destinationName,
      distance,
      estimatedTime: pricingResult.estimatedTime,
    };

    Alert.alert(
      'Confirmer la commande',
      `Voulez-vous confirmer votre commande de ${formatPrice(pricingResult.totalPrice)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => {
            if (onOrderConfirmed) {
              onOrderConfirmed(orderDetails);
            }
            // Réinitialiser le formulaire
            setSelectedVehicle(null);
            setPricingResult(null);
            setServiceOptions({});
            setSelectedPaymentMethod(null);
            setCurrentStep('vehicle');
          },
        },
      ]
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'vehicle':
        return '🚚 Choisissez votre véhicule';
      case 'options':
        return '⚙️ Options de service';
      case 'payment':
        return '💳 Mode de paiement';
      default:
        return 'Commande YATOU';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'vehicle':
        return 'Sélectionnez le véhicule adapté à vos besoins';
      case 'options':
        return 'Personnalisez votre service avec nos options';
      case 'payment':
        return 'Choisissez votre mode de paiement préféré';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header avec informations du trajet */}
      <View style={styles.header}>
        <View style={styles.tripInfo}>
          <View style={styles.tripRoute}>
            <View style={styles.routePoint}>
              <View style={styles.routeDot} />
              <Text style={styles.routeText}>{originName}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotDestination]} />
              <Text style={styles.routeText}>{destinationName}</Text>
            </View>
          </View>
          
          <View style={styles.tripStats}>
            <View style={styles.statItem}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.statText}>{distance.toFixed(1)} km</Text>
            </View>
            {pricingResult && (
              <View style={styles.statItem}>
                <Clock size={16} color="#6B7280" />
                <Text style={styles.statText}>{pricingResult.estimatedTime} min</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.stepHeader}>
          <Text style={styles.stepTitle}>{getStepTitle()}</Text>
          <Text style={styles.stepDescription}>{getStepDescription()}</Text>
        </View>
      </View>

      {/* Contenu principal */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'vehicle' && (
          <YatouVehicleSelector
            distance={distance}
            options={serviceOptions}
            onVehicleSelected={handleVehicleSelected}
            selectedVehicle={selectedVehicle}
            showDetails={true}
          />
        )}

        {currentStep === 'options' && selectedVehicle && (
          <YatouServiceOptions
            vehicleType={selectedVehicle}
            options={serviceOptions}
            onOptionsChange={handleOptionsChange}
            showAllOptions={true}
          />
        )}

        {currentStep === 'payment' && pricingResult && (
          <YatouPaymentSelector
            totalAmount={pricingResult.totalPrice}
            onPaymentMethodSelected={handlePaymentMethodSelected}
            selectedMethod={selectedPaymentMethod as any}
            showWalletBalance={true}
            walletBalance={15000} // Exemple de solde
          />
        )}
      </ScrollView>

      {/* Navigation et résumé */}
      <View style={styles.footer}>
        {/* Résumé du prix */}
        {pricingResult && (
          <View style={styles.priceSummary}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total</Text>
              <Text style={styles.priceValue}>
                {formatPrice(pricingResult.totalPrice)}
              </Text>
            </View>
            <Text style={styles.priceDetails}>
              {selectedVehicle && `Avec ${selectedVehicle} • ${pricingResult.estimatedTime} min`}
            </Text>
          </View>
        )}

        {/* Boutons de navigation */}
        <View style={styles.navigationButtons}>
          {currentStep !== 'vehicle' && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (currentStep === 'payment') {
                  setCurrentStep('options');
                } else if (currentStep === 'options') {
                  setCurrentStep('vehicle');
                }
              }}
            >
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}

          {currentStep === 'vehicle' && selectedVehicle && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentStep('options')}
            >
              <Text style={styles.nextButtonText}>Continuer</Text>
            </TouchableOpacity>
          )}

          {currentStep === 'options' && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => setCurrentStep('payment')}
            >
              <Text style={styles.nextButtonText}>Paiement</Text>
            </TouchableOpacity>
          )}

          {currentStep === 'payment' && selectedPaymentMethod && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmOrder}
            >
              <Text style={styles.confirmButtonText}>
                Confirmer la commande
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tripInfo: {
    marginBottom: 16,
  },
  tripRoute: {
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.primary,
    marginRight: 12,
  },
  routeDotDestination: {
    backgroundColor: '#10B981',
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    color: AppColors.text,
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 3,
    marginBottom: 8,
  },
  tripStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  stepHeader: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  priceSummary: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.primary,
  },
  priceDetails: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  nextButton: {
    flex: 2,
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
