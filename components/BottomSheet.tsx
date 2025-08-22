import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native'
import { MapPin } from 'lucide-react-native'

const { height } = Dimensions.get('window')

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  pickupLocation: string
  destinationLocation: string
  onPickupChange: (text: string) => void
  onDestinationChange: (text: string) => void
  onConfirm: () => void
}

export default function BottomSheet({
  visible,
  onClose,
  pickupLocation,
  destinationLocation,
  onPickupChange,
  onDestinationChange,
  onConfirm,
}: BottomSheetProps) {
  const slideAnim = useRef(new Animated.Value(height)).current
  const overlayAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      // Animation d'ouverture
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      // Animation de fermeture
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const handleOverlayPress = () => {
    onClose()
  }

  if (!visible) return null

  return (
    <>
      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleOverlayPress}
        />
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.bottomSheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Planifier votre trajet</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <View style={styles.pickupDot} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Lieu de prise en charge"
                placeholderTextColor="#9CA3AF"
                value={pickupLocation}
                onChangeText={onPickupChange}
              />
            </View>

            <View style={styles.routeLine} />

            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MapPin size={16} color="#EF4444" />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Destination"
                placeholderTextColor="#9CA3AF"
                value={destinationLocation}
                onChangeText={onDestinationChange}
              />
            </View>
          </View>

          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>🏠</Text>
              <Text style={styles.quickActionText}>Domicile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>💼</Text>
              <Text style={styles.quickActionText}>Bureau</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionIcon}>📍</Text>
              <Text style={styles.quickActionText}>Récents</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!pickupLocation || !destinationLocation) && styles.confirmButtonDisabled,
            ]}
            onPress={onConfirm}
            disabled={!pickupLocation || !destinationLocation}
          >
            <Text style={styles.confirmButtonText}>Confirmer le trajet</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: '80%',
    zIndex: 2001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
  content: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    alignItems: 'center',
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 9,
    marginVertical: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
