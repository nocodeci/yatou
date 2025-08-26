import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppColors } from '../constants/colors';
import { DeliveryOrder } from '../types';

// Données simulées pour les commandes
const mockOrders: DeliveryOrder[] = [
  {
    id: '1',
    customerName: 'Jean Dupont',
    customerPhone: '+225 0123456789',
    pickupAddress: '123 Rue de la Paix, Abidjan',
    deliveryAddress: '456 Avenue des Cocotiers, Abidjan',
    pickupLocation: { latitude: 5.3600, longitude: -4.0083 },
    deliveryLocation: { latitude: 5.3700, longitude: -4.0183 },
    packageDetails: 'Colis fragile - Électronique',
    packageWeight: 2.5,
    estimatedPrice: 2500,
    status: 'accepted',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
  },
  {
    id: '2',
    customerName: 'Marie Konan',
    customerPhone: '+225 0987654321',
    pickupAddress: '789 Boulevard de la République, Abidjan',
    deliveryAddress: '321 Rue des Jardins, Abidjan',
    pickupLocation: { latitude: 5.3500, longitude: -4.0100 },
    deliveryLocation: { latitude: 5.3800, longitude: -4.0200 },
    packageDetails: 'Documents importants',
    packageWeight: 0.5,
    estimatedPrice: 1800,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1h ago
  },
  {
    id: '3',
    customerName: 'Pierre Kouassi',
    customerPhone: '+225 0555666777',
    pickupAddress: '555 Avenue de la Victoire, Abidjan',
    deliveryAddress: '777 Rue du Commerce, Abidjan',
    pickupLocation: { latitude: 5.3650, longitude: -4.0150 },
    deliveryLocation: { latitude: 5.3750, longitude: -4.0250 },
    packageDetails: 'Nourriture - Restaurant',
    packageWeight: 1.8,
    estimatedPrice: 2200,
    status: 'picked_up',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30min ago
    actualPickupTime: new Date(Date.now() - 25 * 60 * 1000),
  },
];

export default function OrdersScreen() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockOrders);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simuler un rafraîchissement
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return AppColors.pending;
      case 'accepted': return AppColors.accepted;
      case 'picked_up': return AppColors.pickedUp;
      case 'in_transit': return AppColors.inTransit;
      case 'delivered': return AppColors.delivered;
      case 'cancelled': return AppColors.cancelled;
      default: return AppColors.textSecondary;
    }
  };

  const getStatusText = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'accepted': return 'Acceptée';
      case 'picked_up': return 'Collectée';
      case 'in_transit': return 'En transit';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const getStatusIcon = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'accepted': return 'checkmark-circle-outline';
      case 'picked_up': return 'bag-outline';
      case 'in_transit': return 'car-outline';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle';
      default: return 'help-outline';
    }
  };

  const handleOrderAction = (order: DeliveryOrder) => {
    switch (order.status) {
      case 'pending':
        Alert.alert(
          'Accepter la commande',
          `Voulez-vous accepter la livraison pour ${order.customerName} ?`,
          [
            { text: 'Refuser', style: 'cancel' },
            { 
              text: 'Accepter', 
              onPress: () => updateOrderStatus(order.id, 'accepted') 
            },
          ]
        );
        break;
      case 'accepted':
        Alert.alert(
          'Collecter la commande',
          `Êtes-vous arrivé au point de collecte ?`,
          [
            { text: 'Non', style: 'cancel' },
            { 
              text: 'Oui', 
              onPress: () => updateOrderStatus(order.id, 'picked_up') 
            },
          ]
        );
        break;
      case 'picked_up':
        Alert.alert(
          'Commencer la livraison',
          `Voulez-vous commencer la livraison vers ${order.customerName} ?`,
          [
            { text: 'Plus tard', style: 'cancel' },
            { 
              text: 'Commencer', 
              onPress: () => updateOrderStatus(order.id, 'in_transit') 
            },
          ]
        );
        break;
      case 'in_transit':
        Alert.alert(
          'Livrer la commande',
          `Avez-vous livré la commande à ${order.customerName} ?`,
          [
            { text: 'Non', style: 'cancel' },
            { 
              text: 'Oui', 
              onPress: () => updateOrderStatus(order.id, 'delivered') 
            },
          ]
        );
        break;
      default:
        Alert.alert('Commande terminée', 'Cette commande ne peut plus être modifiée.');
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: DeliveryOrder['status']) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              ...(newStatus === 'picked_up' && { actualPickupTime: new Date() }),
              ...(newStatus === 'delivered' && { actualDeliveryTime: new Date() }),
            }
          : order
      )
    );
    
    Alert.alert('Statut mis à jour', `Commande ${getStatusText(newStatus).toLowerCase()}`);
  };

  const renderOrderItem = ({ item }: { item: DeliveryOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => handleOrderAction(item)}
      activeOpacity={0.8}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.orderTime}>
            {new Date(item.createdAt).toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.addressRow}>
          <Ionicons name="location" size={16} color={AppColors.primary} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.pickupAddress}
          </Text>
        </View>
        
        <View style={styles.addressRow}>
          <Ionicons name="navigate" size={16} color={AppColors.deliveryMarker} />
          <Text style={styles.addressText} numberOfLines={1}>
            {item.deliveryAddress}
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.packageInfo}>
          <Text style={styles.packageDetails}>{item.packageDetails}</Text>
          <Text style={styles.packageWeight}>{item.packageWeight} kg</Text>
        </View>
        
        <Text style={styles.orderPrice}>{item.estimatedPrice} FCFA</Text>
      </View>

      {item.status === 'accepted' && (
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Aller au point de collecte</Text>
        </View>
      )}
      
      {item.status === 'picked_up' && (
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Commencer la livraison</Text>
        </View>
      )}
      
      {item.status === 'in_transit' && (
        <View style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Livrer la commande</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Commandes</Text>
        <Text style={styles.headerSubtitle}>
          {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} en cours
        </Text>
      </View>

      {/* Liste des commandes */}
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    backgroundColor: AppColors.white,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  ordersList: {
    padding: 20,
  },
  orderCard: {
    backgroundColor: AppColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  statusContainer: {
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageInfo: {
    flex: 1,
  },
  packageDetails: {
    fontSize: 14,
    color: AppColors.text,
    marginBottom: 4,
  },
  packageWeight: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  actionButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
