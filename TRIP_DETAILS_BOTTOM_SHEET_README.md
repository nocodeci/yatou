# 🚚 Composant TripDetailsBottomSheet Complet

## 📋 Description

Le composant `TripDetailsBottomSheet` est un bottom sheet complet et autonome qui affiche tous les détails d'un trajet YATOU. Il intègre la grille tarifaire, la sélection de services, la configuration des options et offre une expérience utilisateur moderne de type Uber.

## ✨ Fonctionnalités Principales

### 🎯 **Détails du Trajet**
- **Informations de départ et arrivée** avec icônes et design moderne
- **Statistiques du trajet** : distance, durée, type de route
- **Informations de trafic** avec indicateurs visuels
- **ETA (Estimated Time of Arrival)** affiché clairement

### 💰 **Grille Tarifaire YATOU Intégrée**
- **Composant YatouPricingGrid** intégré directement
- **Tous les services** : Livraison, Course, Déménagement
- **Calculs intelligents** avec explications détaillées
- **Plans d'abonnement** pour tous les types d'utilisateurs

### ⚙️ **Configuration des Services**
- **Sélection de service** : Livraison, Course, Déménagement
- **Sélection de véhicule** : Moto, Tricycle, Cargo, Fourgonnette
- **Calcul de prix en temps réel** basé sur les sélections
- **Interface intuitive** avec boutons de sélection

### 📱 **Interface Uber-like**
- **Animations fluides** d'ouverture et fermeture
- **Backdrop interactif** pour fermer le bottom sheet
- **Handle bar** pour indiquer la possibilité de glisser
- **Design responsive** qui s'adapte à toutes les tailles d'écran

## 🔧 Utilisation

### **Import du Composant**
```tsx
import TripDetailsBottomSheet from '@/components/TripDetailsBottomSheet';
```

### **Utilisation Basique**
```tsx
<TripDetailsBottomSheet
  visible={showBottomSheet}
  onClose={() => setShowBottomSheet(false)}
/>
```

### **Utilisation Complète**
```tsx
<TripDetailsBottomSheet
  visible={showBottomSheet}
  onClose={() => setShowBottomSheet(false)}
  tripData={{
    origin: 'Bouaké, Centre',
    destination: 'Yamoussoukro, Centre',
    distance: 45.2,
    duration: 65,
    routeType: 'Express',
    trafficLevel: 'medium',
    eta: '14:30'
  }}
  onCalculatePrice={() => {
    console.log('Calcul de prix demandé');
  }}
/>
```

## 📱 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `visible` | `boolean` | `false` | Contrôle la visibilité du bottom sheet |
| `onClose` | `() => void` | **Requis** | Callback appelé lors de la fermeture |
| `tripData` | `TripData` | `undefined` | Données du trajet à afficher |
| `onCalculatePrice` | `() => void` | `undefined` | Callback pour le calcul de prix |

### **Interface TripData**
```tsx
interface TripData {
  origin?: string;           // Point de départ
  destination?: string;      // Point d'arrivée
  distance?: number;         // Distance en km
  duration?: number;         // Durée en minutes
  estimatedPrice?: number;   // Prix estimé
  routeType?: string;        // Type de route
  trafficLevel?: 'low' | 'medium' | 'high';  // Niveau de trafic
  eta?: string;              // Heure d'arrivée estimée
}
```

## 🎨 Structure du Composant

### **1. Header avec Handle Bar**
- **Handle bar** pour indiquer la possibilité de glisser
- **Titre du bottom sheet** avec bouton de fermeture
- **Séparateur visuel** pour organiser le contenu

### **2. Détails du Trajet**
- **Carte des points** de départ et arrivée
- **Statistiques** : distance, durée, type de route
- **Indicateur de trafic** avec couleurs contextuelles

### **3. Grille Tarifaire YATOU**
- **Composant intégré** YatouPricingGrid
- **Tous les services** et leurs descriptions
- **Bouton d'action** pour explorer les services

### **4. Configuration des Services**
- **Sélecteurs** pour service et véhicule
- **Calcul de prix** en temps réel
- **Affichage du résultat** avec mise en forme

### **5. Aperçu des Services**
- **Résumé complet** de tous les services YATOU
- **Calculs intelligents** expliqués
- **Plans d'abonnement** détaillés

### **6. Bouton de Confirmation**
- **Action principale** pour commander
- **Design attractif** avec icône et texte

## 🚀 Fonctionnalités Avancées

### **Animations Fluides**
```tsx
// Animation d'entrée
Animated.parallel([
  Animated.timing(slideAnim, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  }),
  Animated.timing(backdropOpacity, {
    toValue: 0.5,
    duration: 300,
    useNativeDriver: true,
  }),
]).start();
```

