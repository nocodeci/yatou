import React, { useMemo, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from "react-native"
import {
  Search as SearchIcon,
  Package as PackageIcon,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  X,
  Share2,
} from "lucide-react-native"
import { AppColors } from "@/app/constants/colors"

type Step = {
  icon: any
  title: string
  status: "completed" | "current" | "pending"
  time: string
}

export default function TrackScreen() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [recent, setRecent] = useState<string[]>(["YT001", "BKA123", "CMD-2025"])

  const placeholderColor = AppColors.textSecondary || "#6b7280"

  const handleTrack = () => {
    const num = trackingNumber.trim()
    if (!num) return
    setIsSearching(true)

    // Simuler une recherche
    setTimeout(() => {
      setIsSearching(false)
      // MàJ recherches récentes
      setRecent(prev => {
        const next = [num, ...prev.filter(v => v !== num)]
        return next.slice(0, 5)
      })
    }, 1300)
  }

  const clearInput = () => setTrackingNumber("")

  const fillFromRecent = (value: string) => {
    setTrackingNumber(value)
  }

  const shareTracking = async () => {
    const num = trackingNumber.trim()
    if (!num) return
    try {
      await Share.share({
        message: `Suivi de colis ${num} — Ouvrez l’app Yatou pour voir l’état en temps réel.`,
      })
    } catch {
      Alert.alert("Impossible de partager le numéro de suivi.")
    }
  }

  const steps: Step[] = useMemo(
    () => [
      { icon: PackageIcon, title: "Commande reçue", status: "completed", time: "10:30" },
      { icon: CheckCircle, title: "Confirmée", status: "completed", time: "14:15" },
      { icon: Truck, title: "En cours de livraison", status: "current", time: "16:45" },
      { icon: MapPin, title: "Livrée", status: "pending", time: "--" },
    ],
    []
  )

  const StatusChip = ({ status }: { status: "pending" | "current" | "in_transit" | "delivered" }) => {
    const map = {
      pending: { bg: AppColors.warning, fg: AppColors.white, text: "En attente" },
      current: { bg: AppColors.primary, fg: AppColors.white, text: "Confirmée" },
      in_transit: { bg: AppColors.secondary, fg: AppColors.white, text: "En livraison" },
      delivered: { bg: AppColors.success, fg: AppColors.white, text: "Livrée" },
    } as const
    const m = map[status]
    return (
      <View style={[styles.statusChip, { backgroundColor: m.bg }]}>
        <Text style={[styles.statusChipText, { color: m.fg }]}>{m.text}</Text>
      </View>
    )
  }

  const ResultHeader = () => (
    <View style={styles.resultHeader}>
      <View style={styles.trackingRow}>
        <Text style={styles.trackingNumber}>{trackingNumber.trim()}</Text>
        <StatusChip status="in_transit" />
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerActionBtn} onPress={shareTracking} activeOpacity={0.9}>
          <Share2 size={16} color={AppColors.text} />
          <Text style={styles.headerActionText}>Partager</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const RouteCard = () => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <MapPin size={16} color={AppColors.primary} />
        <Text style={styles.cardTitle}>Trajet</Text>
      </View>
      <View style={styles.routeRow}>
        <Text style={styles.routeText} numberOfLines={1}>
          Quartier Kennedy → Belleville 3
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Clock size={14} color={AppColors.textSecondary} />
        <Text style={styles.infoText}>Livraison estimée: Aujourd’hui • 17h30</Text>
      </View>
    </View>
  )

  const Timeline = () => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Suivi</Text>
      <View style={styles.timelineWrap}>
        {steps.map((s, i) => {
          const Icon = s.icon
          const isCompleted = s.status === "completed"
          const isCurrent = s.status === "current"
          const dotColor = isCompleted ? AppColors.success : isCurrent ? AppColors.primary : AppColors.border
          return (
            <View key={i} style={styles.timelineRow}>
              {/* ligne */}
              {i < steps.length - 1 && <View style={styles.timelineLine} />}
              {/* dot */}
              <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Icon size={14} color={isCompleted || isCurrent ? dotColor : AppColors.textSecondary} />
                  <Text
                    style={[
                      styles.timelineTitle,
                      (isCompleted || isCurrent) && { color: dotColor, fontWeight: "700" },
                    ]}
                  >
                    {s.title}
                  </Text>
                </View>
                <Text style={styles.timelineTime}>{s.time}</Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )

  const Loading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={AppColors.primary} size="small" />
      <Text style={styles.loadingText}>Recherche en cours...</Text>
    </View>
  )

  const Empty = () => (
    <View style={styles.placeholderContainer}>
      <PackageIcon size={56} color={AppColors.textSecondary} />
      <Text style={styles.placeholderTitle}>Suivez votre colis</Text>
      <Text style={styles.placeholderText}>Entrez le numéro de suivi pour voir l’état de votre livraison</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header avec recherche */}
        <View style={styles.header}>
          <Text style={styles.title}>Suivi de colis</Text>
          <Text style={styles.subtitle}>Entrez votre numéro de suivi</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBarWrap}>
          <View style={styles.searchBar}>
            <SearchIcon size={18} color={AppColors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Numéro de suivi (ex: YT001)"
              value={trackingNumber}
              onChangeText={setTrackingNumber}
              placeholderTextColor={placeholderColor}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleTrack}
            />
            {!!trackingNumber && (
              <TouchableOpacity onPress={clearInput} style={styles.clearBtn} accessibilityLabel="Effacer">
                <X size={16} color={AppColors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, !trackingNumber.trim() && styles.searchButtonDisabled]}
            onPress={handleTrack}
            disabled={!trackingNumber.trim()}
            activeOpacity={0.9}
          >
            <SearchIcon size={18} color={AppColors.white} />
            <Text style={styles.searchBtnText}>Rechercher</Text>
          </TouchableOpacity>
        </View>

        {/* Recent searches */}
        {recent.length > 0 && (
          <View style={styles.recentRow}>
            {recent.map((r, i) => (
              <TouchableOpacity key={r + i} style={styles.recentChip} onPress={() => fillFromRecent(r)}>
                <Text style={styles.recentText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Body */}
        {isSearching ? (
          <Loading />
        ) : trackingNumber.trim() ? (
          <View style={styles.resultContainer}>
            <ResultHeader />
            <RouteCard />
            <Timeline />
          </View>
        ) : (
          <Empty />
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },

  /* header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: AppColors.text,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: AppColors.textSecondary,
  },

  /* search */
  searchBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: AppColors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: AppColors.text,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButton: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    height: 44,
    backgroundColor: AppColors.primary,
  },
  searchButtonDisabled: {
    backgroundColor: AppColors.textSecondary,
  },
  searchBtnText: {
    color: AppColors.white,
    fontWeight: "800",
    fontSize: 14,
  },

  /* recent */
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  recentChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  recentText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.text,
  },

  /* result */
  resultContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  resultHeader: {
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  trackingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  trackingNumber: {
    fontSize: 16,
    fontWeight: "900",
    color: AppColors.text,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppColors.white,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  headerActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  headerActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  headerActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.text,
  },

  /* cards */
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.text,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  routeRow: {
    marginTop: 4,
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    color: AppColors.text,
    fontWeight: "500",
  },

  /* timeline */
  timelineWrap: {
    marginTop: 4,
  },
  timelineRow: {
    position: "relative",
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  timelineLine: {
    position: "absolute",
    left: 7,
    top: 10,
    bottom: -4,
    width: 2,
    backgroundColor: AppColors.border,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timelineTitle: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "600",
  },
  timelineTime: {
    marginTop: 2,
    fontSize: 12,
    color: AppColors.textSecondary,
  },

  /* loading & empty */
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  placeholderContainer: {
    alignItems: "center",
    paddingVertical: 56,
    paddingHorizontal: 32,
    gap: 10,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.text,
  },
  placeholderText: {
    fontSize: 14,
    color: AppColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
})