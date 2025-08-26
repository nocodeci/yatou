# Configuration Google Maps pour l'application

## 🗺️ Intégration de la carte Google Maps

Cette application utilise Google Maps pour afficher des cartes interactives et calculer des itinéraires. Voici comment configurer et utiliser cette fonctionnalité.

## 📋 Prérequis

1. **Compte Google Cloud** : Créez un compte sur [Google Cloud Console](https://console.cloud.google.com/)
2. **Clé API** : Obtenez votre clé API Google Maps depuis la console Google Cloud
3. **APIs activées** : Activez les APIs Directions et Maps

## 🔧 Configuration

### 1. Obtenir votre clé API Google Maps

1. Allez sur [https://console.cloud.google.com/](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - Directions API
   - Maps JavaScript API
   - Geocoding API
4. Créez des identifiants (clé API)
5. Remplacez la valeur dans `app/constants/google-maps.ts` :

```typescript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: "VOTRE_CLE_API_ICI",
  // ...
}
```

### 2. Configuration de la carte

La configuration se trouve dans `app/constants/google-maps.ts` :

```typescript
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: "votre_clé_api",
  DEFAULT_CENTER: {
    latitude: 5.3600,  // Abidjan
    longitude: -4.0083,
  },
  DEFAULT_ZOOM: 12,
  DEFAULT_REGION: 'ci',  // Côte d'Ivoire
  DEFAULT_LANGUAGE: 'fr',
  DEFAULT_UNITS: 'metric',
};
```

## 🚀 Utilisation

### Affichage de la carte

```typescript
import MapView from 'react-native-maps';

<MapView
  provider={PROVIDER_GOOGLE}
  style={styles.map}
  initialRegion={{
    latitude: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.latitude,
    longitude: GOOGLE_MAPS_CONFIG.DEFAULT_CENTER.longitude,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
/>
```

### Calcul d'itinéraire

```typescript
const calculateRoute = async (origin: [number, number], destination: [number, number]) => {
  const apiKey = GOOGLE_MAPS_CONFIG.API_KEY;
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin[1]},${origin[0]}&destination=${destination[1]},${destination[0]}&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status === 'OK') {
    // Traiter l'itinéraire
  }
};
```

## 🔒 Sécurité

- **Restriction de domaine** : Configurez les restrictions de domaine dans Google Cloud Console
- **Restriction d'API** : Limitez l'accès aux APIs nécessaires uniquement
- **Quotas** : Surveillez l'utilisation de votre quota d'API

## 🐛 Dépannage

### Erreurs courantes

1. **"ZERO_RESULTS"** : Les coordonnées sont trop proches ou invalides
2. **"REQUEST_DENIED"** : Clé API invalide ou restrictions activées
3. **"OVER_QUERY_LIMIT"** : Quota d'API dépassé

### Solutions

1. Vérifiez votre clé API
2. Assurez-vous que les APIs sont activées
3. Vérifiez les restrictions de domaine
4. Utilisez des coordonnées valides et suffisamment éloignées

## 📚 Ressources

- [Documentation Google Maps API](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

## ⚖️ Conditions d'utilisation

Google Maps est soumis aux conditions d'utilisation de Google. Consultez [https://developers.google.com/maps/terms](https://developers.google.com/maps/terms) pour plus d'informations.
