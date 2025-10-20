import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  User as UserIcon,
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
  SteeringWheel,
  Star,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { AppColors } from '@/app/constants/colors';
import YatouLogo from '@/components/YatouLogo';
import { useAuthStore } from '@/app/store/authStore';
import {
  deliveryService,
  driverService,
  userService,
  DatabaseUser,
  authService,
} from '@/app/services/api';
import type { DatabaseDriver } from '@/app/services/api';

type Stats = {
  total: number;
  pending: number;
  active: number;
  delivered: number;
  cancelled: number;
};

const DEFAULT_STATS: Stats = {
  total: 0,
  pending: 0,
  active: 0,
  delivered: 0,
  cancelled: 0,
};

const SUPPORT_PHONE = '+2250505050505';

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, updateUser, logout } = useAuthStore();

  const [profile, setProfile] = useState<DatabaseUser | null>(null);
  const [driverProfile, setDriverProfile] = useState<
    (DatabaseDriver & { rating?: number }) | null
  >(null);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPrefs, setIsUpdatingPrefs] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  const isDriver = (profile?.role || authUser?.role) === 'driver';
  const appVersion =
    Constants.expoConfig?.version ||
    Constants.manifest2?.version?.string ||
    '1.0.0';

  const syncStoreUser = useCallback(
    (userRow: DatabaseUser) => {
      if (!updateUser) {
        return;
      }

      const [firstName, ...lastNameParts] = (userRow.name || '').split(' ');
      updateUser({
        firstName: firstName || authUser?.firstName || '',
        lastName: lastNameParts.join(' ') || authUser?.lastName || '',
        phone: userRow.phone || '',
        role: userRow.role === 'driver' ? 'driver' : 'client',
        isActive: userRow.is_active,
      });
    },
    [authUser, updateUser],
  );

  const loadProfileData = useCallback(async () => {
    try {
      setIsLoading(true);

      const { user: userRow, driver } =
        await userService.getCurrentUserProfile();

      setProfile(userRow);
      setDriverProfile(driver);

      const prefs = (userRow.notification_preferences || {}) as Record<
        string,
        unknown
      >;
      setNotifEnabled(prefs.push !== false);
      setLanguage(
        (userRow.language as 'fr' | 'en' | undefined) && userRow.language !== ''
          ? (userRow.language as 'fr' | 'en')
          : 'fr',
      );

      if (userRow.role === 'driver' && driver) {
        const driverDeliveries = await deliveryService.getDriverDeliveries(
          driver.id,
        );
        const nextStats = computeStats(driverDeliveries);
        nextStats.total = driver.total_deliveries || driverDeliveries.length;
        setStats(nextStats);
      } else {
        const userDeliveries = await deliveryService.getUserDeliveries();
        setStats(computeStats(userDeliveries));
      }

      syncStoreUser(userRow);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les informations du profil. Vérifiez votre connexion.',
      );
    } finally {
      setIsLoading(false);
    }
  }, [syncStoreUser]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  const profileStats = useMemo(() => {
    const items = [
      {
        icon: Package,
        label: isDriver ? 'Courses totales' : 'Livraisons',
        value: stats.total,
        color: AppColors.primary,
      },
      {
        icon: Clock,
        label: isDriver ? 'En cours' : 'En préparation',
        value: stats.active || stats.pending,
        color: AppColors.warning,
      },
      {
        icon: CheckCircle,
        label: 'Terminées',
        value: stats.delivered,
        color: AppColors.success,
      },
    ];

    if (isDriver) {
      items.push({
        icon: Star,
        label: 'Note',
        value: driverProfile?.rating ? driverProfile.rating.toFixed(1) : '4.8',
        color: '#F59E0B',
      });
    }

    return items;
  }, [driverProfile?.rating, isDriver, stats]);

  const quickActions = useMemo(() => {
    const base = [
      {
        key: 'deliveries',
        icon: Package,
        label: isDriver ? 'Mes courses' : 'Mes livraisons',
      },
      { key: 'addresses', icon: MapPin, label: 'Adresses' },
      { key: 'payments', icon: CreditCard, label: 'Paiements' },
      { key: 'support', icon: HelpCircle, label: 'Support' },
      { key: 'invite', icon: Gift, label: 'Inviter un ami' },
      { key: 'notifications', icon: Bell, label: 'Notifications' },
    ];

    return base;
  }, [isDriver]);

  const menuItems = useMemo(
    () => [
      { key: 'settings', icon: Settings, label: 'Paramètres' },
      { key: 'security', icon: Shield, label: 'Sécurité' },
      { key: 'about', icon: Info, label: 'À propos' },
    ],
    [],
  );

  const handleAction = useCallback(
    async (key: string) => {
      switch (key) {
        case 'deliveries':
          if (isDriver) {
            router.push('/driver/orders');
          } else {
            router.push('/(tabs)/deliveries');
          }
          break;
        case 'addresses':
          router.push('/select-locations');
          break;
        case 'payments':
          Alert.alert(
            'Paiements',
            'La gestion des moyens de paiement arrive bientôt.',
          );
          break;
        case 'support':
          Alert.alert(
            'Support Yatou',
            'Besoin d’aide ?',
            [
              {
                text: 'Appeler',
                onPress: () => Linking.openURL(`tel:${SUPPORT_PHONE}`),
              },
              { text: 'Fermer', style: 'cancel' },
            ],
            { cancelable: true },
          );
          break;
        case 'invite':
          Alert.alert(
            'Invitation envoyée',
            'Partagez votre application YATOU avec vos proches !',
          );
          break;
        case 'notifications':
          handleToggleNotifications(!notifEnabled);
          break;
        default:
          break;
      }
    },
    [isDriver, notifEnabled, router],
  );

  const handleToggleNotifications = useCallback(
    async (value: boolean) => {
      const previous = notifEnabled;
      setNotifEnabled(value);
      setIsUpdatingPrefs(true);
      try {
        const nextPrefs = {
          ...(profile?.notification_preferences || {}),
          push: value,
        };

        const updated = await userService.updateUserProfile({
          notification_preferences: nextPrefs,
        });
        setProfile(updated);
      } catch (error) {
        console.error('Erreur maj notifications:', error);
        Alert.alert(
          'Erreur',
          'Impossible de mettre à jour vos préférences. Réessayez.',
        );
        setNotifEnabled(previous);
      } finally {
        setIsUpdatingPrefs(false);
      }
    },
    [notifEnabled, profile],
  );

  const handleSwitchLanguage = useCallback(async () => {
    const previous = language;
    const next = previous === 'fr' ? 'en' : 'fr';
    setLanguage(next);
    setIsUpdatingPrefs(true);
    try {
      const updated = await userService.updateUserProfile({
        language: next,
      });
      setProfile(updated);
    } catch (error) {
      console.error('Erreur maj langue:', error);
      Alert.alert('Erreur', 'Impossible de changer la langue pour le moment.');
      setLanguage(previous);
    } finally {
      setIsUpdatingPrefs(false);
    }
  }, [language]);

  const handleLogout = useCallback(() => {
    Alert.alert('Déconnexion', 'Voulez-vous vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          try {
            await authService.logout();
          } catch (error) {
            console.warn('Erreur logout Supabase:', error);
          } finally {
            await logout();
            router.replace('/auth/login');
          }
        },
      },
    ]);
  }, [logout, router]);

  const displayName = useMemo(() => {
    if (profile?.name) {
      return profile.name;
    }
    if (authUser) {
      return `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim();
    }
    return 'Utilisateur YATOU';
  }, [authUser, profile?.name]);

  const email = profile?.email || authUser?.email || '—';
  const roleLabel = isDriver ? 'Livreur' : 'Client';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {isDriver ? (
              <SteeringWheel size={36} color={AppColors.primary} />
            ) : (
              <UserIcon size={36} color={AppColors.primary} />
            )}
            <TouchableOpacity
              style={styles.avatarEdit}
              onPress={() =>
                Alert.alert(
                  'Photo de profil',
                  'La personnalisation du profil arrive bientôt.',
                )
              }
            >
              <Edit3 size={14} color={AppColors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {displayName || 'Utilisateur YATOU'}
            </Text>
            <Text style={styles.userEmail}>{email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{roleLabel}</Text>
            </View>
            {driverProfile?.vehicle_info?.type ? (
              <Text style={styles.vehicleText}>
                {driverProfile.vehicle_info.type.toUpperCase()}
                {driverProfile.vehicle_info.plate
                  ? ` • ${driverProfile.vehicle_info.plate}`
                  : ''}
              </Text>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => Linking.openURL(`tel:${SUPPORT_PHONE}`)}
            >
              <Phone size={16} color={AppColors.primary} />
              <Text style={styles.headerBtnText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerBtn, styles.headerBtnGhost]}
              onPress={() =>
                Alert.alert(
                  'Modification profil',
                  'La modification des informations sera disponible prochainement.',
                )
              }
            >
              <Edit3 size={16} color={AppColors.text} />
              <Text style={[styles.headerBtnText, { color: AppColors.text }]}>
                Modifier
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={AppColors.primary} />
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              {profileStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <View key={`${stat.label}-${index}`} style={styles.statCard}>
                    <View
                      style={[styles.statIcon, { backgroundColor: stat.color }]}
                    >
                      <Icon size={16} color={AppColors.white} />
                    </View>
                    <Text style={styles.statValue}>
                      {typeof stat.value === 'number'
                        ? stat.value.toString()
                        : stat.value}
                    </Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Actions rapides</Text>
              <View style={styles.grid}>
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <TouchableOpacity
                      key={action.key}
                      style={styles.tile}
                      onPress={() => handleAction(action.key)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.tileIconWrap}>
                        <Icon size={18} color={AppColors.primary} />
                      </View>
                      <Text style={styles.tileText} numberOfLines={2}>
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Préférences</Text>
              <View style={styles.prefRow}>
                <View style={styles.prefLeft}>
                  <Bell size={18} color={AppColors.textSecondary} />
                  <Text style={styles.prefText}>Notifications</Text>
                </View>
                <Switch
                  value={notifEnabled}
                  onValueChange={handleToggleNotifications}
                  thumbColor={notifEnabled ? AppColors.primary : '#fff'}
                  trackColor={{
                    false: AppColors.border,
                    true: (AppColors as any).primaryLight || '#E6F0FF',
                  }}
                  disabled={isUpdatingPrefs}
                />
              </View>

              <TouchableOpacity
                style={styles.prefRow}
                onPress={handleSwitchLanguage}
                activeOpacity={0.75}
                disabled={isUpdatingPrefs}
              >
                <View style={styles.prefLeft}>
                  <Languages size={18} color={AppColors.textSecondary} />
                  <Text style={styles.prefText}>Langue</Text>
                </View>
                <Text style={styles.prefValue}>{language.toUpperCase()}</Text>
              </TouchableOpacity>
            </View>

            {isDriver && driverProfile ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Informations livreur</Text>
                <InfoRow label="Licence" value={driverProfile.license_number} />
                <InfoRow
                  label="Type de véhicule"
                  value={
                    driverProfile.vehicle_info?.type
                      ? driverProfile.vehicle_info.type.toUpperCase()
                      : 'Non renseigné'
                  }
                />
                <InfoRow
                  label="Disponibilité"
                  value={driverProfile.is_available ? 'En ligne' : 'Hors ligne'}
                />
                <InfoRow
                  label="Courses réalisées"
                  value={`${driverProfile.total_deliveries || 0}`}
                />
              </View>
            ) : null}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Compte</Text>
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.menuItem}
                    onPress={() =>
                      Alert.alert(
                        item.label,
                        'Cette fonctionnalité sera disponible prochainement.',
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <View style={styles.menuLeft}>
                      <Icon size={18} color={AppColors.textSecondary} />
                      <Text style={styles.menuText}>{item.label}</Text>
                    </View>
                    <Text style={styles.chevron}>{'>'}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <View style={styles.sectionCard}>
          <View style={styles.logoSection}>
            <YatouLogo size="large" showText={false} />
            <Text style={styles.logoTitle}>YATOU</Text>
            <Text style={styles.logoSubtitle}>Service de livraison</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogOut size={16} color={AppColors.white} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Version {appVersion}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const computeStats = (deliveries: Array<{ status: string }>): Stats => {
  const next: Stats = { ...DEFAULT_STATS };
  deliveries.forEach((delivery) => {
    next.total += 1;
    switch (delivery.status) {
      case 'pending':
        next.pending += 1;
        break;
      case 'confirmed':
      case 'picked_up':
      case 'in_transit':
        next.active += 1;
        break;
      case 'delivered':
        next.delivered += 1;
        break;
      case 'cancelled':
        next.cancelled += 1;
        break;
      default:
        break;
    }
  });
  return next;
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    gap: 12,
  },
  avatarContainer: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarEdit: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: AppColors.white,
  },
  headerInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: AppColors.text,
  },
  userEmail: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: AppColors.primaryLight,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.primary,
    textTransform: 'uppercase',
  },
  vehicleText: {
    marginTop: 6,
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: AppColors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBtnGhost: {
    backgroundColor: AppColors.white,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  headerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: AppColors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: AppColors.white,
    marginHorizontal: 6,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  statLabel: {
    marginTop: 4,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  sectionCard: {
    backgroundColor: AppColors.white,
    marginHorizontal: 16,
    marginTop: 18,
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.text,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  tile: {
    width: '33.333%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignSelf: 'center',
    backgroundColor: AppColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  tileText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.text,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prefText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '600',
  },
  prefValue: {
    fontSize: 14,
    color: AppColors.textSecondary,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  logoSection: {
    alignItems: 'center',
    gap: 6,
  },
  logoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.text,
  },
  logoSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: AppColors.primary,
    paddingVertical: 14,
    borderRadius: 999,
  },
  logoutText: {
    color: AppColors.white,
    fontWeight: '700',
    fontSize: 15,
  },
  version: {
    marginTop: 16,
    textAlign: 'center',
    color: AppColors.textSecondary,
    fontSize: 12,
  },
  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
  },
  infoLabel: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    color: AppColors.text,
    fontWeight: '600',
  },
});
