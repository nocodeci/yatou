import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { 
  MapPin, 
  Clock, 
  Package, 
  User, 
  Phone, 
  Check, 
  X,
  Navigation,
  DollarSign
} from 'lucide-react-native';
import { AppColors } from '@/app/constants/colors';
import { deliveryService } from '@/app/services/api';
import { useAuthStore } from '@/app/store/authStore';

const { width } = Dimensions.get('window');

interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  distance: number;
  price: number;
  vehicleType: 'moto' | 'fourgon' | 'camion';
  isUrgent: boolean;
  estimatedTime: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed';
  createdAt: string;
}

export default function DriverOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<'available' | 'active'>('available');
  const { user } = useAuthStore();

  // Charger les commandes depuis l'API
  useEffect(() => {
    loadOrders();
  }, [selectedTab]);

  const loadOrders = async () => {
    if (!user) return;
    
    try {
      if (selectedTab === 'available') {
        // Charger les commandes disponibles
        const availableDeliveries = await deliveryService.getAvailableDeliveries();
        const formattedOrders: Order[] = availableDeliveries.map(delivery => ({
          id: delivery.id,
          clientName: 'Client', // À récupérer depuis la table users
          clientPhone: '+225 00 00 00 00', // À récupérer depuis la table users
          pickupAddress: delivery.pickup_address,
          deliveryAddress: delivery.delivery_address,
          distance: 0, // À calculer
          price: delivery.estimated_price,
          vehicleType: 'moto', // À déterminer selon le type de livraison
          isUrgent: false, // À déterminer selon les options
          estimatedTime: delivery.estimated_duration || 30,
          status: 'pending',
          createdAt: delivery.created_at,
        }));
        setOrders(formattedOrders);
      } else {
        // Charger les commandes actives du livreur
        const driverDeliveries = await deliveryService.getDriverDeliveries(user.id);
        const formattedOrders: Order[] = driverDeliveries.map(delivery => ({
          id: delivery.id,
          clientName: 'Client', // À récupérer depuis la table users
          clientPhone: '+225 00 00 00 00', // À récupérer depuis la table users
          pickupAddress: delivery.pickup_address,
          deliveryAddress: delivery.delivery_address,
          distance: 0, // À calculer
          price: delivery.estimated_price,
          vehicleType: 'moto', // À déterminer selon le type de livraison
          isUrgent: false, // À déterminer selon les options
          estimatedTime: delivery.estimated_duration || 30,
          status: delivery.status === 'confirmed' ? 'accepted' : 
                  delivery.status === 'picked_up' ? 'in_progress' : 'pending',
          createdAt: delivery.created_at,
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
      
      // Pas de données de fallback - laisser la liste vide
      setOrders([]);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    if (!user) return;
    
    Alert.alert(
      'Accepter la commande',
      'Êtes-vous sûr de vouloir accepter cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Accepter', 
          onPress: async () => {
            try {
              await deliveryService.acceptDelivery(orderId, user.id);
              setOrders(prev => prev.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'accepted' as const }
                  : order
              ));
              Alert.alert('Succès', 'Commande acceptée !');
              // Recharger les commandes
              loadOrders();
            } catch (error) {
              console.error('Erreur lors de l\'acceptation:', error);
              Alert.alert('Erreur', 'Impossible d\'accepter la commande');
            }
          }
        }
      ]
    );
  };

  const handleRejectOrder = async (orderId: string) => {
    Alert.alert(
      'Refuser la commande',
      'Êtes-vous sûr de vouloir refuser cette commande ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Refuser', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deliveryService.rejectDelivery(orderId);
              setOrders(prev => prev.filter(order => order.id !== orderId));
              Alert.alert('Commande refusée', 'La commande a été refusée');
              // Recharger les commandes
              loadOrders();
            } catch (error) {
              console.error('Erreur lors du refus:', error);
              Alert.alert('Erreur', 'Impossible de refuser la commande');
            }
          }
        }
      ]
    );
  };

  const handleStartDelivery = async (orderId: string) => {
    try {
      await deliveryService.updateDeliveryStatus(orderId, 'picked_up');
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'in_progress' as const }
          : order
      ));
      Alert.alert('Livraison démarrée', 'Vous pouvez maintenant commencer la livraison');
      // Recharger les commandes
      loadOrders();
    } catch (error) {
      console.error('Erreur lors du démarrage:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la livraison');
    }
  };

  const handleCompleteDelivery = async (orderId: string) => {
    Alert.alert(
      'Livraison terminée',
      'Confirmez que la livraison est terminée',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              await deliveryService.updateDeliveryStatus(orderId, 'delivered');
              setOrders(prev => prev.map(order => 
                order.id === orderId 
                  ? { ...order, status: 'completed' as const }
                  : order
              ));
              Alert.alert('Succès', 'Livraison terminée avec succès !');
              // Recharger les commandes
              loadOrders();
            } catch (error) {
              console.error('Erreur lors de la finalisation:', error);
              Alert.alert('Erreur', 'Impossible de finaliser la livraison');
            }
          }
        }
      ]
    );
  };

  const availableOrders = orders.filter(order => order.status === 'pending');
  const activeOrders = orders.filter(order => ['accepted', 'in_progress'].includes(order.status));

  const renderOrderCard = (order: Order) => {
    const getVehicleIcon = (type: string) => {
      switch (type) {
        case 'moto': return '🏍️';
        case 'fourgon': return '🚐';
        case 'camion': return '🚛';
        default: return '🚗';
      }
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return '#F59E0B';
        case 'accepted': return '#3B82F6';
        case 'in_progress': return '#10B981';
        case 'completed': return '#6B7280';
        default: return '#6B7280';
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case 'pending': return 'En attente';
        case 'accepted': return 'Acceptée';
        case 'in_progress': return 'En cours';
        case 'completed': return 'Terminée';
        default: return 'Inconnu';
      }
    };

    return (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.clientName}>{order.clientName}</Text>
            <View style={styles.orderMeta}>
              <Text style={styles.vehicleType}>
                {getVehicleIcon(order.vehicleType)} {order.vehicleType.toUpperCase()}
              </Text>
              {order.isUrgent && (
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <MapPin size={16} color="#10B981" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Départ</Text>
              <Text style={styles.addressText}>{order.pickupAddress}</Text>
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <MapPin size={16} color="#EF4444" />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Arrivée</Text>
              <Text style={styles.addressText}>{order.deliveryAddress}</Text>
            </View>
          </View>

          <View style={styles.orderStats}>
            <View style={styles.statItem}>
              <Clock size={16} color="#6B7280" />
              <Text style={styles.statText}>{order.estimatedTime} min</Text>
            </View>
            <View style={styles.statItem}>
              <Package size={16} color="#6B7280" />
              <Text style={styles.statText}>{order.distance} km</Text>
            </View>
            <View style={styles.statItem}>
              <DollarSign size={16} color="#6B7280" />
              <Text style={styles.statText}>{order.price} FCFA</Text>
            </View>
          </View>
        </View>

        {order.status === 'pending' && (
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectOrder(order.id)}
            >
              <X size={20} color="#EF4444" />
              <Text style={styles.rejectButtonText}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => handleAcceptOrder(order.id)}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'accepted' && (
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => Alert.alert('Appel', `Appeler ${order.clientPhone}`)}
            >
              <Phone size={20} color="#3B82F6" />
              <Text style={styles.phoneButtonText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => handleStartDelivery(order.id)}
            >
              <Navigation size={20} color="#FFFFFF" />
              <Text style={styles.startButtonText}>Commencer</Text>
            </TouchableOpacity>
          </View>
        )}

        {order.status === 'in_progress' && (
          <View style={styles.orderActions}>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => Alert.alert('Appel', `Appeler ${order.clientPhone}`)}
            >
              <Phone size={20} color="#3B82F6" />
              <Text style={styles.phoneButtonText}>Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => handleCompleteDelivery(order.id)}
            >
              <Check size={20} color="#FFFFFF" />
              <Text style={styles.completeButtonText}>Terminer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Commandes</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'available' && styles.tabActive]}
            onPress={() => setSelectedTab('available')}
          >
            <Text style={[styles.tabText, selectedTab === 'available' && styles.tabTextActive]}>
              Disponibles ({availableOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
              Actives ({activeOrders.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'available' && (
          <>
            {availableOrders.length > 0 ? (
              availableOrders.map(renderOrderCard)
            ) : (
              <View style={styles.emptyState}>
                <Package size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Aucune commande disponible</Text>
                <Text style={styles.emptyText}>
                  Restez en ligne pour recevoir de nouvelles commandes
                </Text>
              </View>
            )}
          </>
        )}

        {selectedTab === 'active' && (
          <>
            {activeOrders.length > 0 ? (
              activeOrders.map(renderOrderCard)
            ) : (
              <View style={styles.emptyState}>
                <Package size={48} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>Aucune commande active</Text>
                <Text style={styles.emptyText}>
                  Acceptez une commande pour commencer à livrer
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: AppColors.text,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 4,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleType: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  urgentBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  orderDetails: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  addressInfo: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: AppColors.text,
    lineHeight: 20,
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    gap: 8,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  phoneButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 8,
  },
  phoneButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10B981',
    gap: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
