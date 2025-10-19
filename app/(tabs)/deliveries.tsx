import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useDeliveryStore } from '@/app/store/delivery-store';
import { AppColors } from '@/app/constants/colors';
import DeliveryCard from '@/components/DeliveryCard';
import { Package, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DeliveriesScreen() {
  const router = useRouter();
  const { deliveries, isLoading, loadData } = useDeliveryStore();

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const renderDelivery = ({ item }: { item: any }) => (
    <DeliveryCard
      delivery={item}
      onPress={() => router.push(`/delivery/${item.id}`)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Livraisons</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/new-delivery')}
        >
          <Plus size={20} color={AppColors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Chargement des livraisons...</Text>
        </View>
      ) : deliveries.length > 0 ? (
        <FlatList
          data={deliveries}
          renderItem={renderDelivery}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={loadData}
        />
      ) : (
        <View style={styles.emptyState}>
          <Package size={64} color={AppColors.textSecondary} />
          <Text style={styles.emptyTitle}>Aucune livraison</Text>
          <Text style={styles.emptyText}>
            Commencez par créer votre première livraison
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/new-delivery')}
          >
            <Text style={styles.createButtonText}>Créer une livraison</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: AppColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: AppColors.textSecondary,
  },
});