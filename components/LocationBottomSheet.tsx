import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { AppColors } from '@/app/constants/colors';

const { height } = Dimensions.get('window');

interface LocationBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onLocationsSelected: (origin: any, destination: any) => void;
}

interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
}

export default function LocationBottomSheet({
  visible,
  onClose,
  onLocationsSelected,
}: LocationBottomSheetProps) {
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
      onLocationsSelected(selectedOrigin, selectedDestination);
      onClose();
      // Reset form
      setOriginQuery('');
      setDestinationQuery('');
      setSelectedOrigin(null);
      setSelectedDestination(null);
      setOriginResults([]);
      setDestinationResults([]);
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.bottomSheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Sélectionnez vos lieux</Text>

          {/* Origin Input */}
          <View style={styles.inputContainer}>
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
              onBlur={() => setActiveInput(null)}
            />
            {activeInput === 'origin' && originResults.length > 0 && (
              renderSearchResults(originResults, handleOriginSelect)
            )}
          </View>

          {/* Destination Input */}
          <View style={styles.inputContainer}>
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
              onBlur={() => setActiveInput(null)}
            />
            {activeInput === 'destination' && destinationResults.length > 0 && (
              renderSearchResults(destinationResults, handleDestinationSelect)
            )}
          </View>

          {/* Confirm Button */}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: AppColors.text,
    backgroundColor: '#F8FAFC',
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
  confirmButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
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
