import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/app/constants/colors';

interface MovingBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  tripData?: {
    distance?: number;
    duration?: number;
  };
  onServiceSelected: (service: string, vehicle: string, price: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function MovingBottomSheet({ 
  visible, 
  onClose, 
  tripData,
  onServiceSelected
}: MovingBottomSheetProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);

  const slideAnim = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const vehicles = [
    { id: 'tricycle', name: 'Tricycle', icon: '🛺', maxWeight: '200kg', basePrice: 2000 },
    { id: 'cargo', name: 'Cargo', icon: '🚛', maxWeight: '500kg', basePrice: 3000 },
    { id: 'van', name: 'Fourgonnette', icon: '🚐', maxWeight: '1000kg', basePrice: 5000 }
  ];

  const calculatePrice = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 0;

    const distance = tripData?.distance || 0;
    const basePrice = vehicle.basePrice;
    
    let finalPrice = basePrice;
    if (distance > 2) {
      finalPrice += (distance - 2) * 150;
    }
    
    return Math.round(finalPrice);
  };

  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
    const price = calculatePrice(vehicleId);
    setCalculatedPrice(price);
  };

  const handleConfirm = () => {
    if (selectedVehicle && calculatedPrice > 0) {
      const vehicle = vehicles.find(v => v.id === selectedVehicle);
      onServiceSelected('Déménagement', vehicle?.name || '', calculatedPrice);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.serviceIcon}>🏠</Text>
          <View style={styles.headerText}>
            <Text style={styles.title}>Déménagement</Text>
            <Text style={styles.description}>Service complet de déménagement et transport</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        {/* Véhicules en disposition horizontale */}
        <View style={styles.vehiclesSection}>
          <Text style={styles.sectionTitle}>Choisir votre véhicule :</Text>
          
          <View style={styles.vehiclesRow}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.id && styles.selectedVehicleCard
                ]}
                onPress={() => handleVehicleSelect(vehicle.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                <Text style={styles.vehicleName}>{vehicle.name}</Text>
                <Text style={styles.vehicleWeight}>Max {vehicle.maxWeight}</Text>
                <Text style={styles.vehiclePrice}>À partir de {vehicle.basePrice} FCFA</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>



        {/* Bouton de Confirmation */}
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !selectedVehicle && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedVehicle}
          activeOpacity={0.8}
        >
          <Text style={styles.confirmButtonText}>
            🚀 Confirmer le Déménagement
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  backdropTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  serviceIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  closeButton: {
    padding: 8,
  },
  vehiclesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
    marginBottom: 16,
  },
  vehiclesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  vehicleCard: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.border,
    minHeight: 120,
  },
  selectedVehicleCard: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.primary + '10',
  },
  vehicleIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  vehicleWeight: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
    textAlign: 'center',
  },
  vehiclePrice: {
    fontSize: 12,
    color: AppColors.primary,
    fontWeight: '600',
    textAlign: 'center',
  },

  confirmButton: {
    backgroundColor: AppColors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: AppColors.border,
  },
  confirmButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
