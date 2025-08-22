import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, SafeAreaView, Image } from "react-native"
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Package,
  Clock,
  CheckCircle,
  CreditCard,
  MapPin,
  Bell,
  Shield,
  Languages,
  Edit3,
  Gift,
  Info,
  Phone,
} from "lucide-react-native"
import { AppColors } from "@/app/constants/colors"
import YatouLogo from "@/components/YatouLogo"

export default function ProfileScreen() {
  const [notifEnabled, setNotifEnabled] = useState(true)
  const [language, setLanguage] = useState<"fr" | "en">("fr")

  const profileStats = [
    { icon: Package, label: "Livraisons", value: "12", color: AppColors.primary },
    { icon: Clock, label: "En cours", value: "3", color: AppColors.warning },
    { icon: CheckCircle, label: "Terminées", value: "9", color: AppColors.success },
  ]

  const quickActions = [
    { icon: Package, label: "Mes livraisons", onPress: () => {} },
    { icon: MapPin, label: "Adresses", onPress: () => {} },
    { icon: CreditCard, label: "Paiements", onPress: () => {} },
    { icon: HelpCircle, label: "Support", onPress: () => {} },
    { icon: Gift, label: "Inviter un ami", onPress: () => {} },
    { icon: Bell, label: "Notifications", onPress: () => setNotifEnabled((v) => !v) },
  ]

  const menuItems = [
    { icon: Settings, label: "Paramètres", onPress: () => {} },
    { icon: Shield, label: "Sécurité", onPress: () => {} },
    { icon: Info, label: "À propos", onPress: () => {} },
  ]

  const name = "Utilisateur Yatou"
  const email = "utilisateur@yatou.com"
  const role = "Client"

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header modernisé */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={36} color={AppColors.primary} />
            <TouchableOpacity style={styles.avatarEdit} onPress={() => {}}>
              <Edit3 size={14} color={AppColors.white} />
            </TouchableOpacity>
          </View>

          <View style={{ alignItems: "center" }}>
            <Text style={styles.userName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{role}</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => {}}>
              <Phone size={16} color={AppColors.primary} />
              <Text style={styles.headerBtnText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerBtn, styles.headerBtnGhost]} onPress={() => {}}>
              <Edit3 size={16} color={AppColors.text} />
              <Text style={[styles.headerBtnText, { color: AppColors.text }]}>Modifier</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats compactes */}
        <View style={styles.statsRow}>
          {profileStats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <View key={i} style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Icon size={16} color={AppColors.white} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            )
          })}
        </View>

        {/* Actions rapides */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.grid}>
            {quickActions.map((item, i) => {
              const Icon = item.icon
              return (
                <TouchableOpacity key={i} style={styles.tile} onPress={item.onPress} activeOpacity={0.9}>
                  <View style={styles.tileIconWrap}>
                    <Icon size={18} color={AppColors.primary} />
                  </View>
                  <Text style={styles.tileText} numberOfLines={2}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        {/* Préférences */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Préférences</Text>

          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Bell size={18} color={AppColors.textSecondary} />
              <Text style={styles.prefText}>Notifications</Text>
            </View>
            <Switch
              value={notifEnabled}
              onValueChange={setNotifEnabled}
              thumbColor={notifEnabled ? AppColors.primary : "#fff"}
              trackColor={{ false: AppColors.border, true: (AppColors as any).primaryLight || "#E6F0FF" }}
            />
          </View>

          <TouchableOpacity
            style={styles.prefRow}
            onPress={() => setLanguage((l) => (l === "fr" ? "en" : "fr"))}
            activeOpacity={0.75}
          >
            <View style={styles.prefLeft}>
              <Languages size={18} color={AppColors.textSecondary} />
              <Text style={styles.prefText}>Langue</Text>
            </View>
            <Text style={styles.prefValue}>{language.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Menu compte */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {menuItems.map((item, i) => {
            const Icon = item.icon
            return (
              <TouchableOpacity key={i} style={styles.menuItem} onPress={item.onPress} activeOpacity={0.8}>
                <View style={styles.menuLeft}>
                  <Icon size={18} color={AppColors.textSecondary} />
                  <Text style={styles.menuText}>{item.label}</Text>
                </View>
                <Text style={styles.chevron}>{">"}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Logo Yatou */}
        <View style={styles.sectionCard}>
          <View style={styles.logoSection}>
            <YatouLogo size="large" showText={false} />
            <Text style={styles.logoTitle}>Yatou</Text>
            <Text style={styles.logoSubtitle}>Service de livraison</Text>
          </View>
        </View>

        {/* Déconnexion */}
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => {}}>
            <LogOut size={16} color={AppColors.white} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
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

  /* Header */
  header: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: 10,
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: AppColors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarEdit: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: AppColors.text,
  },
  userEmail: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: AppColors.surface,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: AppColors.text,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  headerActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: (AppColors as any).primaryLight || "#EEF2FF",
    borderWidth: 1,
    borderColor: AppColors.primary,
  },
  headerBtnGhost: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.primary,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: AppColors.white,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    padding: 12,
    alignItems: "center",
    gap: 8,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "900",
    color: AppColors.text,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: AppColors.textSecondary,
    textAlign: "center",
  },

  /* Section wrapper */
  sectionCard: {
    backgroundColor: AppColors.white,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: 14,
    // ombre légère
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: AppColors.text,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },

  /* Quick grid */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tile: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AppColors.border,
    backgroundColor: AppColors.surface,
    padding: 12,
    gap: 10,
  },
  tileIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  tileText: {
    fontSize: 13,
    fontWeight: "700",
    color: AppColors.text,
  },

  /* Preferences */
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  prefLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  prefText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "600",
  },
  prefValue: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontWeight: "700",
  },

  /* Menu */
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "600",
  },
  chevron: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },

  /* Logout */
  logoutBtn: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: (AppColors as any).error || "#D11",
  },
  logoutText: {
    color: AppColors.white,
    fontWeight: "800",
    fontSize: 14,
  },

  /* Footer */
  version: {
    textAlign: "center",
    marginTop: 10,
    color: AppColors.textSecondary,
    fontSize: 12,
  },

  /* Logo Section */
  logoSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: AppColors.text,
    marginBottom: 4,
    marginTop: 12,
  },
  logoSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
    textAlign: "center",
  },
})