# 🚚 Composant YatouPricingGrid

## 📋 Description

Le composant `YatouPricingGrid` est un composant React Native réutilisable qui affiche la grille tarifaire complète des services YATOU. Il présente de manière claire et organisée tous les services disponibles, les calculs intelligents et les plans d'abonnement.

## ✨ Fonctionnalités

### 🎯 **Services Disponibles**
- **Livraison de Colis** : Moto (max 4kg) - À partir de 300 FCFA
- **Course** : Moto, Tricycle, Cargo - À partir de 500 FCFA
- **Déménagement** : Tricycle, Fourgonnette/Camion - À partir de 2000 FCFA

### 🧠 **Calculs Intelligents**
- 💰 Prix de base selon service et véhicule
- 📏 Suppléments distance (après 2km)
- ⏰ Ajustements horaires (après 20h)
- 🌤️ Suppléments météo (mauvaises conditions)
- 🏢 Suppléments déménagement (étage, pièces)

### 📱 **Plans d'Abonnement**
- 👥 **Particuliers** : Express, Flex, Premium
- 🏢 **Entreprises** : Pro, Pro Plus, Unlimited
- 🛒 **E-commerce** : E-Start, E-Plus, E-Premium

## 🔧 Utilisation

### **Import du Composant**
```tsx
import YatouPricingGrid from '@/components/YatouPricingGrid';
```

### **Utilisation Basique**
```tsx
<YatouPricingGrid />
```

### **Utilisation avec Callback**
```tsx
<YatouPricingGrid 
  onCalculatePrice={() => {
    // Votre logique ici
    console.log('Calcul de prix demandé');
  }}
/>
```

### **Utilisation Personnalisée**
```tsx
<YatouPricingGrid 
  onCalculatePrice={handleCalculatePrice}
  customTitle="🌟 YATOU Premium Services"
  customSubtitle="Découvrez notre gamme complète"
  showPricingDetails={true}
/>
```

## 📱 Props

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `onCalculatePrice` | `() => void` | `undefined` | Callback appelé lors du clic sur le bouton de calcul |
| `showPricingDetails` | `boolean` | `true` | Affiche/masque le bouton de calcul |
| `customTitle` | `string` | `"🚚 Services YATOU"` | Titre personnalisé du composant |
| `customSubtitle` | `string` | `undefined` | Sous-titre optionnel |

## 🎨 Styles

Le composant utilise le système de couleurs `AppColors` pour maintenir la cohérence visuelle :

- **Container** : Fond blanc avec ombre et bordure
- **Titre** : Couleur primaire YATOU
- **Sections** : Couleurs de texte standard
- **Bouton** : Couleur primaire avec texte blanc

## 📍 Cas d'Usage

### **1. Écran d'Accueil**
```tsx
<YatouPricingGrid 
  onCalculatePrice={() => setShowTripPanel(true)}
  customTitle="🚚 Services YATOU"
  customSubtitle="Découvrez nos services et tarifs transparents"
/>
```

### **2. Bottom Sheet de Trajet**
```tsx
<YatouPricingGrid 
  onCalculatePrice={handleServiceSelection}
  customTitle="📋 Services Disponibles"
  showPricingDetails={true}
/>
```

### **3. Page d'Information**
```tsx
<YatouPricingGrid 
  showPricingDetails={false}
  customTitle="ℹ️ À Propos de YATOU"
  customSubtitle="Votre partenaire de confiance pour tous vos besoins de transport"
/>
```

### **4. Mode Compact**
```tsx
<YatouPricingGrid 
  showPricingDetails={false}
  customTitle="📋 Services YATOU"
  customSubtitle="Vue d'ensemble des services disponibles"
/>
```

## 🔄 Maintenance et Modifications

### **Modifier les Services**
Pour ajouter ou modifier un service, éditez le composant `YatouPricingGrid.tsx` :

```tsx
<View style={styles.serviceItem}>
  <Text style={styles.serviceIcon}>🆕</Text>
  <View style={styles.serviceDetails}>
    <Text style={styles.serviceName}>Nouveau Service</Text>
    <Text style={styles.serviceDescription}>Description du nouveau service</Text>
  </View>
</View>
```

### **Modifier les Calculs**
Pour ajouter de nouveaux calculs intelligents :

```tsx
<View style={styles.calculationItem}>
  <Text style={styles.calculationIcon}>🆕</Text>
  <Text style={styles.calculationText}>Nouveau calcul intelligent</Text>
</View>
```

### **Modifier les Plans d'Abonnement**
Pour modifier les plans :

```tsx
<View style={styles.subscriptionItem}>
  <Text style={styles.subscriptionIcon}>🆕</Text>
  <View style={styles.subscriptionDetails}>
    <Text style={styles.subscriptionName}>Nouveau Plan</Text>
    <Text style={styles.subscriptionDescription">Description du plan</Text>
  </View>
</View>
```

## 🚀 Avantages du Composant

### **✅ Facilité de Maintenance**
- **Centralisé** : Toutes les modifications se font dans un seul fichier
- **Réutilisable** : Utilisable dans différents écrans
- **Modulaire** : Structure claire et organisée

### **✅ Cohérence Visuelle**
- **Design uniforme** : Même apparence partout dans l'app
- **Thème cohérent** : Utilise le système de couleurs YATOU
- **Responsive** : S'adapte à différentes tailles d'écran

### **✅ Flexibilité**
- **Props configurables** : Personnalisation facile
- **Variantes multiples** : Différents modes d'affichage
- **Callbacks** : Intégration facile avec la logique métier

## 📱 Démonstration

Consultez le fichier `examples/YatouPricingGridDemo.tsx` pour voir toutes les variantes du composant en action.

## 🔗 Intégration

Le composant est maintenant intégré dans :
- ✅ **Écran d'accueil** (`app/(tabs)/index.tsx`)
- 🔄 **Bottom sheet de trajet** (à intégrer si nécessaire)
- 📋 **Autres écrans** (selon les besoins)

## 🎯 Prochaines Étapes

1. **Tester** le composant dans l'application
2. **Intégrer** dans d'autres écrans si nécessaire
3. **Personnaliser** selon les besoins spécifiques
4. **Optimiser** les performances si nécessaire

---

**🚀 Le composant YatouPricingGrid est maintenant prêt et facilite grandement la maintenance et les modifications futures de la grille tarifaire YATOU !**
