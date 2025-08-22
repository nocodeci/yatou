"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useLocalSearchParams } from "expo-router"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Dimensions, TextInput } from "react-native"
import { Plus } from "lucide-react-native"
import { useRouter } from "expo-router"

import { AppColors } from "@/app/constants/colors"
import YatouLogo from "@/components/YatouLogo"
import GoogleMapViewComponent from "@/components/MapView"

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



  const mapRef = useRef<any>(null)

  useEffect(() => {
    // Simuler la position utilisateur (Bouaké)
    setUserLocation([-5.0301, 7.6901])
  }, [])

  // Gérer les paramètres de retour depuis la page de sélection des lieux
  useEffect(() => {
    if (params.originName && params.destinationName && params.originCoords && params.destinationCoords) {
      const originCoords = (params.originCoords as string).split(',').map(Number) as [number, number];
      const destinationCoords = (params.destinationCoords as string).split(',').map(Number) as [number, number];
      
      setSelectedOrigin(originCoords);
      setSelectedOriginName(params.originName as string);
      setSelectedDestination(destinationCoords);
      setSelectedDestinationName(params.destinationName as string);
      setSearchQuery(params.destinationName as string);
    }
  }, [params])

  // Gestionnaire pour l'ouverture de la page de sélection des lieux
  const handleSearchBarPress = () => {
    console.log('Ouverture de la page de sélection des lieux');
    router.push('/select-locations');
  };



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
        language: 'fr', // Langue française
        components: 'country:ci', // Restreindre à la Côte d'Ivoire
        location: '7.6833,-5.0333', // Centre de Bouaké
        radius: '50000', // Rayon de 50km
        types: 'establishment', // Types d'établissements
        sessiontoken: 'yatou_session_' + Date.now() // Token de session pour optimiser les coûts
      })
      
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`
      
      console.log('URL Places Autocomplete:', url)

      const response = await fetch(url)
      const data = await response.json()

      console.log('Réponse Places Autocomplete:', {
        status: data.status,
        predictions: data.predictions ? data.predictions.length : 0,
        error_message: data.error_message
      })

      if (data.predictions && data.predictions.length > 0) {
        const results = await Promise.all(
          data.predictions.slice(0, 6).map(async (prediction: any) => {
            try {
              // Obtenir les détails de chaque lieu directement via l'API
              const detailsParams = new URLSearchParams({
                place_id: prediction.place_id,
                key: apiKey,
                language: 'fr',
                fields: 'geometry,formatted_address,name,place_id'
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
              console.error('Erreur lors de la récupération des détails:', error)
            }
            return null
          })
        )

        const validResults = results.filter(result => result !== null)
        console.log("Résultats trouvés:", validResults.length)
        setSearchResults(validResults)
      } else {
        console.log('Aucune prédiction trouvée, utilisation des résultats simulés')
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
    const origin = selectedOrigin || userLocation;
    const destination = selectedDestination;
    
    if (!destination || !origin) {
      return {
        distance: 0,
        standardPrice: 0,
        premiumPrice: 0,
      }
    }

    // Calculer la distance en utilisant la formule de Haversine
    const R = 6371 // Rayon de la Terre en km
    const lat1 = origin[1] * Math.PI / 180
    const lat2 = destination[1] * Math.PI / 180
    const deltaLat = (destination[1] - origin[1]) * Math.PI / 180
    const deltaLng = (destination[0] - origin[0]) * Math.PI / 180

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    // Calculer les prix basés sur la distance
    const basePrice = 500 // Prix de base en FCFA
    const pricePerKm = 200 // Prix par km en FCFA

    const standardPrice = Math.round(basePrice + (distance * pricePerKm))
    const premiumPrice = Math.round(standardPrice * 1.5) // 50% plus cher pour le premium

    return {
      distance: Math.round(distance * 10) / 10, // Arrondir à 1 décimale
      standardPrice,
      premiumPrice,
    }
  }, [selectedDestination, selectedOrigin, userLocation])

  const pricingOptions = useMemo(() => [
    {
      id: "standard",
      name: "Standard",
      price: calculatePricing.standardPrice,
      time: "10-15",
    },
    {
      id: "premium",
      name: "Premium",
      price: calculatePricing.premiumPrice,
      time: "15-25",
    },
  ], [calculatePricing])

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

      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.topBarLeft}>
            <YatouLogo size="large" showText={false} variant="01" style={styles.topBarLogo} />
              <View style={styles.locationIndicator}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>Bouaké</Text>
              </View>
          </View>

          <View style={styles.topBarRight}>
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
      </View>

        <View style={styles.searchBarContainer}>
          <TouchableOpacity
            style={[styles.searchBar, isSearching && styles.searchBarActive]}
            onPress={handleSearchBarPress}
            activeOpacity={0.8}
          >
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text style={styles.searchBarText}>
              {searchQuery || "Où souhaitez-vous aller ?"}
            </Text>
          </TouchableOpacity>
        </View>

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
            <Text style={styles.locationButtonText}>📍</Text>
          </View>
        </TouchableOpacity>

        {(selectedOrigin && selectedDestination) ? (
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

      <View style={styles.bottomPanel}>
        {(selectedOrigin && selectedDestination) ? (
          <>
            <View style={styles.tripSection}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>Trajet</Text>
                <View style={styles.distanceChip}>
                  <Text style={styles.distanceText}>{calculatePricing.distance} km</Text>
                </View>
              </View>

              <View style={styles.tripRoute}>
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotStart]} />
                  <Text style={styles.routeText}>{selectedOriginName || "Ma position"}</Text>
                </View>
                
                {/* Via points intermédiaires */}
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotWaypoint]} />
                  <Text style={styles.routeText}>Point intermédiaire</Text>
                </View>
                
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotWaypoint]} />
                  <Text style={styles.routeText}>Point intermédiaire</Text>
        </View>

                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <View style={[styles.routeDot, styles.routeDotEnd]} />
                  <Text style={styles.routeText}>{selectedDestinationName}</Text>
                </View>
              </View>
            </View>

            <View style={styles.serviceSection}>
              <Text style={styles.serviceTitle}>Type de service</Text>
              <View style={styles.serviceOptions}>
                {pricingOptions.map((option) => (
            <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.serviceOption,
                      selectedServiceType === option.id && styles.serviceOptionSelected,
                    ]}
                    onPress={() => setSelectedServiceType(option.id as "standard" | "premium")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceIcon}>🏍️</Text>
                      <Text style={[
                        styles.serviceName,
                        selectedServiceType === option.id && styles.serviceTypeSelected,
                      ]}>
                        {option.name}
                      </Text>
                    </View>
                    <Text style={styles.serviceTime}>{option.time} min</Text>
                    <Text style={[
                      styles.servicePrice,
                      selectedServiceType === option.id && styles.servicePriceSelected,
                    ]}>
                      {option.price} ₣
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.transportSection}>
              <Text style={styles.transportTitle}>Mode de transport</Text>
              <View style={styles.transportOptions}>
                <TouchableOpacity style={styles.transportOption}>
                  <Text style={styles.transportIcon}>🚗</Text>
                  <Text style={styles.transportName}>Voiture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportOption}>
                  <Text style={styles.transportIcon}>🚶</Text>
                  <Text style={styles.transportName}>À pied</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportOption}>
                  <Text style={styles.transportIcon}>🚲</Text>
                  <Text style={styles.transportName}>Vélo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.transportOption}>
                  <Text style={styles.transportIcon}>🚌</Text>
                  <Text style={styles.transportName}>Transit</Text>
            </TouchableOpacity>
          </View>
        </View>

            <View style={styles.confirmSection}>
              <TouchableOpacity style={styles.confirmButton} activeOpacity={0.8}>
                <Text style={styles.confirmButtonText}>
                  Commander • {pricingOptions.find((opt) => opt.id === selectedServiceType)?.price} ₣
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.quickStats}>
            <Text style={styles.quickStatsTitle}>Yatou à votre service</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2 min</Text>
                <Text style={styles.statLabel}>Temps d'attente</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>150+</Text>
                <Text style={styles.statLabel}>Chauffeurs actifs</Text>
              </View>
            </View>
          </View>
                  )}
      </View>


      
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  topBar: {
    position: 'absolute',
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
    height: 64,
    backgroundColor: AppColors.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
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
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  locationIcon: {
    fontSize: 14,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
    top: 120,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  searchBarActive: {
    borderWidth: 2,
    borderColor: AppColors.primary,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchIconText: {
    fontSize: 18,
  },
  searchBarText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "500",
    flex: 1,
  },
  clearButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  clearButtonText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: "600",
  },

  searchResults: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 320,
    zIndex: 2000,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  resultIcon: {
    marginRight: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  resultIconText: {
    fontSize: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 13,
    color: AppColors.textSecondary,
    lineHeight: 18,
  },
  resultArrow: {
    marginLeft: 12,
  },
  resultArrowText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },

  locationButton: {
    position: "absolute",
    top: 120,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AppColors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  locationButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonText: {
    fontSize: 20,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  bottomPanel: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    maxHeight: 400,
  },

  tripSection: {
    marginBottom: 20,
  },
  tripHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  distanceChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  tripRoute: {
    gap: 12,
  },
  routePoint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeDotStart: {
    backgroundColor: AppColors.primary,
  },
  routeDotEnd: {
    backgroundColor: "#EF4444",
  },
  routeDotWaypoint: {
    backgroundColor: "#4F46E5", // Couleur pour les points intermédiaires
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E2E8F0",
    marginLeft: 5,
  },
  routeText: {
    fontSize: 14,
    color: AppColors.text,
    flex: 1,
  },

  serviceSection: {
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
  },
  serviceOptions: {
    flexDirection: "row",
    gap: 12,
  },
  serviceOption: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  serviceOptionSelected: {
    borderColor: AppColors.primary,
    backgroundColor: "#F0F9FF",
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  serviceTypeSelected: {
    color: AppColors.primary,
  },
  serviceTime: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  servicePriceSelected: {
    color: AppColors.primary,
  },

  transportSection: {
    marginBottom: 20,
  },
  transportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
    marginBottom: 12,
  },
  transportOptions: {
    flexDirection: "row",
    gap: 12,
  },
  transportOption: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    alignItems: "center",
    gap: 8,
  },
  transportIcon: {
    fontSize: 24,
  },
  transportName: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },

  confirmSection: {
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.white,
  },

  quickStats: {
    paddingVertical: 16,
  },
  quickStatsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: AppColors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 20,
  },
})
