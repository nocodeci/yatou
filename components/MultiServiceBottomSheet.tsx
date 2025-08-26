import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/app/constants/colors';
import ServiceBottomSheet from './ServiceBottomSheet';

interface MultiServiceBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  tripData?: {
    origin?: string;
    destination?: string;
    distance?: number;
    duration?: number;
  };
  onServiceSelected: (service: string, vehicle: string, price: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function MultiServiceBottomSheet({ 
  visible, 
  onClose, 
  tripData,
  onServiceSelected
}: MultiServiceBottomSheetProps) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [showServiceDetail, setShowServiceDetail] = useState(false);
  
  const services = [
    { id: 'delivery', name: 'Livraison', icon: '📦', color: '#10B981' },
    { id: 'errand', name: 'Course', icon: '🛒', color: '#F59E0B' },
    { id: 'moving', name: 'Déménagement', icon: '🏠', color: '#8B5CF6' }
  ];

  const slideAnim = useRef(new Animated.Value(0)).current;
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

  const handleServicePress = (index: number) => {
    setCurrentServiceIndex(index);
    setShowServiceDetail(true);
  };

  const handleServiceClose = () => {
    setShowServiceDetail(false);
  };

  const handleServiceSelected = (service: string, vehicle: string, price: number) => {
    onServiceSelected(service, vehicle, price);
    onClose();
  };

  const handleSwipeRight = () => {
    if (currentServiceIndex < services.length - 1) {
      setCurrentServiceIndex(currentServiceIndex + 1);
    }
  };

  const handleSwipeLeft = () => {
    if (currentServiceIndex > 0) {
      setCurrentServiceIndex(currentServiceIndex - 1);
    }
  };

  const handleClose = () => {
    setShowServiceDetail(false);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backdropOpacity }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Bottom Sheet Principal */}
      <Animated.View 
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Handle Bar */}
        <View style={styles.handleBar}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚚 Services YATOU</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={AppColors.text} />
          </TouchableOpacity>
        </View>

        {/* Indicateur de Service Actuel */}
        <View style={styles.serviceIndicator}>
          <Text style={styles.serviceIndicatorText}>
            Service {currentServiceIndex + 1} sur {services.length}
          </Text>
          <View style={styles.serviceDots}>
            {services.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentServiceIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>

        {/* Services en disposition horizontale */}
        <View style={styles.servicesContainer}>
          <View style={styles.servicesRow}>
            {services.map((service, index) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceCard,
                  index === currentServiceIndex && styles.activeServiceCard,
                  { borderColor: service.color }
                ]}
                onPress={() => handleServicePress(index)}
                activeOpacity={0.8}
              >
                <Text style={styles.serviceIcon}>{service.icon}</Text>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceAction}>Appuyer pour voir</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Instructions de Navigation */}
        <View style={styles.navigationInstructions}>
          <View style={styles.navigationItem}>
            <Ionicons name="arrow-back" size={20} color={AppColors.primary} />
            <Text style={styles.navigationText}>Swipe gauche pour service précédent</Text>
          </View>
          <View style={styles.navigationItem}>
            <Ionicons name="arrow-forward" size={20} color={AppColors.primary} />
            <Text style={styles.navigationText}>Swipe droite pour service suivant</Text>
          </View>
        </View>

        {/* Bouton de Navigation */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity 
            style={[
              styles.navButton,
              currentServiceIndex === 0 && styles.navButtonDisabled
            ]}
            onPress={handleSwipeLeft}
            disabled={currentServiceIndex === 0}
          >
            <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navButton,
              currentServiceIndex === services.length - 1 && styles.navButtonDisabled
            ]}
            onPress={handleSwipeRight}
            disabled={currentServiceIndex === services.length - 1}
          >
            <Ionicons name="chevron-forward" size={24} color={AppColors.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Bottom Sheet de Détail du Service */}
      <ServiceBottomSheet
        visible={showServiceDetail}
        onClose={handleServiceClose}
        serviceType={services[currentServiceIndex].id as 'delivery' | 'errand' | 'moving'}
        tripData={tripData}
        onServiceSelected={handleServiceSelected}
      />
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
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: AppColors.border,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  closeButton: {
    padding: 8,
  },
  serviceIndicator: {
    alignItems: 'center',
    marginBottom: 20,
  },
  serviceIndicatorText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  serviceDots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AppColors.border,
  },
  activeDot: {
    backgroundColor: AppColors.primary,
  },
  servicesContainer: {
    marginBottom: 24,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: AppColors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: AppColors.border,
    minHeight: 120,
  },
  activeServiceCard: {
    backgroundColor: AppColors.primary + '10',
    borderWidth: 3,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  serviceAction: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  navigationInstructions: {
    marginBottom: 20,
  },
  navigationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  navigationText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginLeft: 8,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: AppColors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  navButtonDisabled: {
    borderColor: AppColors.border,
    opacity: 0.5,
  },
});
