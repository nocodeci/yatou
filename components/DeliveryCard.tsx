import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { MapPin, Clock, Box } from "lucide-react-native"
import { Delivery } from "@/app/types/delivery"
import { AppColors } from "@/app/constants/colors"

interface DeliveryCardProps {
  delivery: Delivery
  onPress?: () => void
}

const DeliveryCard = React.memo(({ delivery, onPress }: DeliveryCardProps) => {
  const statusDot = getStatusDotColor(delivery.status)
  const quantity = getQuantity(delivery.package)
  const hasImage = Boolean((delivery.package as any).photoUri)

  const scheduledTime = formatTime(delivery.scheduledDate)
  const priceText = formatCFA(delivery.price)
  const createdLabel = new Date(delivery.createdAt).toLocaleDateString("fr-FR")

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Left: thumbnail */}
      <View style={styles.thumbWrap}>
        {hasImage ? (
          <Image
            source={{ uri: (delivery.package as any).photoUri }}
            style={styles.thumb}
            resizeMode="cover"
            accessibilityLabel="Image du colis"
          />
        ) : (
          <View style={styles.thumbPlaceholder}>
            <Box size={22} color={AppColors.textSecondary} />
          </View>
        )}
      </View>

      {/* Right: content */}
      <View style={styles.content}>
        {/* Row 1: status dot + tracking */}
        <View style={styles.row}>
          <View style={[styles.statusDot, { backgroundColor: statusDot }]} />
          <Text style={styles.tracking} numberOfLines={1}>
            {delivery.trackingNumber || `#${delivery.id.slice(-6)}`}
          </Text>
        </View>

        {/* Row 2: description + qty */}
        <View style={styles.rowBetween}>
          <Text style={styles.title} numberOfLines={1}>
            {delivery.package.description}
          </Text>
          <View style={styles.qtyPill}>
            <Text style={styles.qtyText}>x{quantity}</Text>
          </View>
        </View>

        {/* Row 3: route + time */}
        <View style={styles.metaRow}>
          <View style={styles.inline}>
            <MapPin size={12} color={AppColors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {delivery.pickupAddress.address} → {delivery.deliveryAddress.address}
            </Text>
          </View>
          <View style={styles.inline}>
            <Clock size={12} color={AppColors.textSecondary} />
            <Text style={styles.metaText}>{scheduledTime}</Text>
          </View>
        </View>

        {/* Footer compact: created + price */}
        <View style={styles.footer}>
          <Text style={styles.created}>Créé le {createdLabel}</Text>
          <Text style={styles.price}>{priceText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
})

export default DeliveryCard

/* Utils */

function getStatusDotColor(status: Delivery["status"]) {
  switch (status) {
    case "pending":
      return AppColors.warning
    case "confirmed":
      return AppColors.primary
    case "picked_up":
    case "in_transit":
      return AppColors.secondary
    case "delivered":
      return AppColors.success
    case "cancelled":
      return AppColors.error
    default:
      return AppColors.textSecondary
  }
}

function getQuantity(pkg: Delivery["package"]) {
  const q = (pkg as any).quantity
  if (typeof q === "number" && q > 0) return String(q)
  const match = pkg.description?.match(/x(\d+)/i)
  return match ? match[1] : "1"
}

function formatTime(dateString: string) {
  try {
    const d = new Date(dateString)
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")
  } catch {
    return "--:--"
  }
}

function formatCFA(amount: number) {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(Math.round(amount))
  } catch {
    const n = Math.round(amount)
    return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F CFA`
  }
}

/* Styles */

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    // ombre légère et moderne
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  thumbWrap: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginRight: 12,
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  thumbPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flex: 1,
    gap: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  inline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tracking: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.text,
  },

  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.text,
  },
  qtyPill: {
    backgroundColor: AppColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppColors.white,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    maxWidth: 170,
  },

  footer: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  created: {
    fontSize: 11,
    color: AppColors.textSecondary,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: AppColors.primary,
  },
})