# Configuration Mapbox pour l'application

## 🗺️ Intégration de la carte Mapbox

Cette application utilise Mapbox pour afficher des cartes interactives. Voici comment configurer et utiliser cette fonctionnalité.

## 📋 Prérequis

1. **Compte Mapbox** : Créez un compte gratuit sur [Mapbox](https://account.mapbox.com/)
2. **Token d'accès** : Obtenez votre token d'accès public depuis votre dashboard Mapbox

## ⚙️ Configuration

### 1. Obtenir votre token Mapbox

1. Allez sur [https://account.mapbox.com/](https://account.mapbox.com/)
2. Créez un compte gratuit
3. Dans votre dashboard, copiez votre **Public Access Token**
4. Remplacez la valeur dans `app/constants/mapbox.ts` :

```typescript
export const MAPBOX_CONFIG = {
  ACCESS_TOKEN: 'VOTRE_TOKEN_ICI',
  // ... autres configurations
};
```

### 2. Permissions de localisation

L'application demande automatiquement les permissions de localisation pour :
- Afficher votre position sur la carte
- Centrer la carte sur votre emplacement actuel

## 🎯 Utilisation

### Composant MapView

Le composant `MapView` est maintenant intégré dans la page d'accueil et offre :

- **Affichage de la position utilisateur** : Marqueur bleu sur la carte
- **Interaction tactile** : Cliquez sur la carte pour obtenir les coordonnées
- **Géolocalisation automatique** : Centre la carte sur votre position
- **Fallback** : Utilise Paris comme position par défaut si la géolocalisation échoue

### Propriétés du composant

```typescript
<MapView 
  height={200}                    // Hauteur de la carte
  showUserLocation={true}         // Afficher la position utilisateur
  onMapPress={(coordinates) => {  // Callback lors d'un clic
    console.log('Coordonnées:', coordinates);
  }}
/>
```

## 🚀 Fonctionnalités disponibles

### Styles de carte
- **Streets** : Vue routière standard
- **Outdoors** : Vue pour activités extérieures
- **Light** : Vue claire
- **Dark** : Vue sombre
- **Satellite** : Vue satellite
- **Satellite Streets** : Satellite avec rues

### Personnalisation

Vous pouvez modifier les styles dans `app/constants/mapbox.ts` :

```typescript
const map = new mapboxgl.Map({
  style: MAPBOX_CONFIG.STYLES.DARK,  // Changer le style
  zoom: MAPBOX_CONFIG.DETAILED_ZOOM, // Zoom détaillé
});
```

## 🔧 Développement

### Ajouter des marqueurs

```typescript
// Dans le HTML de la carte
new mapboxgl.Marker({
  color: '#FF0000',
  scale: 0.8
})
.setLngLat([longitude, latitude])
.addTo(map);
```

### Gérer les événements

```typescript
map.on('click', function(e) {
  const coordinates = e.lngLat;
  // Votre logique ici
});
```

## 📱 Compatibilité

- ✅ iOS
- ✅ Android
- ✅ Web (via WebView)
- ✅ Expo

## 🆘 Dépannage

### La carte ne s'affiche pas
1. Vérifiez votre token Mapbox
2. Assurez-vous d'avoir une connexion internet
3. Vérifiez les permissions de localisation

### Erreur de géolocalisation
- L'application utilise Paris comme position par défaut
- Vérifiez que la géolocalisation est activée sur votre appareil

### Performance
- La carte utilise WebView pour une meilleure compatibilité
- Le rendu est optimisé pour les appareils mobiles

## 📄 Licence

Mapbox est soumis aux conditions d'utilisation de Mapbox. Consultez [https://www.mapbox.com/legal/terms](https://www.mapbox.com/legal/terms) pour plus d'informations.
