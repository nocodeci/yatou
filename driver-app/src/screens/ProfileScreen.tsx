import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppColors } from '../constants/colors';
import { Driver } from '../types';

export default function ProfileScreen() {
  const [driver] = useState<Driver>({
    id: '1',
    name: 'Kouassi Jean',
    phone: '+225 0123456789',
    email: 'kouassi.jean@yatou.com',
    vehicleType: 'moto',
    vehiclePlate: 'AB-123-CD',
    currentLocation: { latitude: 5.3600, longitude: -4.0083 },
    isOnline: true,
    isAvailable: true,
    rating: 4.8,
    totalDeliveries: 156,
    earnings: 125000,
  });

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: () => {
          Alert.alert('Déconnecté', 'Vous avez été déconnecté avec succès.');
        }},
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Modifier le profil', 'Fonctionnalité à venir...');
  };

  const handleVehicleInfo = () => {
    Alert.alert(
      'Informations du véhicule',
      `Type: ${driver.vehicleType}\nPlaque: ${driver.vehiclePlate}`
    );
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'moto': return 'bicycle';
      case 'tricycle': return 'car-sport';
      case 'cargo': return 'car';
      case 'van': return 'car-sport';
      default: return 'car';
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'moto': return 'Moto';
      case 'tricycle': return 'Tricycle';
      case 'cargo': return 'Cargo';
      case 'van': return 'Fourgonnette';
      default: return 'Véhicule';
    }
  };

  const renderStatCard = (title: string, value: string, icon: string, color: string) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.primary} />
      
      {/* Header avec photo de profil */}
      <LinearGradient
        colors={[AppColors.primary, AppColors.secondary]}
        style={styles.header}
      >
        <View style={styles.profileImage}>
          <Ionicons name="person" size={40} color={AppColors.white} />
        </View>
        
        <Text style={styles.profileName}>{driver.name}</Text>
        <Text style={styles.profileEmail}>{driver.email}</Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={AppColors.warning} />
          <Text style={styles.ratingText}>{driver.rating}</Text>
          <Text style={styles.ratingLabel}>({driver.totalDeliveries} livraisons)</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Informations du véhicule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mon Véhicule</Text>
            <TouchableOpacity onPress={handleVehicleInfo}>
              <Ionicons name="information-circle" size={20} color={AppColors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleInfo}>
              <View style={styles.vehicleIconContainer}>
                <Ionicons 
                  name={getVehicleIcon(driver.vehicleType)} 
                  size={32} 
                  color={AppColors.primary} 
                />
              </View>
              <View style={styles.vehicleDetails}>
                <Text style={styles.vehicleType}>{getVehicleLabel(driver.vehicleType)}</Text>
                <Text style={styles.vehiclePlate}>{driver.vehiclePlate}</Text>
              </View>
            </View>
            
            <View style={styles.vehicleStatus}>
              <View style={[styles.statusDot, { backgroundColor: AppColors.success }]} />
              <Text style={styles.statusText}>Disponible</Text>
            </View>
          </View>
        </View>

        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          
          <View style={styles.statsGrid}>
            {renderStatCard(
              'Livraisons totales',
              driver.totalDeliveries.toString(),
              'checkmark-circle',
              AppColors.success
            )}
            
            {renderStatCard(
              'Gains totaux',
              `${driver.earnings.toLocaleString()} FCFA`,
              'cash',
              AppColors.warning
            )}
            
            {renderStatCard(
              'Note moyenne',
              driver.rating.toString(),
              'star',
              AppColors.info
            )}
            
            {renderStatCard(
              'Statut',
              driver.isOnline ? 'En ligne' : 'Hors ligne',
              'wifi',
              driver.isOnline ? AppColors.success : AppColors.danger
            )}
          </View>
        </View>

        {/* Actions rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <Ionicons name="create" size={20} color={AppColors.primary} />
              <Text style={styles.actionButtonText}>Modifier le profil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="settings" size={20} color={AppColors.primary} />
              <Text style={styles.actionButtonText}>Paramètres</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="help-circle" size={20} color={AppColors.primary} />
              <Text style={styles.actionButtonText}>Aide & Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="document-text" size={20} color={AppColors.primary} />
              <Text style={styles.actionButtonText}>Conditions d'utilisation</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informations de contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de contact</Text>
          
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>{driver.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>{driver.email}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Ionicons name="location" size={20} color={AppColors.primary} />
              <Text style={styles.contactText}>Abidjan, Côte d'Ivoire</Text>
            </View>
          </View>
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={AppColors.danger} />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.white + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.white,
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: AppColors.white + 'CC',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.white,
  },
  ratingLabel: {
    fontSize: 14,
    color: AppColors.white + 'CC',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  vehicleCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 16,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  vehicleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: AppColors.white,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: AppColors.textSecondary,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: '500',
  },
  contactInfo: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: AppColors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  logoutButtonText: {
    fontSize: 16,
    color: AppColors.danger,
    fontWeight: '600',
  },
});
