"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRouter } from "expo-router"
import { MapPin } from "lucide-react-native"

interface LocationItem {
  id: string
  name: string
  address: string
  icon: string
  type: "current" | "gps" | "location" | "home" | "work"
}

const predefinedLocations: LocationItem[] = [
  {
    id: "current",
    name: "Emplacement actuel",
    address: "",
    icon: "🏃‍♂️",
    type: "current",
  },
  {
    id: "gps",
    name: "Votre position",
    address: "Prise en charge à votre position GPS",
    icon: "📍",
    type: "gps",
  },
  {
    id: "ngattakro",
    name: "N'gattakro",
    address: "Bouaké, Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
  {
    id: "bouake1",
    name: "Bouaké",
    address: "Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
  {
    id: "avenue-alassane",
    name: "Avenue Alassane Ouattara",
    address: "Bouaké, Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
  {
    id: "maison1",
    name: "Maison",
    address: "Bouaké",
    icon: "🏠",
    type: "home",
  },
  {
    id: "super-marche",
    name: "Super marché galaxy",
    address: "Avenue Mamadou Konaté",
    icon: "🏠",
    type: "home",
  },
  {
    id: "maison-flora",
    name: "Maison Flora",
    address: "Ahougnansou 1",
    icon: "🏠",
    type: "home",
  },
  {
    id: "maison-abidjan",
    name: "Maison Abidjan",
    address: "Quartier de la Djorobité II",
    icon: "🏠",
    type: "home",
  },
  {
    id: "travail",
    name: "Travail",
    address: "232, Rue L259",
    icon: "💼",
    type: "work",
  },
  {
    id: "bouake2",
    name: "Bouaké",
    address: "Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
  {
    id: "bouake3",
    name: "Bouaké",
    address: "Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
  {
    id: "ngattakro2",
    name: "N'gattakro",
    address: "Bouaké, Gbeke, Vallée du Bandama",
    icon: "📍",
    type: "location",
  },
]

export default function SelectLocationsScreen() {
  const router = useRouter()
  const [departureLocation, setDepartureLocation] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeField, setActiveField] = useState<"departure" | "destination" | null>(null)

  const filteredLocations = predefinedLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleLocationSelect = (location: LocationItem) => {
    if (activeField === "departure") {
      setDepartureLocation(location.name)
    } else if (activeField === "destination") {
      setDestinationLocation(location.name)
    }
    setSearchQuery("")
    setActiveField(null)
  }

  const handleConfirmTrip = () => {
    if (departureLocation && destinationLocation) {
      // Navigation vers la page d'accueil avec les paramètres
      router.push({
        pathname: "/(tabs)",
        params: {
          originName: departureLocation,
          destinationName: destinationLocation,
          originCoords: "-5.0301,7.6901", // Coordonnées par défaut
          destinationCoords: "-5.0289,7.6895", // Coordonnées par défaut
        },
      })
    }
  }

  const renderLocationItem = (item: LocationItem) => {
    const isCurrentLocation = item.type === "current"

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.locationItem, isCurrentLocation && styles.currentLocationItem]}
        onPress={() => handleLocationSelect(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isCurrentLocation && styles.currentLocationIcon]}>
          <Text style={styles.locationIcon}>{item.icon}</Text>
        </View>
        <View style={styles.locationContent}>
          <Text style={[styles.locationName, isCurrentLocation && styles.currentLocationName]}>{item.name}</Text>
          {item.address && <Text style={styles.locationAddress}>{item.address}</Text>}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statusBar} />
        <Text style={styles.headerTitle}>Planifier votre trajet</Text>
      </View>

      <View style={styles.inputContainer}>
        {/* Lieu de départ */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <View style={styles.departureDot} />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Lieu de départ"
            placeholderTextColor="#9CA3AF"
            value={departureLocation}
            onChangeText={setDepartureLocation}
            onFocus={() => setActiveField("departure")}
            onBlur={() => setActiveField(null)}
          />
        </View>

        <View style={styles.routeLine} />

        {/* Lieu de destination */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputIcon}>
            <MapPin size={16} color="#EF4444" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Lieu de destination"
            placeholderTextColor="#9CA3AF"
            value={destinationLocation}
            onChangeText={setDestinationLocation}
            onFocus={() => setActiveField("destination")}
            onBlur={() => setActiveField(null)}
          />
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setDepartureLocation("Domicile")}
        >
          <Text style={styles.quickActionIcon}>🏠</Text>
          <Text style={styles.quickActionText}>Domicile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setDepartureLocation("Bureau")}
        >
          <Text style={styles.quickActionIcon}>💼</Text>
          <Text style={styles.quickActionText}>Bureau</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => setDepartureLocation("Position actuelle")}
        >
          <Text style={styles.quickActionIcon}>📍</Text>
          <Text style={styles.quickActionText}>Ma position</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de recherche pour les suggestions */}
      {activeField && (
        <View style={styles.searchSection}>
          <View style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={`Rechercher ${activeField === "departure" ? "un lieu de départ" : "une destination"}...`}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      {/* Liste des suggestions */}
      {activeField && searchQuery && (
        <ScrollView style={styles.locationsList} showsVerticalScrollIndicator={false}>
          {filteredLocations.map(renderLocationItem)}
        </ScrollView>
      )}

      {/* Bouton de confirmation */}
      <View style={styles.confirmSection}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!departureLocation || !destinationLocation) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmTrip}
          disabled={!departureLocation || !destinationLocation}
        >
          <Text style={styles.confirmButtonText}>Confirmer le trajet</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingTop: 8,
    paddingBottom: 16,
    alignItems: "center",
  },
  statusBar: {
    width: 60,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  inputContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    alignItems: "center",
  },
  departureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 9,
    marginVertical: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIconContainer: {
    width: 24,
    height: 24,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#374151",
  },
  locationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  currentLocationItem: {
    backgroundColor: "#F0F9FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
  },
  currentLocationIcon: {
    backgroundColor: "#EF4444",
  },
  currentLocationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  locationIcon: {
    fontSize: 16,
  },
  locationContent: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  locationAddress: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  confirmSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
})
