import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { CreditCard, Smartphone, Wallet, CheckCircle } from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';

export type PaymentMethod = 'orange_money' | 'wave' | 'cash' | 'wallet';

interface PaymentMethodInfo {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  processingFee?: number;
  instant?: boolean;
}

interface YatouPaymentSelectorProps {
  totalAmount: number;
  onPaymentMethodSelected?: (method: PaymentMethod) => void;
  selectedMethod?: PaymentMethod | null;
  showWalletBalance?: boolean;
  walletBalance?: number;
}

const PAYMENT_METHODS: PaymentMethodInfo[] = [
  {
    id: 'orange_money',
    name: 'Orange Money',
    description: 'Paiement direct depuis l\'app',
    icon: '🟠',
    available: true,
    instant: true,
  },
  {
    id: 'wave',
    name: 'Wave',
    description: 'Paiement instantané sécurisé',
    icon: '🌊',
    available: true,
    instant: true,
  },
  {
    id: 'wallet',
    name: 'Portefeuille YATOU',
    description: 'Solde disponible dans l\'app',
    icon: '💳',
    available: true,
    instant: true,
  },
  {
    id: 'cash',
    name: 'Espèces',
    description: 'Paiement au livreur',
    icon: '💵',
    available: true,
    instant: false,
  },
];

export default function YatouPaymentSelector({
  totalAmount,
  onPaymentMethodSelected,
  selectedMethod,
  showWalletBalance = true,
  walletBalance = 0,
}: YatouPaymentSelectorProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaymentMethodSelect = async (method: PaymentMethod) => {
    if (isProcessing) return;

    const paymentInfo = PAYMENT_METHODS.find(p => p.id === method);
    if (!paymentInfo?.available) {
      Alert.alert('Méthode indisponible', 'Cette méthode de paiement n\'est pas disponible pour le moment.');
      return;
    }

    // Vérifier le solde du portefeuille
    if (method === 'wallet' && walletBalance < totalAmount) {
      Alert.alert(
        'Solde insuffisant',
        `Votre solde (${walletBalance.toLocaleString()} FCFA) est insuffisant pour cette commande (${totalAmount.toLocaleString()} FCFA).`,
        [
          { text: 'Recharger', onPress: () => handleRechargeWallet() },
          { text: 'Annuler', style: 'cancel' },
        ]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // Simuler le processus de paiement
      await simulatePayment(method, totalAmount);
      
      if (onPaymentMethodSelected) {
        onPaymentMethodSelected(method);
      }
    } catch (error) {
      Alert.alert('Erreur de paiement', 'Une erreur est survenue lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePayment = async (method: PaymentMethod, amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler une réussite dans 90% des cas
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000);
    });
  };

  const handleRechargeWallet = () => {
    Alert.alert(
      'Recharger le portefeuille',
      'Choisissez une méthode pour recharger votre portefeuille YATOU',
      [
        { text: 'Orange Money', onPress: () => console.log('Recharge via Orange Money') },
        { text: 'Wave', onPress: () => console.log('Recharge via Wave') },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💳 Mode de paiement</Text>
        <Text style={styles.subtitle}>
          Montant total: {formatPrice(totalAmount)}
        </Text>
      </View>

      <ScrollView style={styles.paymentMethods} showsVerticalScrollIndicator={false}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const isWallet = method.id === 'wallet';
          const hasInsufficientBalance = isWallet && walletBalance < totalAmount;

          return (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethodCard,
                isSelected && styles.paymentMethodCardSelected,
                !method.available && styles.paymentMethodCardDisabled,
                hasInsufficientBalance && styles.paymentMethodCardInsufficient,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.available || isProcessing}
              activeOpacity={0.7}
            >
              <View style={styles.paymentMethodHeader}>
                <View style={styles.paymentMethodIcon}>
                  <Text style={styles.paymentMethodIconText}>
                    {method.icon}
                  </Text>
                </View>
                
                <View style={styles.paymentMethodInfo}>
                  <View style={styles.paymentMethodTitleRow}>
                    <Text style={[
                      styles.paymentMethodName,
                      isSelected && styles.paymentMethodNameSelected,
                      !method.available && styles.paymentMethodNameDisabled,
                    ]}>
                      {method.name}
                    </Text>
                    {method.instant && (
                      <View style={styles.instantBadge}>
                        <Text style={styles.instantBadgeText}>⚡</Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={[
                    styles.paymentMethodDescription,
                    !method.available && styles.paymentMethodDescriptionDisabled,
                  ]}>
                    {method.description}
                  </Text>

                  {isWallet && showWalletBalance && (
                    <View style={styles.walletBalanceContainer}>
                      <Text style={styles.walletBalanceLabel}>
                        Solde disponible:
                      </Text>
                      <Text style={[
                        styles.walletBalanceAmount,
                        hasInsufficientBalance && styles.walletBalanceInsufficient,
                      ]}>
                        {formatPrice(walletBalance)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.paymentMethodRight}>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <CheckCircle size={20} color={AppColors.primary} />
                    </View>
                  )}
                  
                  {!method.available && (
                    <View style={styles.unavailableIndicator}>
                      <Text style={styles.unavailableText}>Indisponible</Text>
                    </View>
                  )}
                  
                  {hasInsufficientBalance && (
                    <View style={styles.insufficientIndicator}>
                      <Text style={styles.insufficientText}>Solde insuffisant</Text>
                    </View>
                  )}
                </View>
              </View>

              {method.processingFee && (
                <View style={styles.processingFeeContainer}>
                  <Text style={styles.processingFeeText}>
                    Frais de traitement: {formatPrice(method.processingFee)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Informations de sécurité */}
      <View style={styles.securityInfo}>
        <Text style={styles.securityTitle}>🔒 Paiement sécurisé</Text>
        <Text style={styles.securityDescription}>
          Tous vos paiements sont protégés par un chiffrement de niveau bancaire. 
          Vos informations de paiement ne sont jamais stockées sur nos serveurs.
        </Text>
      </View>

      {/* Bouton de confirmation */}
      {selectedMethod && (
        <TouchableOpacity
          style={[
            styles.confirmButton,
            isProcessing && styles.confirmButtonProcessing,
          ]}
          onPress={() => handlePaymentMethodSelect(selectedMethod)}
          disabled={isProcessing}
        >
          <Text style={styles.confirmButtonText}>
            {isProcessing ? 'Traitement...' : `Payer ${formatPrice(totalAmount)}`}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.primary,
  },
  paymentMethods: {
    maxHeight: 400,
  },
  paymentMethodCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  paymentMethodCardSelected: {
    borderColor: AppColors.primary,
    backgroundColor: '#F0F9FF',
  },
  paymentMethodCardDisabled: {
    opacity: 0.5,
    borderColor: '#D1D5DB',
  },
  paymentMethodCardInsufficient: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  paymentMethodIconText: {
    fontSize: 24,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  paymentMethodNameSelected: {
    color: AppColors.primary,
  },
  paymentMethodNameDisabled: {
    color: '#9CA3AF',
  },
  instantBadge: {
    marginLeft: 8,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  instantBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#D97706',
  },
  paymentMethodDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  paymentMethodDescriptionDisabled: {
    color: '#9CA3AF',
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  walletBalanceLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 4,
  },
  walletBalanceAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  walletBalanceInsufficient: {
    color: '#EF4444',
  },
  paymentMethodRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableIndicator: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  insufficientIndicator: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  insufficientText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },
  processingFeeContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  processingFeeText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  securityInfo: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  securityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  securityDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  confirmButton: {
    marginTop: 20,
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
  confirmButtonProcessing: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
