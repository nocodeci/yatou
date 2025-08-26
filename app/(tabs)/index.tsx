"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useLocalSearchParams } from "expo-router"
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Dimensions, Animated } from "react-native"
import { Plus, MapPin, Clock, Star } from "lucide-react-native"
import { useRouter } from "expo-router"

import { AppColors } from "@/app/constants/colors"
import YatouLogo from "@/components/YatouLogo"
import GoogleMapViewComponent from "@/components/MapView"
import DeliveryBottomSheet from "@/components/DeliveryBottomSheet"
import ErrandBottomSheet from "@/components/ErrandBottomSheet"
import MovingBottomSheet from "@/components/MovingBottomSheet"



export default function ImprovedHomeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  // On destructure les paramètres pour obtenir des valeurs stables (primitives)
  const {
    originName,
    destinationName,
    originCoords: originCoordsStr, // Renommer pour éviter la confusion
    destinationCoords: destinationCoordsStr,
  } = params

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
  const [selectedServiceType, setSelectedServiceType] = useState<"standard" | "express">("standard")
  const [showDeliveryBottomSheet, setShowDeliveryBottomSheet] = useState(false)
  const [showErrandBottomSheet, setShowErrandBottomSheet] = useState(false)
  const [showMovingBottomSheet, setShowMovingBottomSheet] = useState(false)


  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Position utilisateur à Bouaké
    setUserLocation([-5.0333, 7.6833])

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

  // Fonction pour normaliser les coordonnées au format [longitude, latitude]
  const normalizeCoordinates = (coordinates: [number, number]): [number, number] => {
    const [first, second] = coordinates

    // Si le premier nombre est dans la plage de longitude et le second dans la plage de latitude
    if (first >= -8.5 && first <= -2.0 && second >= 4.0 && second <= 11.0) {
      return [first, second] // [longitude, latitude] - déjà correct
    }

    // Si le premier nombre est dans la plage de latitude et le second dans la plage de longitude
    if (first >= 4.0 && first <= 11.0 && second >= -8.5 && second <= -2.0) {
      return [second, first] // Inverser pour avoir [longitude, latitude]
    }

    // Si aucune validation ne passe, retourner tel quel
    return coordinates
  }

  // Gérer les paramètres de retour depuis la page de sélection des lieux
  useEffect(() => {
    console.log("📱 Paramètres reçus:", { originName, destinationName, originCoordsStr, destinationCoordsStr })

    // Le useEffect ne s'exécute que si ces valeurs changent vraiment
    if (originName && destinationName && originCoordsStr && destinationCoordsStr) {
      const originCoords = (originCoordsStr as string).split(",").map(Number) as [number, number]
      const destinationCoords = (destinationCoordsStr as string).split(",").map(Number) as [number, number]

      // Valider et normaliser les coordonnées avant de les utiliser
      if (validateCoordinates(originCoords)) {
        const normalizedOrigin = normalizeCoordinates(originCoords)
        setSelectedOrigin(normalizedOrigin)
        setSelectedOriginName(originName as string)
        console.log("✅ Origine définie:", normalizedOrigin, originName)
      } else {
        console.error("❌ Coordonnées d'origine invalides:", originCoords)
      }

      if (validateCoordinates(destinationCoords)) {
        const normalizedDestination = normalizeCoordinates(destinationCoords)
        setSelectedDestination(normalizedDestination)
        setSelectedDestinationName(destinationName as string)
        setSearchQuery(destinationName as string)

        // Activer le panneau de trajet si on vient de select-locations
        if (originName && destinationName) {
          console.log("Prix calculé")
        }

        console.log("✅ Destination définie:", normalizedDestination, destinationName)
        console.log("🎯 État final - Destination:", normalizedDestination)
      } else {
        console.error("❌ Coordonnées de destination invalides:", destinationCoords)
      }
    }
  }, [originName, destinationName, originCoordsStr, destinationCoordsStr])

  const handleSearchBarPress = () => {
    router.push("/select-locations")
  }

  const handleBookRide = () => {
    if (selectedServiceType) {
      alert(`Commande créée : ${selectedOriginName} → ${selectedDestinationName} (${selectedServiceType})`)
    }
  }

  // Fonction pour valider les coordonnées
  const validateCoordinates = (coordinates: [number, number]): boolean => {
    if (!coordinates || coordinates.length !== 2) return false

    const [first, second] = coordinates
    if (isNaN(first) || isNaN(second)) return false

    // Les coordonnées peuvent être dans deux formats :
    // 1. [longitude, latitude] - format standard
    // 2. [latitude, longitude] - format inversé (provenant de certaines APIs)

    // Vérifier si c'est le format [longitude, latitude]
    const isValidFormat1 = first >= -8.5 && first <= -2.0 && second >= 4.0 && second <= 11.0

    // Vérifier si c'est le format [latitude, longitude] (inversé)
    const isValidFormat2 = first >= 4.0 && first <= 11.0 && second >= -8.5 && second <= -2.0

    const isValid = isValidFormat1 || isValidFormat2

    return isValid
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
            coordinates: [-5.0289, 7.6895] as [number, number],
          },
          {
            id: "2",
            name: "Gare Routière de Bouaké",
            address: "Avenue de la Paix, Bouaké, Côte d'Ivoire",
            coordinates: [-5.0321, 7.6923] as [number, number],
          },
          {
            id: "3",
            name: "Université Alassane Ouattara",
            address: "Route de Man, Bouaké, Côte d'Ivoire",
            coordinates: [-5.0333, 7.6833] as [number, number],
          },
          {
            id: "4",
            name: "Broukro",
            address: "Broukro, Côte d'Ivoire",
            coordinates: [-5.05, 7.7] as [number, number],
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
        duration: 0,
        basePrice: 0,
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
    const duration = (Math.round(distance * 10) / 10) * 2 // Estimation basique de la durée en minutes

    return {
      distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
      standardPrice,
      premiumPrice,
      duration,
      basePrice,
    }
  }, [selectedDestination, selectedOrigin, userLocation])

  const pricingOptions = useMemo(
    () => [
      {
        id: "standard",
        name: "Standard",
        price: calculatePricing.standardPrice,
        time: "15-20",
        icon: "🏍️",
        description: "Livraison standard",
        type: "Standard",
        details: "Livraison standard avec un temps d'attente de 15 à 20 minutes.",
      },
      {
        id: "express",
        name: "Express",
        price: calculatePricing.premiumPrice,
        time: "5-10",
        icon: "⚡",
        description: "Livraison express",
        type: "Express",
        details: "Livraison express avec un temps d'attente de 5 à 10 minutes.",
      },
    ],
    [calculatePricing],
  )

  console.log("📱 Index - selectedOrigin:", selectedOrigin)
  console.log("📱 Index - selectedDestination:", selectedDestination)



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
          onMapPress={(coordinates) => {}}
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

        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => setShowServiceBottomSheet(true)}
          activeOpacity={0.8}
        >
          <Plus size={24} color={AppColors.white} />
        </TouchableOpacity>
      </View>

              <Animated.View
          style={[
            styles.bottomPanel,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.dragHandle}>
            <View style={styles.dragIndicator} />
          </View>

            {selectedOrigin && selectedDestination ? (
              // Panneau des services après sélection des lieux
              <View style={styles.servicesPanel}>
                <Text style={styles.servicesTitle}>🚚 Services Disponibles</Text>
                <Text style={styles.servicesSubtitle}>Choisissez votre service YATOU</Text>
                
                <View style={styles.servicesGrid}>
                  <TouchableOpacity 
                    style={styles.serviceCard}
                    onPress={() => setShowDeliveryBottomSheet(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.serviceCardIcon}>📦</Text>
                    <Text style={styles.serviceCardTitle}>Livraison</Text>
                    <Text style={styles.serviceCardSubtitle}>Colis et marchandises</Text>
                    <View style={styles.serviceCardArrow}>
                      <Text style={styles.serviceCardArrowText}>→</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.serviceCard}
                    onPress={() => setShowErrandBottomSheet(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.serviceCardIcon}>🛒</Text>
                    <Text style={styles.serviceCardTitle}>Course</Text>
                    <Text style={styles.serviceCardSubtitle}>Achats et commissions</Text>
                    <View style={styles.serviceCardArrow}>
                      <Text style={styles.serviceCardArrowText}>→</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.serviceCard}
                    onPress={() => setShowMovingBottomSheet(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.serviceCardIcon}>🏠</Text>
                    <Text style={styles.serviceCardTitle}>Déménagement</Text>
                    <Text style={styles.serviceCardSubtitle}>Transport et déménagement</Text>
                    <View style={styles.serviceCardArrow}>
                      <Text style={styles.serviceCardArrowText}>→</Text>
                    </View>
                  </TouchableOpacity>
                </View>


              </View>
            ) : (
              // Panneau par défaut avant sélection des lieux
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

        {/* Bottom Sheets Individuels pour Chaque Service */}
        <DeliveryBottomSheet
          visible={showDeliveryBottomSheet}
          onClose={() => setShowDeliveryBottomSheet(false)}
          tripData={{
            distance: calculatePricing.distance,
            duration: calculatePricing.duration
          }}
          onServiceSelected={(service, vehicle, price) => {
            console.log(`Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`);
            alert(`Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`);
            setShowDeliveryBottomSheet(false);
          }}
        />

        <ErrandBottomSheet
          visible={showErrandBottomSheet}
          onClose={() => setShowErrandBottomSheet(false)}
          tripData={{
            distance: calculatePricing.distance,
            duration: calculatePricing.duration
          }}
          onServiceSelected={(service, vehicle, price) => {
            console.log(`Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`);
            alert(`Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`);
            setShowErrandBottomSheet(false);
          }}
        />

        <MovingBottomSheet
          visible={showMovingBottomSheet}
          onClose={() => setShowMovingBottomSheet(false)}
          tripData={{
            distance: calculatePricing.distance,
            duration: calculatePricing.duration
          }}
          onServiceSelected={(service, vehicle, price) => {
            console.log(`Service sélectionné: ${service} avec ${vehicle} - Prix: ${price} FCFA`);
            alert(`Commande créée : ${service} avec ${vehicle} - Prix: ${price.toLocaleString()} FCFA`);
            setShowMovingBottomSheet(false);
          }}
        />

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
    bottom: 220,
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    minHeight: 200,
    maxHeight: 400,
  },





  serviceHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  serviceInfo: {
    alignItems: "center",
  },
  serviceName: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 3,
    textAlign: "center",
  },
  serviceNameSelected: {
    color: AppColors.primary,
  },
  serviceDescription: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  selectedIndicatorText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  serviceDetails: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
  },
  serviceTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    justifyContent: "center",
  },
  serviceTimeText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
    textAlign: "center",
  },
  servicePriceSelected: {
    color: AppColors.primary,
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

  dragHandle: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },

  scrollContent: {
    flex: 1,
    paddingBottom: 16,
  },

  // Styles pour le panneau des services
  servicesPanel: {
    paddingVertical: 20,
    alignItems: "center",
  },
  servicesTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  servicesSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  servicesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minHeight: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceCardIcon: {
    fontSize: 24,
    marginBottom: 12,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  serviceCardSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  serviceCardArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCardArrowText: {
    fontSize: 14,
    color: AppColors.white,
    fontWeight: 'bold',
  },


})
