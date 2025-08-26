import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '@/app/constants/colors';
import { YatouPricingCalculator } from '@/utils/pricingCalculator';

interface SubscriptionPlansProps {
  onPlanSelected?: (plan: string, type: string, price: number) => void;
}

export default function SubscriptionPlans({ onPlanSelected }: SubscriptionPlansProps) {
  const [selectedType, setSelectedType] = useState<'personal' | 'business'>('personal');

  const personalPlans = [
    {
      id: 'express',
      name: 'YATOU Express',
      price: 2500,
      period: 'Mensuel',
      features: [
        '-20% sur livraisons moto',
        '10 livraisons/mois',
        'Jusqu\'à 2kg',
        'Support prioritaire'
      ],
      icon: 'flash-outline',
      color: AppColors.warning
    },
    {
      id: 'flex',
      name: 'YATOU Flex',
      price: 5000,
      period: 'Mensuel',
      features: [
        '-25% sur toutes livraisons',
        '15 livraisons/mois',
        'Tous types de services',
        'Assurance incluse'
      ],
      icon: 'shield-outline',
      color: AppColors.primary
    },
    {
      id: 'premium',
      name: 'YATOU Premium',
      price: 10000,
      period: 'Mensuel',
      features: [
        '-30% sur toutes livraisons',
        'Livraisons illimitées',
        '1 déménagement à -50%',
        'Gestionnaire dédié'
      ],
      icon: 'diamond-outline',
      color: AppColors.secondary
    }
  ];

  const businessPlans = [
    {
      id: 'pro',
      name: 'YATOU Pro',
      price: 10000,
      period: 'Mensuel',
      features: [
        '-30% sur livraisons moto',
        '30 livraisons/mois',
        'Jusqu\'à 2kg',
        'Rapports détaillés'
      ],
      icon: 'business-outline',
      color: AppColors.primary
    },
    {
      id: 'proPlus',
      name: 'YATOU Pro Plus',
      price: 20000,
      period: 'Mensuel',
      features: [
        '-50% sur toutes livraisons',
        '50 livraisons/mois',
        'Tous types de services',
        'API d\'intégration'
      ],
      icon: 'rocket-outline',
      color: AppColors.success
    },
    {
      id: 'unlimited',
      name: 'YATOU Pro Unlimited',
      price: 50000,
      period: 'Mensuel',
      features: [
        '-90% sur toutes livraisons',
        'Livraisons illimitées',
        'Gestionnaire de compte dédié',
        'Support 24/7'
      ],
      icon: 'infinite-outline',
      color: AppColors.secondary
    }
  ];

  const ecommercePlans = [
    {
      id: 'eStart',
      name: 'YATOU E-Start',
      price: 5000,
      period: 'Mensuel',
      features: [
        '15 livraisons moto/mois',
        'Intégration e-commerce',
        'Suivi en temps réel',
        'Support technique'
      ],
      icon: 'cart-outline',
      color: AppColors.primary
    },
    {
      id: 'ePlus',
      name: 'YATOU E-Plus',
      price: 10000,
      period: 'Mensuel',
      features: [
        '30 livraisons/mois',
        'Tous types de services',
        'API avancée',
        'Analytics détaillés'
      ],
      icon: 'trending-up-outline',
      color: AppColors.success
    },
    {
      id: 'ePremium',
      name: 'YATOU E-Premium',
      price: 20000,
      period: 'Mensuel',
      features: [
        '70 livraisons/mois',
        'Créneau personnalisé',
        'Gestionnaire dédié',
        'Formation équipe'
      ],
      icon: 'star-outline',
      color: AppColors.warning
    }
  ];

  const handlePlanSelect = (plan: any, type: string) => {
    if (onPlanSelected) {
      onPlanSelected(plan.id, type, plan.price);
    } else {
      Alert.alert(
        'Plan Sélectionné',
        `Vous avez choisi ${plan.name} pour ${plan.price.toLocaleString()} FCFA/mois`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Souscrire', onPress: () => console.log('Souscription à', plan.name) }
        ]
      );
    }
  };

  const renderPlanCard = (plan: any, type: string) => (
    <TouchableOpacity
      key={plan.id}
      style={[styles.planCard, { borderColor: plan.color }]}
      onPress={() => handlePlanSelect(plan, type)}
    >
      <View style={styles.planHeader}>
        <View style={[styles.planIcon, { backgroundColor: plan.color + '20' }]}>
          <Ionicons name={plan.icon as any} size={24} color={plan.color} />
        </View>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPeriod}>{plan.period}</Text>
        </View>
      </View>
      
      <View style={styles.planPrice}>
        <Text style={styles.priceAmount}>{plan.price.toLocaleString()}</Text>
        <Text style={styles.priceCurrency}>FCFA</Text>
      </View>
      
      <View style={styles.planFeatures}>
        {plan.features.map((feature: string, index: number) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color={AppColors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity 
        style={[styles.selectButton, { backgroundColor: plan.color }]}
        onPress={() => handlePlanSelect(plan, type)}
      >
        <Text style={styles.selectButtonText}>Choisir ce Plan</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🚀 Plans d'Abonnement YATOU</Text>
        <Text style={styles.subtitle}>
          Choisissez le plan qui correspond à vos besoins et économisez sur vos livraisons
        </Text>
      </View>

      {/* Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'personal' && styles.selectedTypeButton
          ]}
          onPress={() => setSelectedType('personal')}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={selectedType === 'personal' ? AppColors.white : AppColors.primary} 
          />
          <Text style={[
            styles.typeButtonText,
            selectedType === 'personal' && styles.selectedTypeButtonText
          ]}>
            Particuliers
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.typeButton,
            selectedType === 'business' && styles.selectedTypeButton
          ]}
          onPress={() => setSelectedType('business')}
        >
          <Ionicons 
            name="business-outline" 
            size={20} 
            color={selectedType === 'business' ? AppColors.white : AppColors.primary} 
          />
          <Text style={[
            styles.typeButtonText,
            selectedType === 'business' && styles.selectedTypeButtonText
          ]}>
            Entreprises
          </Text>
        </TouchableOpacity>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {selectedType === 'personal' && (
          <>
            <Text style={styles.sectionTitle}>👥 Plans Particuliers</Text>
            {personalPlans.map(plan => renderPlanCard(plan, 'personal'))}
            
            <Text style={styles.sectionTitle}>🛒 Plans E-commerce</Text>
            {ecommercePlans.map(plan => renderPlanCard(plan, 'ecommerce'))}
          </>
        )}
        
        {selectedType === 'business' && (
          <>
            <Text style={styles.sectionTitle}>🏢 Plans Professionnels</Text>
            {businessPlans.map(plan => renderPlanCard(plan, 'business'))}
            
            <Text style={styles.sectionTitle}>🛒 Plans E-commerce</Text>
            {ecommercePlans.map(plan => renderPlanCard(plan, 'ecommerce'))}
          </>
        )}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerTitle}>💡 Pourquoi Choisir YATOU ?</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
            <Text style={styles.benefitText}>Tarifs transparents et sans surprise</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
            <Text style={styles.benefitText}>Livraisons rapides et sécurisées</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
            <Text style={styles.benefitText}>Support client disponible 24/7</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={20} color={AppColors.success} />
            <Text style={styles.benefitText}>Couverture nationale complète</Text>
          </View>
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
  typeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  selectedTypeButton: {
    backgroundColor: AppColors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  selectedTypeButtonText: {
    color: AppColors.white,
  },
  plansContainer: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
    marginTop: 24,
  },
  planCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  planPeriod: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  planPrice: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: AppColors.surface,
    borderRadius: 12,
  },
  priceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  priceCurrency: {
    fontSize: 16,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  planFeatures: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: AppColors.text,
    marginLeft: 12,
    flex: 1,
  },
  selectButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: AppColors.white,
    margin: 16,
    padding: 24,
    borderRadius: 16,
    marginTop: 24,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    color: AppColors.text,
    marginLeft: 12,
    flex: 1,
  },
});
