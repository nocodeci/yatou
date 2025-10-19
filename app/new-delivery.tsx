import React, { useMemo, useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Pressable,
  Keyboard,
  Animated,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Stack, useRouter } from "expo-router"
import * as ImagePicker from "expo-image-picker"
import DateTimePicker from "@react-native-community/datetimepicker"
import { Camera, Image as ImageIcon, Trash2, Clock, X, Calendar, Check } from "lucide-react-native"

import { useDeliveryStore } from "@/app/store/delivery-store"
import { AppColors } from "@/app/constants/colors"
import Button from "@/components/Button"
import { DeliveryAddress, Package as PackageType } from "@/app/types/delivery"

const DEFAULT_CITY = "Bouaké"

export default function NewDeliverySimpleScreen() {
  const router = useRouter()
  const { addDelivery } = useDeliveryStore()

  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined)
  const [quantity, setQuantity] = useState<number>(1)
  const [productPrice, setProductPrice] = useState<string>("")
  const [pickupPoint, setPickupPoint] = useState<string>("")
  const [destination, setDestination] = useState<string>("")

  // Date et heure via DateTimePicker
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tempDate, setTempDate] = useState<Date>(selectedDate) // utilisé sur iOS
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false)
  
  const [time, setTime] = useState<Date>(getNowRoundedTo5min())
  const [tempTime, setTempTime] = useState<Date>(time) // utilisé sur iOS
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false)

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à la galerie pour ajouter l'image du produit.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.85,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
    })
    if (!result.canceled) {
      setPhotoUri(result.assets?.[0]?.uri)
    }
  }

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "Autorisez l'accès à la caméra pour prendre une photo du produit.")
      return
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.85,
      aspect: [4, 3],
    })
    if (!result.canceled) {
      setPhotoUri(result.assets?.[0]?.uri)
    }
  }

  const openImageChoice = () => {
    Alert.alert("Ajouter une image", "Choisissez une source", [
      { text: "Caméra", onPress: pickFromCamera },
      { text: "Galerie", onPress: pickFromGallery },
      { text: "Annuler", style: "cancel" },
    ])
  }

  const removeImage = () => setPhotoUri(undefined)

  const validate = () => {
    if (!pickupPoint.trim() || !destination.trim()) {
      Alert.alert("Champs requis", "Renseignez le point de prise et la destination.")
      return false
    }
    if (!quantity || quantity < 1) {
      Alert.alert("Quantité invalide", "La quantité doit être au moins 1.")
      return false
    }
    if (!productPrice.trim() || parseFloat(productPrice) <= 0) {
      Alert.alert("Prix invalide", "Renseignez un prix valide pour le produit.")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    console.log('🎯 handleSubmit appelé (new-delivery)');
    if (!validate()) return

    try {
      const pickupAddress: DeliveryAddress = {
        id: Date.now().toString(),
        name: "Expéditeur",
        address: pickupPoint,
        city: DEFAULT_CITY,
        postalCode: "00000",
        phone: "-",
        instructions: "",
        coordinates: [-5.0189, 7.6995], // Coordonnées par défaut (Bouaké)
      }

      const deliveryAddress: DeliveryAddress = {
        id: (Date.now() + 1).toString(),
        name: "Destinataire",
        address: destination,
        city: DEFAULT_CITY,
        postalCode: "00000",
        phone: "-",
        instructions: "",
        coordinates: [-5.0189, 7.6995], // Coordonnées par défaut (Bouaké)
      }

      const pkg: PackageType = {
        id: (Date.now() + 2).toString(),
        description: `Produit x${quantity}`,
        weight: 0,
        value: parseFloat(productPrice),
        fragile: false,
        dimensions: { length: 0, width: 0, height: 0 },
      }

      ;(pkg as any).photoUri = photoUri
      ;(pkg as any).quantity = quantity

      const scheduledDate = makeDateWithTime(selectedDate, time)

      const deliveryRecord = {
        status: "pending" as const,
        pickupAddress,
        deliveryAddress,
        package: pkg,
        scheduledDate,
        price: calculateDeliveryPrice(parseFloat(productPrice), quantity),
      }

      await addDelivery(deliveryRecord as any)

      Alert.alert("Succès", "Demande de livraison créée.", [
        { text: "OK", onPress: () => router.push("/(tabs)/deliveries") },
      ])
    } catch (e) {
      console.error('Erreur lors de la création de la livraison:', e);
      Alert.alert("Erreur", "Impossible de créer la livraison.")
    }
  }

  const timeLabel = useMemo(() => {
    const hh = String(time.getHours()).padStart(2, "0")
    const mm = String(time.getMinutes()).padStart(2, "0")
    return `${hh}:${mm}`
  }, [time])

  const openDatePicker = () => {
    if (Platform.OS === "ios") {
      setTempDate(selectedDate)
      setShowDatePicker(true)
    } else {
      setShowDatePicker(true)
    }
  }

  const onAndroidDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false)
    if (selected) setSelectedDate(selected)
  }

  const onIosDateConfirm = () => {
    setSelectedDate(tempDate)
    setShowDatePicker(false)
  }

  const openTimePicker = () => {
    if (Platform.OS === "ios") {
      setTempTime(time)
      setShowTimePicker(true)
    } else {
      setShowTimePicker(true)
    }
  }

  const onAndroidTimeChange = (_: any, selected?: Date) => {
    // Android affiche un modal système; on ferme après choix
    setShowTimePicker(false)
    if (selected) setTime(selected)
  }

  const onIosConfirm = () => {
    setTime(tempTime)
    setShowTimePicker(false)
  }

  const placeholderColor = AppColors.textSecondary || "#6b7280"

    return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: "Nouvelle livraison (Bouaké)", headerBackTitle: "Retour" }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
      <View style={styles.formSection}>
            <Text style={styles.formTitle}>Détails</Text>

            {/* Image – zone cliquable */}
            <Text style={styles.inputLabel}>Image du produit (optionnel)</Text>

            {!photoUri ? (
              <TouchableOpacity style={styles.dropzone} onPress={openImageChoice} activeOpacity={0.8}>
                <View style={styles.dropzoneContent}>
                  <ImageIcon size={28} color={AppColors.primary} />
                  <Text style={styles.dropzoneTitle}>Ajouter une photo</Text>
                  <Text style={styles.dropzoneHint}>PNG ou JPG — Caméra ou Galerie</Text>
                  <View style={styles.dropzoneButtons}>
                    <TouchableOpacity style={[styles.secondaryBtn, { marginRight: 8 }]} onPress={pickFromCamera}>
                      <Camera size={16} color={AppColors.primary} />
                      <Text style={styles.secondaryBtnText}>Caméra</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery}>
                      <ImageIcon size={16} color={AppColors.primary} />
                      <Text style={styles.secondaryBtnText}>Galerie</Text>
                    </TouchableOpacity>
          </View>
          </View>
        </TouchableOpacity>
          ) : (
            <View style={styles.previewWrapper}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
              <View style={styles.previewActions}>
                  <TouchableOpacity style={styles.iconButton} onPress={openImageChoice} accessibilityLabel="Changer l'image">
                  <ImageIcon color={AppColors.text} size={18} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton} onPress={removeImage} accessibilityLabel="Supprimer l'image">
                    <Trash2 color={(AppColors as any).danger || "#D11"} size={18} />
                </TouchableOpacity>
              </View>
            </View>
          )}

            {/* Quantité */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Quantité *</Text>
              <TextInput
                style={styles.input}
                value={String(quantity)}
                onChangeText={(t) => setQuantity(safePositiveInt(t))}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={placeholderColor}
              />
        </View>

            {/* Prix du produit */}
      <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prix du produit (CFA) *</Text>
        <TextInput
          style={styles.input}
                value={productPrice}
                onChangeText={setProductPrice}
                keyboardType="numeric"
                placeholder="Ex: 5000"
                placeholderTextColor={placeholderColor}
              />
              <Text style={styles.inputHint}>Prix en francs CFA</Text>
      </View>

            {/* Point de prise */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Point de prise du colis (Bouaké) *</Text>
          <TextInput
            style={styles.input}
                value={pickupPoint}
                onChangeText={setPickupPoint}
                placeholder="Ex: Quartier Kennedy, devant la pharmacie"
                placeholderTextColor={placeholderColor}
          />
        </View>

            {/* Destination */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Destination (Bouaké) *</Text>
          <TextInput
            style={styles.input}
                value={destination}
                onChangeText={setDestination}
                placeholder="Ex: Belleville 3, école primaire"
                placeholderTextColor={placeholderColor}
          />
        </View>

            {/* Date de livraison */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date de livraison *</Text>
              <TouchableOpacity style={styles.dateButton} onPress={openDatePicker} activeOpacity={0.9}>
                <Calendar size={18} color={AppColors.primary} />
                <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</Text>
              </TouchableOpacity>

              {/* Android: modal système pour la date */}
              {showDatePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={onAndroidDateChange}
                  minimumDate={new Date()}
                  themeVariant="light"
                />
              )}

              {/* iOS: modal personnalisé pour la date */}
              <Modal
                visible={showDatePicker && Platform.OS === "ios"}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDatePicker(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
                  <Pressable style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Choisir la date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)} accessibilityLabel="Fermer">
                        <X size={20} color={AppColors.text} />
                      </TouchableOpacity>
      </View>

                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={(_, d) => d && setTempDate(d)}
                      minimumDate={new Date()}
                      textColor={AppColors.text}
                      locale="fr-FR"
                    />

                    <View style={styles.modalFooter}>
                      <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setShowDatePicker(false)}>
                        <Text style={[styles.modalBtnText, { color: AppColors.text }]}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={onIosDateConfirm}>
                        <Text style={[styles.modalBtnText, { color: "#fff" }]}>Valider</Text>
                      </TouchableOpacity>
      </View>
                  </Pressable>
                </Pressable>
              </Modal>
    </View>

            {/* Heure – bouton + modal/picker natif */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Heure de prise du colis *</Text>
              <TouchableOpacity style={styles.timeButton} onPress={openTimePicker} activeOpacity={0.9}>
                <Clock size={18} color={AppColors.primary} />
                <Text style={styles.timeButtonText}>{timeLabel}</Text>
              </TouchableOpacity>

              {/* Android: modal système */}
              {showTimePicker && Platform.OS === "android" && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={onAndroidTimeChange}
                  themeVariant="light"
                />
              )}

              {/* iOS: modal personnalisé pour meilleure visibilité */}
              <Modal
                visible={showTimePicker && Platform.OS === "ios"}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTimePicker(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setShowTimePicker(false)}>
                  <Pressable style={styles.modalSheet}>
                    <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Choisir l'heure</Text>
                      <TouchableOpacity onPress={() => setShowTimePicker(false)} accessibilityLabel="Fermer">
                        <X size={20} color={AppColors.text} />
                      </TouchableOpacity>
            </View>

                    <DateTimePicker
                      value={tempTime}
                      mode="time"
                      display="spinner"
                      is24Hour
                      onChange={(_, d) => d && setTempTime(d)}
                      textColor={AppColors.text} // iOS seulement
                      locale="fr-FR"
                    />

                    <View style={styles.modalFooter}>
                      <TouchableOpacity style={[styles.modalBtn, styles.modalBtnGhost]} onPress={() => setShowTimePicker(false)}>
                        <Text style={[styles.modalBtnText, { color: AppColors.text }]}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalBtn, styles.modalBtnPrimary]} onPress={onIosConfirm}>
                        <Text style={[styles.modalBtnText, { color: "#fff" }]}>Valider</Text>
                      </TouchableOpacity>
        </View>
                  </Pressable>
                </Pressable>
              </Modal>
      </View>
          </View>

          {/* Affichage du prix calculé - déplacé à l'intérieur du ScrollView */}
          {productPrice && quantity > 0 && (
            <View style={styles.priceSummary}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Valeur des produits :</Text>
                <Text style={styles.priceValue}>
                  {parseFloat(productPrice) * quantity} CFA
                </Text>
                  </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Frais de livraison :</Text>
                <Text style={styles.priceValue}>
                  {calculateDeliveryPrice(parseFloat(productPrice), quantity) - (parseFloat(productPrice) * quantity)} CFA
                  </Text>
                </View>
              <View style={[styles.priceRow, styles.totalPriceRow]}>
                <Text style={styles.totalPriceLabel}>Total :</Text>
                <Text style={styles.totalPriceValue}>
                  {calculateDeliveryPrice(parseFloat(productPrice), quantity)} CFA
          </Text>
        </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button title="Créer la livraison" onPress={handleSubmit} fullWidth />
        </View>
      </KeyboardAvoidingView>
      
      {/* Accessoire clavier avec bouton OK - en dehors du KeyboardAvoidingView */}
      <KeyboardAccessoryView />
    </SafeAreaView>
  )
}

