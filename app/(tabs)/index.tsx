"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useLocalSearchParams } from "expo-router"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Animated,
  TextInput,
} from "react-native"
import { Plus, MapPin, Clock, Star } from "lucide-react-native"
import { useRouter } from "expo-router"

import { AppColors } from "@/app/constants/colors"
import YatouLogo from "@/components/YatouLogo"
import GoogleMapViewComponent from "@/components/MapView"
import BottomSheet from "@/components/BottomSheet"

export default function ImprovedHomeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const { height } = Dimensions.get("window")
  const [selectedDestination, setSelectedDestination] = useState<[number, number] | null>(null)
  const [selectedOrigin, setSelectedOrigin] = useState<[number, number] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      name: string
      address: string
      coordinates: [number, number]
    }>
  >([])
  const [selectedDestinationName, setSelectedDestinationName] = useState<string>("")
  const [selectedOriginName, setSelectedOriginName] = useState<string>("")
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<"standard" | "premium">("standard")

  const [pickupLocation, setPickupLocation] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [showBottomSheet, setShowBottomSheet] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Simuler la position utilisateur (Bouaké)
    setUserLocation([-5.0301, 7.6901])

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  // Gérer les paramètres de retour depuis la page de sélection des lieux
  useEffect(() => {
    if (params.originName && params.destinationName && params.originCoords && params.destinationCoords) {
      const originCoords = (params.originCoords as string).split(",").map(Number) as [number, number]
      const destinationCoords = (params.destinationCoords as string).split(",").map(Number) as [number, number]

      setSelectedOrigin(originCoords)
      setSelectedOriginName(params.originName as string)
      setSelectedDestination(destinationCoords)
      setSelectedDestinationName(params.destinationName as string)
      setSearchQuery(params.destinationName as string)
    }
  }, [params])

  const handleSearchBarPress = () => {
    setShowBottomSheet(true)
  }

  const handleBottomSheetClose = () => {
    setShowBottomSheet(false)
  }

  const handleConfirmTrip = () => {
    if (pickupLocation && destinationLocation) {
      console.log("Trip confirmed:", { pickup: pickupLocation, destination: destinationLocation })
      handleBottomSheetClose()
      // Here you can add navigation to booking screen or other logic
    }
  }

  // Fonction pour rechercher des adresses réelles avec Google Places API
  const performSearch = async (query: string) => {
    console.log("Recherche pour:", query)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    try {
      // Utiliser directement l'API Google Places pour l'autocomplétion avec les meilleures pratiques
      const apiKey = "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI"

      // Construire l'URL avec les paramètres optimaux selon la documentation
      const params = new URLSearchParams({
        input: query,
        key: apiKey,
        language: "fr", // Langue française
        components: "country:ci", // Restreindre à la Côte d'Ivoire
        location: "7.6833,-5.0333", // Centre de Bouaké
        radius: "50000", // Rayon de 50km
        types: "establishment", // Types d'établissements
        sessiontoken: "yatou_session_" + Date.now(), // Token de session pour optimiser les coûts
      })

      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`

      console.log("URL Places Autocomplete:", url)

      const response = await fetch(url)
      const data = await response.json()

      console.log("Réponse Places Autocomplete:", {
        status: data.status,
        predictions: data.predictions ? data.predictions.length : 0,
        error_message: data.error_message,
      })

      if (data.predictions && data.predictions.length > 0) {
        const results = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction: any) => {
            try {
              // Obtenir les détails de chaque lieu directement via l'API
              const detailsParams = new URLSearchParams({
                place_id: prediction.place_id,
                key: apiKey,
                language: "fr",
                fields: "geometry,formatted_address,name,place_id",
              })

              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?${detailsParams.toString()}`
              const detailsResponse = await fetch(detailsUrl)
              const detailsData = await detailsResponse.json()

              if (detailsData.result && detailsData.result.geometry) {
                const { lat, lng } = detailsData.result.geometry.location
                return {
                  id: prediction.place_id,
                  name: prediction.structured_formatting.main_text,
                  address: prediction.structured_formatting.secondary_text,
                  coordinates: [lng, lat] as [number, number],
                }
              }
            } catch (error) {
              console.error("Erreur lors de la récupération des détails:", error)
            }
            return null
          }),
        )

        const validResults = results.filter((result) => result !== null)
        console.log("Résultats trouvés:", validResults.length)
        setSearchResults(validResults)
      } else {
        console.log("Aucune prédiction trouvée, utilisation des résultats simulés")
        // Fallback vers les résultats simulés si l'API échoue
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
        ]

        const filteredResults = mockResults.filter(
          (result) =>
            result.name.toLowerCase().includes(query.toLowerCase()) ||
            result.address.toLowerCase().includes(query.toLowerCase()),
        )

        setSearchResults(filteredResults)
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error)
      setSearchResults([])
    }
  }

  // Calculer la distance et les prix basés sur la destination sélectionnée
  const calculatePricing = useMemo(() => {
    const origin = selectedOrigin || userLocation
    const destination = selectedDestination

    if (!destination || !origin) {
      return {
        distance: 0,
        standardPrice: 0,
        premiumPrice: 0,
      }
    }

    // Calculer la distance en utilisant la formule de Haversine
    const R = 6371 // Rayon de la Terre en km
    const lat1 = (origin[1] * Math.PI) / 180
    const lat2 = (destination[1] * Math.PI) / 180
    const deltaLat = ((destination[1] - origin[1]) * Math.PI) / 180
    const deltaLng = ((destination[0] - origin[0]) * Math.PI) / 180

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    // Calculer les prix basés sur la distance
    const basePrice = 500 // Prix de base en FCFA
    const pricePerKm = 200 // Prix par km en FCFA

    const standardPrice = Math.round(basePrice + distance * pricePerKm)
    const premiumPrice = Math.round(standardPrice * 1.5) // 50% plus cher pour le premium

    return {
      distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
      standardPrice,
      premiumPrice,
    }
  }, [selectedDestination, selectedOrigin, userLocation])

  const pricingOptions = useMemo(
    () => [
      {
        id: "standard",
        name: "Standard",
        price: calculatePricing.standardPrice,
        time: "10-15",
        icon: "🏍️",
        description: "Service rapide et économique",
      },
      {
        id: "premium",
        name: "Premium",
        price: calculatePricing.premiumPrice,
        time: "15-25",
        icon: "🚗",
        description: "Confort et service haut de gamme",
      },
    ],
    [calculatePricing],
  )

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <View style={styles.mapContainer}>
        <GoogleMapViewComponent
          height={height}
          showUserLocation={true}
          selectedDestination={selectedDestination}
          selectedOrigin={selectedOrigin}
          userLocation={userLocation}
          onMapPress={(coordinates) => {
            console.log("Carte cliquée aux coordonnées:", coordinates)
          }}
        />

        <Animated.View style={[styles.topBar, { opacity: fadeAnim }]}>
          <View style={styles.topBarContent}>
            <View style={styles.topBarLeft}>
              <YatouLogo size="large" showText={false} variant="01" style={styles.topBarLogo} />
              <View style={styles.locationIndicator}>
                <MapPin size={16} color="#10B981" />
                <Text style={styles.locationText}>Bouaké</Text>
                <View style={styles.onlineIndicator} />
              </View>
            </View>

            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.notificationButton} activeOpacity={0.7}>
                <Text style={styles.notificationIcon}>🔔</Text>
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>2</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuContainer}
                onPress={() => router.push("/(tabs)/profile")}
                activeOpacity={0.7}
              >
                <View style={styles.menuIcon}>
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.searchBarContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.searchBar, isSearching && styles.searchBarActive]}
            onPress={handleSearchBarPress}
            activeOpacity={0.8}
          >
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text style={[styles.searchBarText, searchQuery && styles.searchBarTextActive]}>
              {searchQuery || "Où souhaitez-vous aller ?"}
            </Text>
            {searchQuery && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setSearchQuery("")}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            if (userLocation) {
              setUserLocation([...userLocation])
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.locationButtonInner}>
            <MapPin size={20} color="#10B981" />
          </View>
          <View style={styles.locationPulse} />
        </TouchableOpacity>

        {selectedOrigin && selectedDestination ? (
          <TouchableOpacity
            style={[styles.floatingButton, styles.confirmButton]}
            onPress={() => {
              alert(`Livraison créée de ${selectedOriginName} vers ${selectedDestinationName}`)
              setSelectedOrigin(null)
              setSelectedDestination(null)
              setSelectedOriginName("")
              setSelectedDestinationName("")
              setSearchQuery("")
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>✓</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => router.push("/new-delivery")}
            activeOpacity={0.8}
          >
            <Plus size={24} color={AppColors.white} />
          </TouchableOpacity>
        )}
      </View>

      <BottomSheet
        visible={showBottomSheet}
        onClose={handleBottomSheetClose}
        pickupLocation={pickupLocation}
        destinationLocation={destinationLocation}
        onPickupChange={setPickupLocation}
        onDestinationChange={setDestinationLocation}
        onConfirm={handleConfirmTrip}
      />

      <Animated.View
        style={[
          styles.bottomPanel,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {selectedOrigin && selectedDestination ? (
          <>
            <View style={styles.tripSection}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>Votre trajet</Text>
                <View style={styles.distanceChip}>
                  <Text style={styles.distanceText}>{calculatePricing.distance} km</Text>
                  <Clock size={12} color="#6B7280" />
                </View>
              </View>

              <View style={styles.tripRoute}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotStart]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>Départ</Text>
                    <Text style={styles.routeText}>{selectedOriginName || "Ma position"}</Text>
                  </View>
                </View>

                <View style={styles.routeLine} />

                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeLabel}>Arrivée</Text>
                    <Text style={styles.routeText}>{selectedDestinationName}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>Choisir votre service</Text>
              <View style={styles.serviceOptions}>
                {pricingOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.serviceOption, selectedServiceType === option.id && styles.serviceOptionSelected]}
                    onPress={() => setSelectedServiceType(option.id as "standard" | "premium")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceIcon}>{option.icon}</Text>
                      <View style={styles.serviceInfo}>
                        <Text
                          style={[styles.serviceName, selectedServiceType === option.id && styles.serviceNameSelected]}
                        >
                          {option.name}
                        </Text>
                        <Text style={styles.serviceDescription}>{option.description}</Text>
                      </View>
                      {selectedServiceType === option.id && (
                        <View style={styles.selectedIndicator}>
                          <Text style={styles.selectedIndicatorText}>✓</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.serviceDetails}>
                      <View style={styles.serviceTime}>
                        <Clock size={14} color="#6B7280" />
                        <Text style={styles.serviceTimeText}>{option.time} min</Text>
                      </View>
                      <Text
                        style={[styles.servicePrice, selectedServiceType === option.id && styles.servicePriceSelected]}
                      >
                        {option.price.toLocaleString()} ₣
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.confirmSection}>
              <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
                <View style={styles.confirmButtonContent}>
                  <Text style={styles.confirmButtonText}>Commander maintenant</Text>
                  <Text style={styles.confirmButtonPrice}>
                    {pricingOptions.find((opt) => opt.id === selectedServiceType)?.price.toLocaleString()} ₣
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.quickStats}>
            <Text style={styles.quickStatsTitle}>Yatou à votre service</Text>
            <Text style={styles.quickStatsSubtitle}>Service de transport rapide et fiable</Text>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Clock size={20} color="#10B981" />
                </View>
                <Text style={styles.statNumber}>2 min</Text>
                <Text style={styles.statLabel}>Temps d'attente</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Star size={20} color="#F59E0B" />
                </View>
                <Text style={styles.statNumber}>4.8★</Text>
                <Text style={styles.statLabel}>Note moyenne</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statIcon}>
                  <Text style={styles.statIconText}>🏍️</Text>
                </View>
                <Text style={styles.statNumber}>150+</Text>
                <Text style={styles.statLabel}>Chauffeurs actifs</Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 1000,
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 68,
    backgroundColor: AppColors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 16,
  },
  topBarLogo: {},
  locationIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginLeft: 4,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  menuContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    gap: 3,
  },
  menuLine: {
    width: 18,
    height: 2,
    backgroundColor: AppColors.text,
    borderRadius: 1,
  },

  mapContainer: {
    flex: 1,
    position: "relative",
    marginTop: 8,
  },

  searchBarContainer: {
    position: "absolute",
    top: 130,
    left: 16,
    right: 80,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: 2,
    borderColor: "transparent",
  },
  searchBarActive: {
    borderColor: AppColors.primary,
    backgroundColor: "#F0F9FF",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchBarText: {
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "500",
    flex: 1,
  },
  searchBarTextActive: {
    color: AppColors.text,
    fontWeight: "600",
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },

  locationButton: {
    position: "absolute",
    top: 130,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  locationButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
  },
  locationPulse: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    opacity: 0.2,
  },

  floatingButton: {
    position: "absolute",
    bottom: 140,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    maxHeight: 450,
  },

  tripSection: {
    marginBottom: 24,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
  },
  distanceChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  tripRoute: {
    gap: 16,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 2,
  },
  routeDotStart: {
    backgroundColor: "#10B981",
  },
  routeDotEnd: {
    backgroundColor: "#EF4444",
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: "#E5E7EB",
    marginLeft: 7,
  },
  routeText: {
    fontSize: 16,
    fontWeight: "500",
    color: AppColors.text,
    lineHeight: 22,
  },

  serviceSection: {
    marginBottom: 24,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 16,
  },
  serviceOptions: {
    gap: 12,
  },
  serviceOption: {
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  serviceOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: "#F0F9FF",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 2,
  },
  serviceNameSelected: {
    color: AppColors.primary,
  },
  serviceDescription: {
    fontSize: 13,
    color: "#6B7280",
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicatorText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  serviceDetails: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  serviceTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  serviceTimeText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
  },
  servicePriceSelected: {
    color: AppColors.primary,
  },

  confirmSection: {
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.primary,
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
  confirmButtonContent: {
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.white,
    marginBottom: 2,
  },
  confirmButtonPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.white,
  },

  quickStats: {
    paddingVertical: 20,
    alignItems: "center",
  },
  quickStatsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  quickStatsSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 20,
  },

  // Bottom Sheet Styles
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 2000,
  },
  overlayTouchable: {
    flex: 1,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "80%",
    zIndex: 2001,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#6B7280",
  },
  bottomSheetContent: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
    width: 20,
    alignItems: "center",
  },
  pickupDot: {
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
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginHorizontal: 4,
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
  modalRouteLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E5E7EB",
    marginLeft: 9,
    marginVertical: 4,
  },
})
