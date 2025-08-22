import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Package as PackageIcon, MapPin, Clock, Truck, CheckCircle2 } from "lucide-react-native"
import { AppColors } from "@/app/constants/colors"

export default function DeliveryDetailsStructuredScreen() {
  const { id } = useLocalSearchParams()

  // Données d'exemple — remplacez par vos données réelles
  const delivery = {
    id: String(id),
    trackingNumber: `YT${id}`,
    status: "in_transit" as const,
    pickupAddress: {
      name: "Collecte",
      address: "Quartier Kennedy, pharmacie",
      city: "Bouaké",
      postalCode: "00000",
      phone: "07 00 00 00 00",
    },
    deliveryAddress: {
      name: "Livraison",
      address: "Belleville 3, école primaire",
      city: "Bouaké",
      postalCode: "00000",
      phone: "07 11 11 11 11",
    },
    package: {
      description: "Produit x2 - Électronique fragile",
      weight: 2.5,
      dimensions: { length: 30, width: 20, height: 15 },
      value: 15000, // valeur indicative en FCFA
      fragile: true,
    },
    scheduledDate: "2024-01-15T14:30:00",
    estimatedDelivery: "2024-01-16T10:00:00",
    price: 12500, // FCFA
    createdAt: "2024-01-14T08:00:00",
  }

  const status = getStatusMeta(delivery.status)
  const quantity = getQuantity(delivery.package.description)

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      {/* En-tête */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.tracking} numberOfLines={1}>
            {delivery.trackingNumber}
          </Text>
          <Text style={styles.created}>Créé le {new Date(delivery.createdAt).toLocaleDateString("fr-FR")}</Text>
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
        </View>
      </View>

      {/* Bandeau résumé */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Prix</Text>
          <Text style={styles.summaryValue}>{formatCFA(delivery.price)}</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Collecte</Text>
          <Text style={styles.summaryValue}>{formatDateTime(delivery.scheduledDate)}</Text>
        </View>
        <View style={styles.dividerV} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Livraison</Text>
          <Text style={styles.summaryValue}>{formatDateTime(delivery.estimatedDelivery)}</Text>
        </View>
      </View>

      {/* Section Colis */}
      <Section title="Colis" icon={<PackageIcon size={16} color={AppColors.primary} />}>
        <InfoRow label="Description" value={delivery.package.description} />
        <InfoRow label="Quantité" value={`x${quantity}`} />
        <InfoRow label="Poids" value={`${delivery.package.weight} kg`} />
        <InfoRow
          label="Dimensions"
          value={`${delivery.package.dimensions.length} × ${delivery.package.dimensions.width} × ${delivery.package.dimensions.height} cm`}
        />
        <InfoRow label="Valeur" value={formatCFA(delivery.package.value)} />
        {delivery.package.fragile && <Tag text="Fragile" tone="warn" />}
      </Section>

      {/* Section Adresses */}
      <Section title="Adresses" icon={<MapPin size={16} color={AppColors.primary} />}>
        <Subsection title="Départ">
          <InfoRow label="Lieu" value={delivery.pickupAddress.address} />
          <InfoRow label="Ville" value={`${delivery.pickupAddress.city}`} />
          <InfoRow label="Téléphone" value={delivery.pickupAddress.phone} />
        </Subsection>

        <Divider />

        <Subsection title="Arrivée">
          <InfoRow label="Lieu" value={delivery.deliveryAddress.address} />
          <InfoRow label="Ville" value={`${delivery.deliveryAddress.city}`} />
          <InfoRow label="Téléphone" value={delivery.deliveryAddress.phone} />
        </Subsection>
      </Section>

      {/* Section Suivi */}
      <Section title="Suivi de livraison" icon={<Truck size={16} color={AppColors.primary} />}>
        <TimelineItem
          title="Commande reçue"
          time="14:30"
          status="done"
        />
        <TimelineItem
          title="Confirmée"
          time="16:15"
          status="done"
        />
        <TimelineItem
          title="En cours de livraison"
          time="09:45"
          status="current"
        />
        <TimelineItem
          title="Livrée"
          time="--"
          status="pending"
        />
      </Section>
    </ScrollView>
  )
}