// Composant pour l'accessoire clavier
function KeyboardAccessoryView() {
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true)
      setKeyboardHeight(e.endCoordinates.height)
    })
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
      setKeyboardHeight(0)
    })

    return () => {
      keyboardDidShowListener?.remove()
      keyboardDidHideListener?.remove()
    }
  }, [])

  if (!keyboardVisible) return null

  return (
    <View style={[styles.keyboardAccessory, { bottom: keyboardHeight }]}>
      <TouchableOpacity 
        style={styles.okButton} 
        onPress={() => Keyboard.dismiss()}
        activeOpacity={0.8}
      >
        <Check size={16} color={AppColors.white} />
        <Text style={styles.okButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  )
}

/* Helpers */

function getNowRoundedTo5min() {
  const d = new Date()
  const m = d.getMinutes()
  d.setMinutes(m - (m % 5), 0, 0)
  return d
}

function makeDateWithTime(date: Date, time: Date) {
  const newDate = new Date(date)
  newDate.setHours(time.getHours(), time.getMinutes(), 0, 0)
  return newDate.toISOString().split("Z")[0]
}

function safePositiveInt(v: string) {
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10)
  return isNaN(n) || n < 1 ? 1 : n
}

function calculateDeliveryPrice(productPrice: number, quantity: number): number {
  // Prix de base de livraison : 1000 CFA
  const baseDeliveryPrice = 1000
  
  // Prix total des produits
  const totalProductValue = productPrice * quantity
  
  // Frais de livraison : 5% de la valeur des produits + prix de base
  const deliveryFee = Math.max(baseDeliveryPrice, totalProductValue * 0.05)
  
  // Prix total de la livraison
  return Math.round(baseDeliveryPrice + deliveryFee)
}

