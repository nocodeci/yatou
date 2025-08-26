# 🎨 Personnalisation des Styles d'Itinéraire

Ce guide vous explique comment personnaliser le design de vos itinéraires sur Google Maps dans votre application React Native.

## 📋 Table des Matières

- [Composants Disponibles](#composants-disponibles)
- [Installation et Utilisation](#installation-et-utilisation)
- [Styles Prédéfinis](#styles-prédéfinis)
- [Personnalisation Avancée](#personnalisation-avancée)
- [Exemples d'Utilisation](#exemples-dutilisation)
- [Performance et Optimisations](#performance-et-optimisations)

## 🧩 Composants Disponibles

### 1. `CustomRoute`
Composant principal pour afficher des itinéraires avec des styles personnalisés.

**Fonctionnalités :**
- ✅ Couleurs personnalisables
- ✅ Épaisseur de ligne ajustable
- ✅ Animations de tracé
- ✅ Gradients de couleur
- ✅ Flèches de direction
- ✅ Motifs de ligne (pointillés, etc.)
- ✅ Points de début et fin stylisés
- ✅ **Couleurs dynamiques** selon le statut, priorité, type, distance et trafic
- ✅ **Sélecteur de couleurs** intégré avec palette complète

### 2. `ColorPicker`
Interface complète pour la sélection et la personnalisation des couleurs.

**Fonctionnalités :**
- ✅ **24 couleurs prédéfinies** organisées par catégories
- ✅ **Couleurs thématiques** pour livraison, statut et priorité
- ✅ **Couleurs avec transparence** (rgba)
- ✅ **Aperçu en temps réel** de la couleur sélectionnée
- ✅ **Interface intuitive** avec grille de couleurs

### 2. `RouteStyleConfig`
Interface utilisateur pour sélectionner et configurer les styles d'itinéraire.

**Fonctionnalités :**
- ✅ 8 styles prédéfinis
- ✅ Aperçu visuel des styles
- ✅ Configuration en temps réel
- ✅ Interface intuitive

## 🚀 Installation et Utilisation

### Étape 1 : Remplacer l'ancien Polyline

**Avant (ancien code) :**
```tsx
<Polyline
  coordinates={routeCoordinates}
  strokeColor="#E8F5E8"
  strokeWidth={6}
/>
```

**Après (nouveau code) :**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  strokeColor="#FF6B6B"
  strokeWidth={8}
  animated={true}
  gradient={true}
  startColor="#FF6B6B"
  endColor="#4ECDC4"
  showDirectionArrows={true}
/>
```

### Étape 2 : Ajouter la configuration des styles

```tsx
import RouteStyleConfig, { RouteStyle, PREDEFINED_ROUTE_STYLES } from './components/RouteStyleConfig';

const [routeStyle, setRouteStyle] = useState<RouteStyle>(PREDEFINED_ROUTE_STYLES[0]);

// Dans votre JSX
<RouteStyleConfig
  selectedStyle={routeStyle}
  onStyleChange={setRouteStyle}
/>
```

### Étape 3 : Intégrer dans MapView

```tsx
{routeCoordinates.length > 0 && (
  <CustomRoute
    coordinates={routeCoordinates}
    strokeColor={routeStyle.strokeColor}
    strokeWidth={routeStyle.strokeWidth}
    animated={routeStyle.animated}
    gradient={routeStyle.gradient}
    startColor={routeStyle.startColor}
    endColor={routeStyle.endColor}
    showDirectionArrows={routeStyle.showDirectionArrows}
    lineDashPattern={routeStyle.lineDashPattern}
    zIndex={1000}
  />
)}
```

## 🎨 Styles Prédéfinis

### 1. **Classique** 🎯
- Couleur : Primaire de l'app
- Épaisseur : 6px
- Style : Simple et élégant

### 2. **Animé** ▶️
- Couleur : Bleu ciel (#00BFFF)
- Épaisseur : 5px
- Animation : Tracé progressif
- Flèches de direction

### 3. **Gradient** 🌈
- Couleurs : Rouge (#FF6B6B) → Turquoise (#4ECDC4)
- Épaisseur : 8px
- Dégradé de couleur
- Flèches de direction

### 4. **Pointillés** ⚫
- Couleur : Rouge-orange (#FF6347)
- Épaisseur : 4px
- Motif : Pointillés [10, 5]

### 5. **Épais** 🟣
- Couleur : Violet (#8A2BE2)
- Épaisseur : 12px
- Flèches de direction

### 6. **Minimaliste** ⚫
- Couleur : Gris foncé (#2F4F4F)
- Épaisseur : 3px
- Style discret et professionnel

### 7. **Arc-en-ciel** 🌈
- Couleurs : Rose (#FF1493) → Bleu (#00CED1)
- Épaisseur : 6px
- Gradient animé
- Flèches de direction

### 8. **Trafic** 🚗
- Couleur : Orange (#FF4500)
- Épaisseur : 7px
- Motif : Pointillés [15, 10]
- Flèches de direction

## ⚙️ Personnalisation Avancée

### Couleurs Dynamiques

Le composant `CustomRoute` supporte maintenant les **couleurs dynamiques** qui changent automatiquement selon différents critères :

#### **1. Couleurs selon le Statut de Livraison**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  deliveryStatus="in_transit"  // Couleur automatique : Or (#FFD700)
  strokeWidth={8}
/>
```

#### **2. Couleurs selon la Priorité**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  deliveryPriority="high"      // Couleur automatique : Rouge (#FF0000)
  strokeWidth={6}
/>
```

#### **3. Couleurs selon le Type de Livraison**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  deliveryType="express"       // Couleur automatique : Rose (#FF1493)
  strokeWidth={8}
/>
```

#### **4. Couleurs selon la Distance**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  distance={25}                // Couleur automatique : Rouge (longue distance)
  strokeWidth={6}
/>
```

#### **5. Couleurs selon le Niveau de Trafic**
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  trafficLevel="high"          // Couleur automatique : Rouge (trafic élevé)
  strokeWidth={7}
/>
```

#### **Priorité des Couleurs Dynamiques**
1. **Statut de livraison** (priorité maximale)
2. **Priorité de livraison**
3. **Type de livraison**
4. **Distance**
5. **Niveau de trafic**
6. **Couleur personnalisée** (fallback)

### Créer un Style Personnalisé

```tsx
const customStyle: RouteStyle = {
  name: 'Mon Style',
  strokeColor: '#FF1493',
  strokeWidth: 10,
  animated: true,
  gradient: true,
  startColor: '#FF1493',
  endColor: '#00CED1',
  showDirectionArrows: true,
  lineDashPattern: [20, 10, 5, 10], // Motif personnalisé
  description: 'Style personnalisé avec motif complexe'
};
```

### Propriétés Avancées

```tsx
<CustomRoute
  // Propriétés de base
  coordinates={routeCoordinates}
  strokeColor="#FF6B6B"
  strokeWidth={8}
  
  // Animations
  animated={true}
  
  // Gradients
  gradient={true}
  startColor="#FF6B6B"
  endColor="#4ECDC4"
  
  // Direction
  showDirectionArrows={true}
  
  // Motifs
  lineDashPattern={[10, 5]}
  
  // Z-index pour la superposition
  zIndex={1000}
/>
```

## 📱 Exemples d'Utilisation

### Exemple 1 : Itinéraire Simple
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  strokeColor="#007AFF"
  strokeWidth={6}
  animated={false}
  gradient={false}
  showDirectionArrows={false}
/>
```

### Exemple 2 : Itinéraire Animé avec Gradient
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  strokeColor="#FF6B6B"
  strokeWidth={8}
  animated={true}
  gradient={true}
  startColor="#FF6B6B"
  endColor="#4ECDC4"
  showDirectionArrows={true}
/>
```

### Exemple 3 : Itinéraire en Pointillés
```tsx
<CustomRoute
  coordinates={routeCoordinates}
  strokeColor="#FF6347"
  strokeWidth={4}
  animated={false}
  gradient={false}
  showDirectionArrows={false}
  lineDashPattern={[10, 5]}
/>
```

## 🚀 Performance et Optimisations

### Bonnes Pratiques

1. **Évitez les gradients sur de longs itinéraires**
   - Les gradients créent de nombreuses petites polylines
   - Impact sur les performances avec 100+ points

2. **Utilisez l'animation avec modération**
   - L'animation consomme des ressources
   - Désactivez sur les appareils moins puissants

3. **Optimisez le nombre de flèches**
   - Les flèches sont calculées automatiquement
   - Limitées à 1 flèche tous les 10 points

4. **Cache des styles**
   - Les styles prédéfinis sont optimisés
   - Évitez de recréer des styles à chaque rendu

### Détection des Performances

```tsx
// Désactiver les effets avancés sur les appareils moins puissants
const isLowEndDevice = useMemo(() => {
  // Logique de détection de performance
  return devicePerformance < 0.5;
}, []);

<CustomRoute
  coordinates={routeCoordinates}
  animated={!isLowEndDevice}
  gradient={!isLowEndDevice}
  showDirectionArrows={!isLowEndDevice}
  // ... autres propriétés
/>
```

## 🔧 Dépannage

### Problèmes Courants

**1. L'itinéraire ne s'affiche pas**
- Vérifiez que `coordinates` contient au moins 2 points
- Assurez-vous que les coordonnées sont valides

**2. Les couleurs ne s'appliquent pas**
- Vérifiez le format des couleurs (hex, rgb, rgba)
- Assurez-vous que `strokeColor` est défini

**3. L'animation ne fonctionne pas**
- Vérifiez que `animated={true}`
- Assurez-vous que les coordonnées changent

**4. Performance lente**
- Désactivez les gradients sur de longs itinéraires
- Réduisez le nombre de flèches de direction
- Utilisez des styles prédéfinis optimisés

## 📚 Ressources Supplémentaires

- [Documentation React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Guide des Polylines Google Maps](https://developers.google.com/maps/documentation/javascript/shapes#polylines)
- [Exemple de Démonstration](./examples/RouteStylingDemo.tsx)

## 🤝 Contribution

Pour améliorer ces composants :

1. Testez sur différents appareils
2. Optimisez les performances
3. Ajoutez de nouveaux styles prédéfinis
4. Améliorez la documentation

---

**🎉 Maintenant vos itinéraires seront magnifiques et personnalisables !**
