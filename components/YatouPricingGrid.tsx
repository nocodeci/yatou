import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { AppColors } from '@/app/constants/colors';

interface YatouPricingGridProps {
  onCalculatePrice?: () => void;
  showPricingDetails?: boolean;
  customTitle?: string;
  customSubtitle?: string;
}

export default function YatouPricingGrid({ 
  onCalculatePrice, 
  showPricingDetails = true,
  customTitle = "🚚 Services YATOU",
  customSubtitle
}: YatouPricingGridProps) {
  
  const handleCalculatePrice = () => {
    if (onCalculatePrice) {
      onCalculatePrice();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{customTitle}</Text>
      
      {customSubtitle && (
        <Text style={styles.subtitle}>{customSubtitle}</Text>
      )}
      
      {/* Services Disponibles */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Services Disponibles :</Text>
        
        <View style={styles.serviceItem}>
          <Text style={styles.serviceIcon}>📦</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Livraison de Colis</Text>
            <Text style={styles.serviceDescription}>Moto (max 4kg) - À partir de 300 FCFA</Text>
          </View>
        </View>
        
        <View style={styles.serviceItem}>
          <Text style={styles.serviceIcon}>🛒</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Course</Text>
            <Text style={styles.serviceDescription}>Moto, Tricycle, Cargo - À partir de 500 FCFA</Text>
          </View>
        </View>
        
        <View style={styles.serviceItem}>
          <Text style={styles.serviceIcon}>🏠</Text>
          <View style={styles.serviceDetails}>
            <Text style={styles.serviceName}>Déménagement</Text>
            <Text style={styles.serviceDescription}>Tricycle, Fourgonnette/Camion - À partir de 2000 FCFA</Text>
          </View>
        </View>
      </View>

      {/* Calculs Intelligents */}
      <View style={styles.calculationsSection}>
        <Text style={styles.sectionTitle}>Calculs Intelligents :</Text>
        
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
        <Text style={styles.sectionTitle}>Plans d'Abonnement :</Text>
        
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
      {showPricingDetails && (
        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={handleCalculatePrice}
          activeOpacity={0.8}
        >
          <Text style={styles.calculateButtonText}>
            🚀 Calculer mon Prix YATOU
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
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
  calculateButton: {
    backgroundColor: AppColors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
