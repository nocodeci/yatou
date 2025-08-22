import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { AppColors } from '@/app/constants/colors';

interface Location {
  id: string;
  name: string;
  address: string;
  icon: string;
  type: 'current' | 'destination' | 'saved' | 'recent';
}

export default function SelectLocationsScreen() {
  const router = useRouter();
  const [destinationQuery, setDestinationQuery] = useState('');

  // Données des lieux selon l'image
  const locations: Location[] = [
    {
      id: '1',
      name: 'Votre position',
      address: 'Prise en charge à votre position GPS',
      icon: '📱',
      type: 'current'
    },
    {
      id: '2',
      name: "N'gattakro",
      address: 'Bouaké, Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    },
    {
      id: '3',
      name: 'Bouaké',
      address: 'Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    },
    {
      id: '4',
      name: 'Avenue Alassane Ouattara',
      address: 'Bouaké, Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    },
    {
      id: '5',
      name: 'Maison',
      address: 'Bouaké',
      icon: '🏠',
      type: 'saved'
    },
    {
      id: '6',
      name: 'Super marché galaxy',
      address: 'Avenue Mamadou Konaté',
      icon: '🛒',
      type: 'saved'
    },
    {
      id: '7',
      name: 'Maison Flora',
      address: 'Ahougnansou 1',
      icon: '🏠',
      type: 'saved'
    },
    {
      id: '8',
      name: 'Maison Abidjan',
      address: 'Quartier de la Djorobité II',
      icon: '🏠',
      type: 'saved'
    },
    {
      id: '9',
      name: 'Travail',
      address: '232, Rue L259',
      icon: '💼',
      type: 'saved'
    },
    {
      id: '10',
      name: 'Bouaké',
      address: 'Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    },
    {
      id: '11',
      name: 'Bouaké',
      address: 'Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    },
    {
      id: '12',
      name: "N'gattakro",
      address: 'Bouaké, Gbeke, Vallée du Bandama',
      icon: '📍',
      type: 'recent'
    }
  ];

  const handleLocationSelect = (location: Location) => {
    // Navigation vers la page d'accueil avec les données sélectionnées
    router.push({
      pathname: '/(tabs)',
      params: {
        destinationName: location.name,
        destinationAddress: location.address,
        destinationId: location.id
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          title: "Sélection des lieux",
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1F2937',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Handle pour fermer la modale */}
        <View style={styles.handle} />
        
        {/* Section Emplacement actuel */}
        <View style={styles.currentLocationSection}>
          <Text style={styles.sectionTitle}>Emplacement actuel</Text>
          <View style={styles.currentLocationCard}>
            <View style={styles.currentLocationIcon}>
              <Text style={styles.currentLocationIconText}>🚶</Text>
            </View>
            <View style={styles.currentLocationInfo}>
              <Text style={styles.currentLocationName}>Votre position</Text>
              <Text style={styles.currentLocationAddress}>Prise en charge à votre position GPS</Text>
            </View>
          </View>
        </View>

        {/* Champ de recherche destination */}
        <View style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🏁</Text>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Où allez-vous?"
              placeholderTextColor="#9CA3AF"
              value={destinationQuery}
              onChangeText={setDestinationQuery}
            />
          </View>
        </View>

        {/* Liste des lieux */}
        <ScrollView 
          style={styles.locationsList}
          showsVerticalScrollIndicator={true}
          indicatorStyle="black"
        >
          {locations.map((location, index) => (
            <TouchableOpacity
              key={location.id}
              style={styles.locationItem}
              onPress={() => handleLocationSelect(location)}
              activeOpacity={0.7}
            >
              <View style={styles.locationIcon}>
                <Text style={styles.locationIconText}>{location.icon}</Text>
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  currentLocationSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  currentLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  currentLocationIconText: {
    fontSize: 20,
  },
  currentLocationInfo: {
    flex: 1,
  },
  currentLocationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  currentLocationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  locationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationIconText: {
    fontSize: 18,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
});
