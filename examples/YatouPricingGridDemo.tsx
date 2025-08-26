import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { AppColors } from '@/app/constants/colors';
import YatouPricingGrid from '@/components/YatouPricingGrid';

export default function YatouPricingGridDemo() {
  const [selectedVariant, setSelectedVariant] = useState<'default' | 'compact' | 'detailed'>('default');

  const handleCalculatePrice = () => {
    Alert.alert(
      'Calcul de Prix YATOU',
      'Redirection vers le calculateur de prix...',
      [{ text: 'OK' }]
    );
  };

  const handleServiceInfo = () => {
    Alert.alert(
      'Informations Services',
      'Affichage des détails des services...',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>🚚 Composant YatouPricingGrid</Text>
        <Text style={styles.subtitle}>
          Démonstration des différentes variantes du composant
        </Text>
      </View>

      {/* Variantes du composant */}
      <View style={styles.variantSelector}>
        <TouchableOpacity
          style={[
            styles.variantButton,
            selectedVariant === 'default' && styles.selectedVariantButton
          ]}
          onPress={() => setSelectedVariant('default')}
        >
          <Text style={[
            styles.variantButtonText,
            selectedVariant === 'default' && styles.selectedVariantButtonText
          ]}>
            Défaut
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.variantButton,
            selectedVariant === 'compact' && styles.selectedVariantButton
          ]}
          onPress={() => setSelectedVariant('compact')}
        >
          <Text style={[
            styles.variantButtonText,
            selectedVariant === 'compact' && styles.selectedVariantButtonText
          ]}>
            Compact
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.variantButton,
            selectedVariant === 'detailed' && styles.selectedVariantButton
          ]}
          onPress={() => setSelectedVariant('detailed')}
        >
          <Text style={[
            styles.variantButtonText,
            selectedVariant === 'detailed' && styles.selectedVariantButtonText
          ]}>
            Détaillé
          </Text>
        </TouchableOpacity>
      </View>

      {/* Affichage du composant selon la variante */}
      {selectedVariant === 'default' && (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Variante Défaut</Text>
          <Text style={styles.demoDescription}>
            Affichage complet avec bouton de calcul
          </Text>
          <YatouPricingGrid 
            onCalculatePrice={handleCalculatePrice}
          />
        </View>
      )}

      {selectedVariant === 'compact' && (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Variante Compact</Text>
          <Text style={styles.demoDescription}>
            Affichage sans bouton de calcul
          </Text>
          <YatouPricingGrid 
            showPricingDetails={false}
            customTitle="📋 Services YATOU"
            customSubtitle="Vue d'ensemble des services disponibles"
          />
        </View>
      )}

      {selectedVariant === 'detailed' && (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Variante Détaillée</Text>
          <Text style={styles.demoDescription}>
            Affichage avec titre et sous-titre personnalisés
          </Text>
          <YatouPricingGrid 
            onCalculatePrice={handleCalculatePrice}
            customTitle="🌟 YATOU Premium Services"
            customSubtitle="Découvrez notre gamme complète de services de livraison et transport"
          />
        </View>
      )}

      {/* Utilisation dans différents contextes */}
      <View style={styles.usageSection}>
        <Text style={styles.usageTitle}>💡 Utilisation du Composant</Text>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>🏠</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Écran d'Accueil</Text>
            <Text style={styles.usageDescription}>
              Affichage principal des services avec bouton de calcul
            </Text>
          </View>
        </View>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>📱</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Bottom Sheet</Text>
            <Text style={styles.usageDescription}>
              Informations détaillées dans le panneau de trajet
            </Text>
          </View>
        </View>
        
        <View style={styles.usageItem}>
          <Text style={styles.usageIcon}>ℹ️</Text>
          <View style={styles.usageDetails}>
            <Text style={styles.usageName}>Page d'Information</Text>
            <Text style={styles.usageDescription}>
              Présentation des services sans action
            </Text>
          </View>
        </View>
      </View>

      {/* Avantages du composant */}
      <View style={styles.benefitsSection}>
        <Text style={styles.benefitsTitle}>✅ Avantages du Composant</Text>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🔧</Text>
          <Text style={styles.benefitText}>Facile à modifier et maintenir</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>🎨</Text>
          <Text style={styles.benefitText}>Design cohérent dans toute l'app</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>📱</Text>
          <Text style={styles.benefitText}>Réutilisable dans différents écrans</Text>
        </View>
        
        <View style={styles.benefitItem}>
          <Text style={styles.benefitIcon}>⚡</Text>
          <Text style={styles.benefitText}>Performance optimisée</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: AppColors.white,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  variantSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 4,
  },
  variantButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedVariantButton: {
    backgroundColor: AppColors.primary,
  },
  variantButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  selectedVariantButtonText: {
    color: AppColors.white,
  },
  demoSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 8,
  },
  demoDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 16,
  },
  usageSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  usageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  usageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  usageIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  usageDetails: {
    flex: 1,
  },
  usageName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  usageDescription: {
    fontSize: 14,
    color: AppColors.textSecondary,
    lineHeight: 20,
  },
  benefitsSection: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
});
