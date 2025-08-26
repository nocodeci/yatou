# 🚚 **Application Livreur YATOU**

Application mobile React Native complète pour les livreurs de la plateforme YATOU, avec carte GPS directionnelle et gestion complète des livraisons.

## ✨ **Fonctionnalités Principales**

### 🗺️ **Carte GPS Directionnelle**
- **Carte Google Maps** intégrée avec localisation en temps réel
- **Navigation GPS** vers points de collecte et de livraison
- **Itinéraires visuels** avec instructions étape par étape
- **Marqueurs interactifs** pour tous les points d'intérêt

### 📱 **Interface Complète**
- **4 écrans principaux** avec navigation par onglets
- **Design moderne** avec gradients et animations fluides
- **Responsive** et adaptatif à tous les écrans
- **Thème cohérent** avec la charte graphique YATOU

### 🚀 **Gestion des Livraisons**
- **Acceptation des commandes** avec statuts en temps réel
- **Suivi complet** du cycle de livraison
- **Notifications** et alertes interactives
- **Historique détaillé** des livraisons

## 🎯 **Écrans Disponibles**

### 1. 🏠 **Accueil (HomeScreen)**
- Statut en ligne/hors ligne avec toggle
- Carte principale avec position du livreur
- Commandes actives avec informations détaillées
- Bouton flottant pour nouvelles commandes

### 2. 📋 **Commandes (OrdersScreen)**
- Liste des commandes avec statuts colorés
- Actions contextuelles selon le statut
- Rafraîchissement avec pull-to-refresh
- Gestion complète du cycle de livraison

### 3. 🧭 **Navigation (NavigationScreen)**
- Navigation GPS vers point de collecte
- Navigation GPS vers point de livraison
- Instructions détaillées étape par étape
- Suivi en temps réel de l'itinéraire

### 4. 👤 **Profil (ProfileScreen)**
- Informations personnelles du livreur
- Statistiques détaillées (livraisons, gains, notes)
- Informations du véhicule avec statut
- Actions rapides et paramètres

## 🛠️ **Technologies Utilisées**

### **Frontend**
- **React Native** - Framework mobile cross-platform
- **TypeScript** - Sécurité des types et meilleure DX
- **Expo** - Outils et services pour React Native

### **Navigation & Maps**
- **@react-navigation** - Navigation entre écrans
- **react-native-maps** - Intégration Google Maps
- **expo-location** - Services de localisation

### **UI/UX**
- **expo-linear-gradient** - Gradients et effets visuels
- **@expo/vector-icons** - Icônes Ionicons
- **StyleSheet** - Styles optimisés et responsive

## 📱 **Installation et Configuration**

### **Prérequis**
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Compte Expo
- Compte Google Cloud (pour Google Maps API)

### **Installation**
```bash
# Cloner le dépôt
git clone [URL_DU_REPO]
cd driver-app

# Installer les dépendances
npm install

# Démarrer l'application
npx expo start
```

### **Configuration Google Maps**
1. Créer un projet Google Cloud
2. Activer l'API Google Maps
3. Créer une clé API
4. Configurer les restrictions de sécurité

### **Variables d'Environnement**
Créer un fichier `.env` à la racine :
```env
GOOGLE_MAPS_API_KEY=votre_cle_api_google_maps
```

## 🚀 **Utilisation**

### **Démarrage Rapide**
1. **Se connecter** avec le bouton "Se connecter"
2. **Accepter une commande** depuis l'écran d'accueil
3. **Utiliser la navigation** pour aller au point de collecte
4. **Confirmer la collecte** et commencer la livraison
5. **Suivre l'itinéraire** vers le point de livraison
6. **Confirmer la livraison** et terminer la commande

### **Fonctionnalités Clés**
- **Statut en ligne** : Disponible pour les nouvelles commandes
- **Navigation GPS** : Instructions détaillées et itinéraires
- **Gestion des commandes** : Cycle complet de livraison
- **Statistiques** : Suivi des performances et gains

## 📊 **Architecture du Code**

### **Structure des Dossiers**
```
src/
├── components/          # Composants réutilisables
├── constants/          # Constantes et configuration
├── screens/            # Écrans de l'application
├── types/              # Types TypeScript
└── utils/              # Utilitaires et helpers
```

### **Composants Principaux**
- **App.tsx** : Point d'entrée avec navigation
- **HomeScreen** : Écran principal avec carte
- **OrdersScreen** : Gestion des commandes
- **NavigationScreen** : Navigation GPS
- **ProfileScreen** : Profil du livreur

## 🔧 **Développement**

### **Scripts Disponibles**
```bash
# Démarrer en mode développement
npm start

# Démarrer sur iOS
npm run ios

# Démarrer sur Android
npm run android

# Build pour production
npm run build

# Tests
npm test
```

### **Linting et Formatage**
```bash
# Vérifier le code
npm run lint

# Formater le code
npm run format
```

## 📱 **Compatibilité**

### **Plateformes Supportées**
- ✅ **iOS** (12.0+)
- ✅ **Android** (6.0+)
- ✅ **Web** (Expo Web)

### **Versions Testées**
- React Native : 0.79.1
- Expo SDK : 53.0.0
- TypeScript : 5.0.0

## 🤝 **Contribution**

### **Comment Contribuer**
1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### **Standards de Code**
- Utiliser TypeScript strict
- Suivre les conventions ESLint
- Ajouter des tests pour les nouvelles fonctionnalités
- Documenter le code avec JSDoc

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 **Support**

### **Contact**
- **Email** : support@yatou.com
- **Documentation** : [docs.yatou.com](https://docs.yatou.com)
- **Issues** : [GitHub Issues](https://github.com/yatou/driver-app/issues)

### **Communauté**
- **Discord** : [YATOU Community](https://discord.gg/yatou)
- **Forum** : [community.yatou.com](https://community.yatou.com)

---

## 🎯 **Roadmap**

### **Version 1.1** (Q2 2024)
- [ ] Notifications push en temps réel
- [ ] Mode hors ligne avec synchronisation
- [ ] Intégration paiement mobile
- [ ] Support multi-langues

### **Version 1.2** (Q3 2024)
- [ ] Mode nuit/économie de batterie
- [ ] Statistiques avancées et rapports
- [ ] Intégration avec systèmes externes
- [ ] Support des tablettes

### **Version 2.0** (Q4 2024)
- [ ] Intelligence artificielle pour l'optimisation des routes
- [ ] Support des véhicules électriques
- [ ] Intégration IoT et capteurs
- [ ] API publique pour développeurs

---

**Développé avec ❤️ par l'équipe YATOU**
