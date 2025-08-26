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
import DeliveryBottomSheet from './DeliveryBottomSheet';
import ErrandBottomSheet from './ErrandBottomSheet';
import MovingBottomSheet from './MovingBottomSheet';

interface HorizontalSwipeBottomSheetsProps {
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

export default function HorizontalSwipeBottomSheets({ 
  visible, 
  onClose, 
  tripData,
  onServiceSelected
}: HorizontalSwipeBottomSheetsProps) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  
  const services = [
    { 
      id: 'delivery', 
      name: 'Livraison', 
      icon: '📦', 
      color: '#10B981',
      component: DeliveryBottomSheet
    },
    { 
      id: 'errand', 
      name: 'Course', 
      icon: '🛒', 
      color: '#F59E0B',
      component: ErrandBottomSheet
    },
    { 
      id: 'moving', 
      name: 'Déménagement', 
      icon: '🏠', 
      color: '#8B5CF6',
      component: MovingBottomSheet
    }
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
    onClose();
  };

  const handleServiceSelected = (service: string, vehicle: string, price: number) => {
    onServiceSelected(service, vehicle, price);
    onClose();
  };

  if (!visible) return null;

  const CurrentServiceComponent = services[currentServiceIndex].component;

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

      {/* Bottom Sheet Principal avec Navigation */}
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

        {/* Header avec Navigation */}
        <View style={styles.header}>
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

          <View style={styles.headerCenter}>
            <Text style={styles.serviceIcon}>{services[currentServiceIndex].icon}</Text>
            <Text style={styles.title}>{services[currentServiceIndex].name}</Text>
            <Text style={styles.subtitle}>Service {currentServiceIndex + 1} sur {services.length}</Text>
          </View>

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

        {/* Indicateurs de Navigation */}
        <View style={styles.navigationDots}>
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

        {/* Instructions de Swipe */}
        <View style={styles.swipeInstructions}>
          <Text style={styles.swipeText}>
            💡 Swipe gauche/droite ou utilisez les boutons pour naviguer
          </Text>
        </View>

        {/* Bouton de Fermeture */}
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={AppColors.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* Bottom Sheet du Service Actuel */}
      <CurrentServiceComponent
        visible={visible}
        onClose={handleClose}
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
    minHeight: 200,
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  navigationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
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
  swipeInstructions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  swipeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 8,
  },
});
