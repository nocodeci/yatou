"use client"

import { useState, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native"
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

interface SearchResult {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
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
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [departureCoords, setDepartureCoords] = useState<string>("")
  const [destinationCoords, setDestinationCoords] = useState<string>("")
  const [isSelecting, setIsSelecting] = useState(false) // Nouvel état pour éviter les conflits

  // URL du backend
  const BACKEND_URL = "http://192.168.100.196:3000"

  // Log de l'état actuel
  console.log("🔄 État actuel:", {
    departureLocation,
    destinationLocation,
    activeField,
    searchResultsCount: searchResults.length,
    isSelecting
  })

  // Fonction pour rechercher des lieux via l'API Google Places
  const searchPlaces = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    console.log("🔍 Recherche en cours:", query)
    
    try {
      const url = `${BACKEND_URL}/api/places/autocomplete?input=${encodeURIComponent(query)}`
      console.log("📡 URL de requête:", url)
      
      const response = await fetch(url)
      console.log("📥 Réponse reçue:", response.status, response.statusText)
      
      const data = await response.json()
      console.log("📊 Données reçues:", data)

      if (data.status === "OK" && data.predictions) {
        console.log("✅ Prédictions trouvées:", data.predictions.length)
        setSearchResults(data.predictions)
      } else {
        console.error("❌ Erreur recherche lieux:", data.error_message)
        setSearchResults([])
      }
    } catch (error) {
      console.error("💥 Erreur lors de la recherche:", error)
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour obtenir les détails d'un lieu
  const getPlaceDetails = async (placeId: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/places/details?place_id=${encodeURIComponent(placeId)}`
      )
      const data = await response.json()

      if (data.status === "OK" && data.result && data.result.geometry) {
        const { lat, lng } = data.result.geometry.location
        return { lat, lng }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des détails:", error)
    }
    return null
  }

  // Fonction pour calculer l'itinéraire
  const calculateRoute = async (origin: string, destination: string) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
      )
      const data = await response.json()

      if (data.status === "OK" && data.routes && data.routes.length > 0) {
        return data.routes[0]
      }
    } catch (error) {
      console.error("Erreur lors du calcul d'itinéraire:", error)
    }
    return null
  }

  // Effet pour la recherche en temps réel
  useEffect(() => {
    if (activeField === "departure" && departureLocation.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPlaces(departureLocation)
      }, 300) // Délai de 300ms pour éviter trop de requêtes

      return () => clearTimeout(timeoutId)
    } else if (activeField === "destination" && destinationLocation.length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPlaces(destinationLocation)
      }, 300) // Délai de 300ms pour éviter trop de requêtes

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
    }
  }, [departureLocation, destinationLocation, activeField])

  const handleLocationSelect = async (location: LocationItem) => {
    console.log("📍 Sélection lieu prédéfini:", location.name, "pour le champ:", activeField)
    console.log("📍 État avant mise à jour - départ:", departureLocation, "destination:", destinationLocation)
    
    if (activeField === "departure") {
      console.log("📍 Mise à jour lieu de départ avec:", location.name)
      setDepartureLocation(location.name)
      // Coordonnées par défaut pour les lieux prédéfinis
      setDepartureCoords("-5.0301,7.6901")
    } else if (activeField === "destination") {
      console.log("📍 Mise à jour lieu de destination avec:", location.name)
      setDestinationLocation(location.name)
      setDestinationCoords("-5.0289,7.6895")
    } else {
      console.log("❌ Aucun champ actif détecté")
    }
    
    // Fermer le champ actif et vider les résultats
    console.log("📍 Fermeture du champ actif et vidage des résultats")
    setActiveField(null)
    setSearchResults([])
    
    // Réinitialiser l'état de sélection après un délai
    setTimeout(() => {
      setIsSelecting(false)
      console.log("📍 État après mise à jour - départ:", departureLocation, "destination:", destinationLocation)
    }, 200)
  }

  const handleSearchResultSelect = async (result: SearchResult) => {
    console.log("🔍 Sélection résultat recherche:", result.structured_formatting.main_text, "pour le champ:", activeField)
    console.log("🔍 État avant mise à jour - départ:", departureLocation, "destination:", destinationLocation)
    
    const placeName = result.structured_formatting.main_text
    const placeAddress = result.structured_formatting.secondary_text

    // Obtenir les coordonnées du lieu
    const coords = await getPlaceDetails(result.place_id)
    const coordsString = coords ? `${coords.lng},${coords.lat}` : ""

    if (activeField === "departure") {
      console.log("🔍 Mise à jour lieu de départ avec:", placeName)
      setDepartureLocation(placeName)
      setDepartureCoords(coordsString)
    } else if (activeField === "destination") {
      console.log("🔍 Mise à jour lieu de destination avec:", placeName)
      setDestinationLocation(placeName)
      setDestinationCoords(coordsString)
    } else {
      console.log("❌ Aucun champ actif détecté")
    }

    // Fermer le champ actif et vider les résultats
    console.log("🔍 Fermeture du champ actif et vidage des résultats")
    setActiveField(null)
    setSearchResults([])
    
    // Réinitialiser l'état de sélection après un délai
    setTimeout(() => {
      setIsSelecting(false)
      console.log("🔍 État après mise à jour - départ:", departureLocation, "destination:", destinationLocation)
    }, 200)
  }

  const handleConfirmTrip = async () => {
    if (!departureLocation || !destinationLocation) {
      Alert.alert("Erreur", "Veuillez sélectionner un lieu de départ et une destination")
      return
    }

    setIsLoading(true)
    try {
      // Calculer l'itinéraire
      const route = await calculateRoute(departureLocation, destinationLocation)

      if (route) {
        // Navigation vers la page d'accueil avec les paramètres
        router.push({
          pathname: "/(tabs)",
          params: {
            originName: departureLocation,
            destinationName: destinationLocation,
            originCoords: departureCoords || "-5.0301,7.6901",
            destinationCoords: destinationCoords || "-5.0289,7.6895",
          },
        })
      } else {
        Alert.alert("Erreur", "Impossible de calculer l'itinéraire. Veuillez réessayer.")
      }
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error)
      Alert.alert("Erreur", "Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderLocationItem = (item: LocationItem) => {
    const isCurrentLocation = item.type === "current"

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.locationItem, isCurrentLocation && styles.currentLocationItem]}
        onPressIn={() => {
          console.log("🖱️ PressIn sur lieu prédéfini:", item.name)
          setIsSelecting(true)
        }}
        onPress={() => {
          console.log("🖱️ Press sur lieu prédéfini:", item.name)
          handleLocationSelect(item)
        }}
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

  const renderSearchResult = (result: SearchResult) => {
    return (
      <TouchableOpacity
        key={result.place_id}
        style={styles.searchResultItem}
        onPressIn={() => {
          console.log("🖱️ PressIn sur résultat recherche:", result.structured_formatting.main_text)
          setIsSelecting(true)
        }}
        onPress={() => {
          console.log("🖱️ Press sur résultat recherche:", result.structured_formatting.main_text)
          handleSearchResultSelect(result)
        }}
        activeOpacity={0.7}
      >
        <View style={styles.searchResultIcon}>
          <Text style={styles.searchResultIconText}>📍</Text>
        </View>
        <View style={styles.searchResultContent}>
          <Text style={styles.searchResultName}>{result.structured_formatting.main_text}</Text>
          <Text style={styles.searchResultAddress}>{result.structured_formatting.secondary_text}</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
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
            onFocus={() => {
              console.log("🎯 Focus sur champ départ")
              setActiveField("departure")
            }}
            onBlur={() => {
              console.log("🎯 Blur sur champ départ, isSelecting:", isSelecting)
              if (!isSelecting) {
                setActiveField(null)
              }
            }}
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
            onFocus={() => {
              console.log("🎯 Focus sur champ destination")
              setActiveField("destination")
            }}
            onBlur={() => {
              console.log("🎯 Blur sur champ destination, isSelecting:", isSelecting)
              if (!isSelecting) {
                setActiveField(null)
              }
            }}
          />
        </View>
      </View>

      {/* Actions rapides et suggestions dans le même ScrollView */}
      <ScrollView style={styles.quickActionsContainer} showsVerticalScrollIndicator={false}>
        {/* Suggestions directement */}
        {activeField && (
          <>
            {/* Liste des suggestions */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Recherche en cours...</Text>
              </View>
            ) : (activeField === "departure" && departureLocation.length >= 2) || (activeField === "destination" && destinationLocation.length >= 2) ? (
              searchResults.length > 0 ? (
                // Résultats de recherche Google Places
                searchResults.map(renderSearchResult)
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>Aucun résultat trouvé</Text>
                </View>
              )
            ) : (
              // Lieux prédéfinis (sans emplacement actuel)
              predefinedLocations.filter(location => location.type !== "current").map(renderLocationItem)
            )}
          </>
        )}
      </ScrollView>

      {/* Bouton de confirmation */}
      <View style={styles.confirmSection}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            (!departureLocation || !destinationLocation || isLoading) && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmTrip}
          disabled={!departureLocation || !destinationLocation || isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {isLoading ? "Calcul en cours..." : "Confirmer le trajet"}
          </Text>
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
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
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
    height: 16,
    backgroundColor: "#E5E7EB",
    marginLeft: 9,
    marginVertical: 2,
  },
  quickActionsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 16,
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
  searchResultItem: {
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
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  searchResultIconText: {
    fontSize: 16,
  },
  searchResultContent: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
    color: "#9CA3AF",
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  noResultsContainer: {
    padding: 20,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "#6B7280",
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