### **Calcul de Prix Intelligent**
```tsx
const calculateYatouPrice = () => {
  let basePrice = 0;
  let distanceMultiplier = 1;

  // Prix de base selon le service
  switch (selectedService) {
    case 'delivery': basePrice = 300; break;
    case 'errand': basePrice = 500; break;
    case 'moving': basePrice = 2000; break;
  }

  // Multiplicateur selon le véhicule
  switch (selectedVehicle) {
    case 'moto': distanceMultiplier = 1; break;
    case 'tricycle': distanceMultiplier = 1.2; break;
    case 'cargo': distanceMultiplier = 1.5; break;
    case 'van': distanceMultiplier = 2; break;
  }

  const finalPrice = Math.round((basePrice + (distance * 100)) * distanceMultiplier);
  setCalculatedPrice(finalPrice);
};
```

### **Gestion des États**
- **État local** pour la configuration des services
- **Sélection multiple** avec validation
- **Calculs en temps réel** des prix

## 📍 Cas d'Usage

### **1. Écran Principal de Carte**
```tsx
// Dans MapView.tsx
<TripDetailsBottomSheet
  visible={showTripDetails}
  onClose={() => setShowTripDetails(false)}
  tripData={tripData}
  onCalculatePrice={() => setShowPricing(true)}
/>
```

### **2. Page de Détails de Trajet**
```tsx
// Dans un écran dédié
<TripDetailsBottomSheet
  visible={true}
  onClose={() => router.back()}
  tripData={route.params.tripData}
  onCalculatePrice={handleServiceSelection}
/>
```

### **3. Modal de Configuration**
```tsx
// Dans un modal
<TripDetailsBottomSheet
  visible={showConfigModal}
  onClose={() => setShowConfigModal(false)}
  tripData={selectedTrip}
  onCalculatePrice={handlePriceCalculation}
/>
```

## 🔄 Maintenance et Modifications

### **Modifier les Services Disponibles**
Pour ajouter un nouveau service, éditez le composant :

```tsx
// Dans la section de sélection des services
{(['delivery', 'errand', 'moving', 'newService'] as const).map((service) => (
  <TouchableOpacity
    key={service}
    style={[styles.optionButton, selectedService === service && styles.selectedOptionButton]}
    onPress={() => setSelectedService(service)}
  >
    <Text style={styles.optionIcon}>{getServiceIcon(service)}</Text>
    <Text style={styles.optionText}>{getServiceLabel(service)}</Text>
  </TouchableOpacity>
))}
```

### **Modifier la Logique de Calcul**
Pour ajuster les calculs de prix :

```tsx
const calculateYatouPrice = () => {
  // Votre nouvelle logique de calcul ici
  let basePrice = getBasePrice(selectedService);
  let multipliers = getMultipliers(selectedVehicle, tripData);
  
  const finalPrice = calculateFinalPrice(basePrice, multipliers, tripData);
  setCalculatedPrice(finalPrice);
};
```

### **Personnaliser l'Interface**
Pour modifier l'apparence :

```tsx
// Dans les styles
const styles = StyleSheet.create({
  bottomSheet: {
    // Vos modifications de style ici
    height: screenHeight * 0.9, // Hauteur personnalisée
    backgroundColor: AppColors.customBackground,
  },
  // Autres styles personnalisés...
});
```

## 🚀 Avantages du Composant

### **✅ Autonomie Complète**
- **Composant autonome** qui ne dépend d'aucun autre
- **Gestion d'état interne** pour tous les besoins
- **Props minimales** pour une utilisation simple

### **✅ Réutilisabilité**
- **Utilisable partout** dans l'application
- **Props configurables** pour différents contextes
- **Interface cohérente** dans tous les écrans

### **✅ Maintenance Facile**
- **Code centralisé** dans un seul fichier
- **Structure claire** et bien organisée
- **Commentaires détaillés** pour chaque section

### **✅ Performance Optimisée**
- **Animations natives** pour une fluidité maximale
- **Rendu conditionnel** pour éviter les calculs inutiles
- **Gestion d'état efficace** avec React hooks

## 📱 Démonstration

Consultez le fichier `examples/TripDetailsBottomSheetDemo.tsx` pour voir le composant en action avec des données de démonstration complètes.

## 🔗 Intégration

Le composant est maintenant intégré dans :
- ✅ **MapView** (`components/MapView.tsx`)
- 🔄 **Autres écrans** (selon les besoins)

## 🎯 Prochaines Étapes

1. **Tester** le composant dans l'application
2. **Intégrer** dans d'autres écrans si nécessaire
3. **Personnaliser** selon les besoins spécifiques
4. **Optimiser** les performances si nécessaire

---

**🚀 Le composant TripDetailsBottomSheet complet est maintenant prêt et offre une expérience utilisateur moderne et complète pour tous les détails de trajet YATOU !**
