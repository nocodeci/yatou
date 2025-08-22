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
  coordinates: [number, number];
}

export default function SelectLocationsScreen() {
  const router = useRouter();
  const [originQuery, setOriginQuery] = useState('');
  const [destinationQuery, setDestinationQuery] = useState('');
  const [originResults, setOriginResults] = useState<Location[]>([]);
  const [destinationResults, setDestinationResults] = useState<Location[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);

  // Fonction pour rechercher des adresses avec Google Places API
  const performSearch = async (query: string, type: 'origin' | 'destination') => {
    if (query.length < 2) {
      if (type === 'origin') setOriginResults([]);
      else setDestinationResults([]);
      return;
    }

    try {
      const apiKey = "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI";
      
      const params = new URLSearchParams({
        input: query,
        key: apiKey,
        language: 'fr',
        components: 'country:ci',
        location: '7.6833,-5.0333',
        radius: '50000',
        types: 'establishment',
        sessiontoken: 'yatou_session_' + Date.now()
      });
      
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.predictions && data.predictions.length > 0) {
        const results = await Promise.all(
          data.predictions.slice(0, 5).map(async (prediction: any) => {
            try {
              const detailsParams = new URLSearchParams({
                place_id: prediction.place_id,
                key: apiKey,
                language: 'fr',
                fields: 'geometry,formatted_address,name,place_id'
              });
              
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
              
              if (detailsData.result && detailsData.result.geometry) {
                const { lat, lng } = detailsData.result.geometry.location;
                return {
                  id: prediction.place_id,
                  name: prediction.structured_formatting.main_text,
                  address: prediction.structured_formatting.secondary_text,
                  coordinates: [lng, lat] as [number, number],
                };
              }
            } catch (error) {
              console.error('Erreur lors de la récupération des détails:', error);
            }
            return null;
          })
        );

        const validResults = results.filter(result => result !== null);
        
        if (type === 'origin') {
          setOriginResults(validResults);
        } else {
          setDestinationResults(validResults);
        }
      } else {
        // Fallback vers les résultats simulés
        const mockResults = [
          {
            id: "1",
            name: "Marché de Bouaké",
            address: "Centre-ville, Bouaké, Côte d'Ivoire",
            coordinates: [-5.0301, 7.6901] as [number, number],
          },
          {
            id: "2",
            name: "Gare Routière de Bouaké",
            address: "Avenue de la Paix, Bouaké, Côte d'Ivoire",
            coordinates: [-5.0289, 7.6895] as [number, number],
          },
          {
            id: "3",
            name: "Université Alassane Ouattara",
            address: "Route de Man, Bouaké, Côte d'Ivoire",
            coordinates: [-5.0321, 7.6923] as [number, number],
          },
        ];

        const filteredResults = mockResults.filter(
          (result) =>
            result.name.toLowerCase().includes(query.toLowerCase()) ||
            result.address.toLowerCase().includes(query.toLowerCase()),
        );

        if (type === 'origin') {
          setOriginResults(filteredResults);
        } else {
          setDestinationResults(filteredResults);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    }
  };

  const handleOriginSearch = (text: string) => {
    setOriginQuery(text);
    performSearch(text, 'origin');
  };

  const handleDestinationSearch = (text: string) => {
    setDestinationQuery(text);
    performSearch(text, 'destination');
  };

  const handleOriginSelect = (location: Location) => {
    setSelectedOrigin(location);
    setOriginQuery(location.name);
    setOriginResults([]);
    setActiveInput(null);
  };

  const handleDestinationSelect = (location: Location) => {
    setSelectedDestination(location);
    setDestinationQuery(location.name);
    setDestinationResults([]);
    setActiveInput(null);
  };

  const handleConfirm = () => {
    if (selectedOrigin && selectedDestination) {
      // Naviguer vers la page principale avec les données
      router.push({
        pathname: '/(tabs)/',
        params: {
          originName: selectedOrigin.name,
          originCoords: selectedOrigin.coordinates.join(','),
          destinationName: selectedDestination.name,
          destinationCoords: selectedDestination.coordinates.join(',')
        }
      });
    } else {
      alert("Veuillez sélectionner le lieu de départ et de destination.");
    }
  };

  const renderSearchResults = (results: Location[], onSelect: (location: Location) => void) => {
    return (
      <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
        {results.map((result) => (
          <TouchableOpacity
            key={result.id}
            style={styles.searchResultItem}
            onPress={() => onSelect(result)}
            activeOpacity={0.7}
          >
            <View style={styles.resultIcon}>
              <Text style={styles.resultIconText}>📍</Text>
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.resultName}>{result.name}</Text>
              <Text style={styles.resultAddress}>{result.address}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Sélectionner les lieux", headerBackTitle: "Retour" }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Sélection des lieux</Text>
        {/* Origin Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lieu de prise en charge</Text>
          <TextInput
            style={[
              styles.input,
              activeInput === 'origin' && styles.inputActive
            ]}
            placeholder="Où récupérer le colis ?"
            placeholderTextColor={AppColors.textSecondary}
            value={originQuery}
            onChangeText={handleOriginSearch}
            onFocus={() => setActiveInput('origin')}
            onBlur={() => setTimeout(() => setActiveInput(null), 200)}
          />
          {activeInput === 'origin' && originResults.length > 0 && (
            renderSearchResults(originResults, handleOriginSelect)
          )}
        </View>

        {/* Destination Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Lieu de destination</Text>
          <TextInput
            style={[
              styles.input,
              activeInput === 'destination' && styles.inputActive
            ]}
            placeholder="Où livrer le colis ?"
            placeholderTextColor={AppColors.textSecondary}
            value={destinationQuery}
            onChangeText={handleDestinationSearch}
            onFocus={() => setActiveInput('destination')}
            onBlur={() => setTimeout(() => setActiveInput(null), 200)}
          />
          {activeInput === 'destination' && destinationResults.length > 0 && (
            renderSearchResults(destinationResults, handleDestinationSelect)
          )}
        </View>

        {/* Selected locations preview */}
        {(selectedOrigin || selectedDestination) && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>Aperçu du trajet</Text>
            
            {selectedOrigin && (
              <View style={styles.previewItem}>
                <View style={[styles.previewDot, { backgroundColor: AppColors.primary }]} />
                <Text style={styles.previewText}>{selectedOrigin.name}</Text>
              </View>
            )}
            
            {selectedDestination && (
              <View style={styles.previewItem}>
                <View style={[styles.previewDot, { backgroundColor: "#EF4444" }]} />
                <Text style={styles.previewText}>{selectedDestination.name}</Text>
              </View>
            )}
          </View>
        )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.confirmButton,
              (!selectedOrigin || !selectedDestination) && styles.confirmButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!selectedOrigin || !selectedDestination}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>
              Confirmer l'itinéraire
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formSection: {
    padding: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 16,
  },



  inputContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: AppColors.white,
    color: AppColors.text,
  },
  inputActive: {
    borderColor: AppColors.primary,
    backgroundColor: AppColors.white,
  },
  searchResults: {
    maxHeight: 200,
    marginTop: 8,
    backgroundColor: AppColors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultIcon: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultIconText: {
    fontSize: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 2,
  },
  resultAddress: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  previewContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 16,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  previewText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 60,
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.white,
  },
});