/* Composants UI */

function Section({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={styles.subTitle}>{title}</Text>
      <View style={{ gap: 8, marginTop: 6 }}>{children}</View>
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | number }) {
  if (!value && value !== 0) return null
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  )
}

function Divider() {
  return <View style={styles.dividerH} />
}

function Tag({ text, tone = "neutral" }: { text: string; tone?: "neutral" | "warn" | "success" }) {
  const map = {
    neutral: { bg: AppColors.surface, fg: AppColors.text },
    warn: { bg: AppColors.warning, fg: AppColors.white },
    success: { bg: AppColors.success, fg: AppColors.white },
  } as const
  return (
    <View style={[styles.tag, { backgroundColor: map[tone].bg, borderColor: map[tone].bg }]}>
      <Text style={[styles.tagText, { color: map[tone].fg }]}>{text}</Text>
    </View>
  )
}

function TimelineItem({
  title,
  time,
  status,
}: {
  title: string
  time: string
  status: "done" | "current" | "pending"
}) {
  const color =
    status === "done" ? AppColors.success : status === "current" ? AppColors.primary : AppColors.border
  return (
    <View style={styles.timelineRow}>
      <View style={[styles.timelineDot, { backgroundColor: color }]} />
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={[styles.timelineTitle, status !== "pending" && { color }]}>{title}</Text>
          <View style={styles.timelineTime}>
            <Clock size={12} color={AppColors.textSecondary} />
            <Text style={styles.timelineTimeText}>{time}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

/* Utils */

function getStatusMeta(status: string) {
  switch (status) {
    case "pending":
      return { text: "En attente", color: AppColors.warning }
    case "confirmed":
      return { text: "Confirmée", color: AppColors.primary }
    case "picked_up":
      return { text: "Récupérée", color: AppColors.secondary }
    case "in_transit":
      return { text: "En transit", color: AppColors.secondary }
    case "delivered":
      return { text: "Livrée", color: AppColors.success }
    case "cancelled":
      return { text: "Annulée", color: AppColors.error }
    default:
      return { text: status, color: AppColors.textSecondary }
  }
}

function getQuantity(description?: string) {
  if (!description) return 1
  const match = description.match(/x(\d+)/i)
  return match ? Number(match[1]) : 1
}

function formatDateTime(dateString: string) {
  try {
    const d = new Date(dateString)
    const date = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })
    const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", "h")
    return `${date} • ${time}`
  } catch {
    return "--"
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
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },

  /* Header */
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexShrink: 1,
  },
  tracking: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.text,
  },
  created: {
    marginTop: 2,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  /* Summary */
  summary: {
    marginTop: 10,
    marginHorizontal: 16,
    backgroundColor: AppColors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 12,
    flexDirection: "row",
    alignItems: "stretch",
    // petite ombre
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    gap: 6,
  },
  summaryLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    fontWeight: "700",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.text,
  },
  dividerV: {
    width: 1,
    backgroundColor: AppColors.border,
    marginHorizontal: 12,
    borderRadius: 1,
  },

  /* Sections */
  section: {
    backgroundColor: AppColors.white,
    marginTop: 10,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: AppColors.text,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionBody: {
    gap: 10,
  },

  subTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: AppColors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  /* Rows */
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
    flex: 0.9,
  },
  infoValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "600",
    flex: 1.1,
    textAlign: "right",
  },

  dividerH: {
    height: 1,
    backgroundColor: AppColors.border,
    marginVertical: 8,
    borderRadius: 1,
  },

  /* Tags */
  tag: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "800",
  },

  /* Timeline */
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: AppColors.text,
  },
  timelineTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  timelineTimeText: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
})