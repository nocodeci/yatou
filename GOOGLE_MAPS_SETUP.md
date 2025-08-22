# Configuration Google Maps pour Yatou

## ✅ Configuration terminée

### 🔑 Clé API configurée
- **Clé API** : `AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI`
- **Plateformes** : Android et iOS
- **Services** : Maps SDK activé

### 📱 Configuration des plateformes

#### Android
- **Permissions** : ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION
- **Clé API** : Configurée dans app.json
- **Services** : Google Maps SDK for Android

#### iOS
- **Permissions** : NSLocationWhenInUseUsageDescription
- **Clé API** : Configurée dans app.json
- **Services** : Google Maps SDK for iOS

### 🚀 Prochaines étapes

1. **Redémarrer l'application** :
   ```bash
   npx expo start --clear
   ```

2. **Tester sur appareil physique** :
   - Google Maps fonctionne mieux sur appareil réel
   - Géolocalisation plus précise

3. **Vérifier les permissions** :
   - Autoriser la localisation quand demandé
   - Vérifier que la carte se charge correctement

### 🔧 Fonctionnalités disponibles

- ✅ **Carte Google Maps** : Affichage de la carte
- ✅ **Géolocalisation** : Position utilisateur
- ✅ **Marqueurs** : Destination et position
- ✅ **Interactions** : Clics sur la carte
- ✅ **Centrage automatique** : Sur destination

### 📍 Coordonnées par défaut

- **Bouaké, Côte d'Ivoire** :
  - Latitude : 7.6833
  - Longitude : -5.0333

### 🛠️ Dépannage

Si la carte ne se charge pas :
1. Vérifier la connexion internet
2. Redémarrer l'application
3. Vérifier les permissions de localisation
4. Tester sur appareil physique

### 📞 Support

Pour toute question ou problème :
- Vérifier la console pour les erreurs
- Tester sur différents appareils
- Vérifier la validité de la clé API