function simplePrice(quantity: number) {
  return 10 * Math.max(1, quantity)
}

/* Styles */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  formSection: {
    padding: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: AppColors.text,
    marginBottom: 16,
  },
  inputGroup: {
    marginTop: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: AppColors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: AppColors.white,
    color: AppColors.text,
  },
  inputHint: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },

  /* Image picker – design lisible */
  dropzone: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: AppColors.primary,
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: AppColors.white,
  },
  dropzoneContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  dropzoneTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  dropzoneHint: {
    marginTop: 2,
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  dropzoneButtons: {
    marginTop: 12,
    flexDirection: "row",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: (AppColors as any).primaryLight || "#EEF2FF",
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderRadius: 10,
    gap: 6,
  },
  secondaryBtnText: {
    color: AppColors.primary,
    fontWeight: "600",
    fontSize: 13,
  },

  previewWrapper: {
    marginTop: 6,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  previewImage: {
    width: "100%",
    height: 200,
    backgroundColor: AppColors.surface,
  },
  previewActions: {
    position: "absolute",
    right: 8,
    top: 8,
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AppColors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AppColors.border,
  },

  /* Date button */
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: AppColors.white,
  },
  dateButtonText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "600",
  },

  /* Time button */
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: AppColors.white,
  },
  timeButtonText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "600",
  },

  /* iOS modal picker */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: AppColors.white,
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: AppColors.text,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 8,
  },
  modalBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalBtnGhost: {
    backgroundColor: AppColors.white,
    borderColor: AppColors.border,
  },
  modalBtnPrimary: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  modalBtnText: {
    fontWeight: "700",
    fontSize: 14,
  },

  footer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 60, // Marge réduite pour mieux positionner le bouton
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },

  /* Résumé des prix */
  priceSummary: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: AppColors.text,
    fontWeight: "500",
  },
  totalPriceRow: {
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalPriceLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.text,
  },
  totalPriceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.primary,
  },
  
  /* Accessoire clavier */
  keyboardAccessory: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
    zIndex: 1000,
  },
  okButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  okButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})