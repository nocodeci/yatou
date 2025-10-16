import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Clock, Package, Users, Box, AlertCircle } from 'lucide-react-native';
import { PricingOptions, VehicleType, VEHICLE_TYPES } from '@/utils/yatouPricingCalculator';
import { AppColors } from '@/app/constants/colors';

interface YatouServiceOptionsProps {
  vehicleType: VehicleType;
  options: PricingOptions;
  onOptionsChange: (options: PricingOptions) => void;
  showAllOptions?: boolean;
}

export default function YatouServiceOptions({
  vehicleType,
  options,
  onOptionsChange,
  showAllOptions = true,
}: YatouServiceOptionsProps) {
  const [waitingTime, setWaitingTime] = useState(options.waiting || 0);

  const updateOption = (key: keyof PricingOptions, value: any) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const handleWaitingTimeChange = (text: string) => {
    const time = parseInt(text) || 0;
    setWaitingTime(time);
    updateOption('waiting', time);
  };

  const vehicleInfo = VEHICLE_TYPES[vehicleType];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚙️ Options de service</Text>
      <Text style={styles.subtitle}>
        Personnalisez votre {vehicleInfo.name.toLowerCase()}
      </Text>

      <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
        {/* Aide au chargement/déchargement */}
        {(vehicleType === 'fourgon' || vehicleType === 'camion') && (
          <View style={styles.optionItem}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <Package size={20} color={AppColors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  Aide au chargement/déchargement
                </Text>
                <Text style={styles.optionDescription}>
                  {vehicleType === 'camion' ? '2 personnes pour vous aider' : '1 personne pour vous aider'}
                </Text>
                <Text style={styles.optionPrice}>
                  +{vehicleType === 'camion' ? '5,000' : '1,500'} FCFA
                </Text>
              </View>
              <Switch
                value={options.loading || false}
                onValueChange={(value) => updateOption('loading', value)}
                trackColor={{ false: '#E5E7EB', true: AppColors.primary + '40' }}
                thumbColor={options.loading ? AppColors.primary : '#FFFFFF'}
              />
            </View>
          </View>
        )}

        {/* Aide au déménagement (camion uniquement) */}
        {vehicleType === 'camion' && (
          <View style={styles.optionItem}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <Users size={20} color={AppColors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  Aide au déménagement
                </Text>
                <Text style={styles.optionDescription}>
                  Équipe de 2 déménageurs professionnels
                </Text>
                <Text style={styles.optionPrice}>
                  +5,000 FCFA
                </Text>
              </View>
              <Switch
                value={options.moving || false}
                onValueChange={(value) => updateOption('moving', value)}
                trackColor={{ false: '#E5E7EB', true: AppColors.primary + '40' }}
                thumbColor={options.moving ? AppColors.primary : '#FFFFFF'}
              />
            </View>
          </View>
        )}

        {/* Matériel d'emballage (camion uniquement) */}
        {vehicleType === 'camion' && (
          <View style={styles.optionItem}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <Box size={20} color={AppColors.primary} />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  Matériel d'emballage
                </Text>
                <Text style={styles.optionDescription}>
                  Cartons, film plastique, sangles
                </Text>
                <Text style={styles.optionPrice}>
                  +3,000 FCFA
                </Text>
              </View>
              <Switch
                value={options.packaging || false}
                onValueChange={(value) => updateOption('packaging', value)}
                trackColor={{ false: '#E5E7EB', true: AppColors.primary + '40' }}
                thumbColor={options.packaging ? AppColors.primary : '#FFFFFF'}
              />
            </View>
          </View>
        )}

        {/* Attente sur place */}
        <View style={styles.optionItem}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Clock size={20} color={AppColors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Attente sur place
              </Text>
              <Text style={styles.optionDescription}>
                Temps d'attente supplémentaire (par tranche de 15min)
              </Text>
              <Text style={styles.optionPrice}>
                +500 FCFA/15min
              </Text>
            </View>
          </View>
          <View style={styles.waitingInputContainer}>
            <TextInput
              style={styles.waitingInput}
              value={waitingTime.toString()}
              onChangeText={handleWaitingTimeChange}
              placeholder="0"
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.waitingUnit}>min</Text>
          </View>
        </View>

        {/* Livraison urgente (moto uniquement) */}
        {vehicleType === 'moto' && (
          <View style={styles.optionItem}>
            <View style={styles.optionHeader}>
              <View style={styles.optionIcon}>
                <AlertCircle size={20} color="#EF4444" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>
                  Livraison urgente
                </Text>
                <Text style={styles.optionDescription}>
                  Priorité absolue, livraison en moins de 30min
                </Text>
                <Text style={styles.optionPrice}>
                  +200 FCFA
                </Text>
              </View>
              <Switch
                value={options.urgent || false}
                onValueChange={(value) => updateOption('urgent', value)}
                trackColor={{ false: '#E5E7EB', true: '#EF444440' }}
                thumbColor={options.urgent ? '#EF4444' : '#FFFFFF'}
              />
            </View>
          </View>
        )}

        {/* Heures de pointe */}
        <View style={styles.optionItem}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Clock size={20} color="#F59E0B" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Heures de pointe
              </Text>
              <Text style={styles.optionDescription}>
                Créneaux 17h-20h (supplément de 20%)
              </Text>
              <Text style={styles.optionPrice}>
                +20% du tarif
              </Text>
            </View>
            <Switch
              value={options.rushHour || false}
              onValueChange={(value) => updateOption('rushHour', value)}
              trackColor={{ false: '#E5E7EB', true: '#F59E0B40' }}
              thumbColor={options.rushHour ? '#F59E0B' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Weekend et jours fériés */}
        <View style={styles.optionItem}>
          <View style={styles.optionHeader}>
            <View style={styles.optionIcon}>
              <Clock size={20} color="#8B5CF6" />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>
                Weekend/Jours fériés
              </Text>
              <Text style={styles.optionDescription}>
                Samedi, dimanche et jours fériés (supplément de 30%)
              </Text>
              <Text style={styles.optionPrice}>
                +30% du tarif
              </Text>
            </View>
            <Switch
              value={options.weekend || false}
              onValueChange={(value) => updateOption('weekend', value)}
              trackColor={{ false: '#E5E7EB', true: '#8B5CF640' }}
              thumbColor={options.weekend ? '#8B5CF6' : '#FFFFFF'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Résumé des options sélectionnées */}
      {Object.values(options).some(value => value && value !== 0) && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📋 Options sélectionnées</Text>
          <View style={styles.summaryList}>
            {options.loading && (
              <Text style={styles.summaryItem}>
                ✓ Aide au chargement/déchargement
              </Text>
            )}
            {options.moving && (
              <Text style={styles.summaryItem}>
                ✓ Aide au déménagement
              </Text>
            )}
            {options.packaging && (
              <Text style={styles.summaryItem}>
                ✓ Matériel d'emballage
              </Text>
            )}
            {options.waiting && options.waiting > 0 && (
              <Text style={styles.summaryItem}>
                ✓ Attente: {options.waiting} minutes
              </Text>
            )}
            {options.urgent && (
              <Text style={styles.summaryItem}>
                ✓ Livraison urgente
              </Text>
            )}
            {options.rushHour && (
              <Text style={styles.summaryItem}>
                ✓ Heures de pointe
              </Text>
            )}
            {options.weekend && (
              <Text style={styles.summaryItem}>
                ✓ Weekend/Jours fériés
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const { height: screenHeight } = Dimensions.get('window');
const optionsListHeight = screenHeight * 0.6; // 60% de la hauteur de l'écran

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    margin: 0, // Supprimé la marge pour utiliser tout l'espace
    flex: 1, // Utilise tout l'espace disponible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  optionsList: {
    flex: 1, // Utilise tout l'espace disponible au lieu d'une hauteur fixe
    minHeight: optionsListHeight, // Hauteur dynamique basée sur l'écran
  },
  optionItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  waitingInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  waitingInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    backgroundColor: '#FFFFFF',
  },
  waitingUnit: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 12,
  },
  summaryList: {
    gap: 8,
  },
  summaryItem: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
});
