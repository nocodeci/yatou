# Guide de Test APK - YATOU

## 🎯 Objectif

Tester l'application YATOU avec notifications push sur émulateur et appareil physique.

## ⚠️ Points Importants

### Notifications Push et Émulateurs
- **❌ Émulateurs** : Les vraies notifications push ne fonctionnent PAS
- **✅ Appareils physiques** : Seul moyen de tester les vraies notifications push
- **⚙️ Émulateurs** : Parfaits pour tester l'UI et les notifications locales

## 🖥️ Test sur Émulateur Android

### 1. Prérequis
- Android Studio installé
- SDK Android configuré
- Émulateur Android créé (API 29+)

### 2. Lancer l'Émulateur
```bash
# Via Android Studio
# 1. Ouvrir Android Studio
# 2. AVD Manager
# 3. Choisir "Medium Phone" ou Pixel 4
# 4. API Level 29+ (Android 10+)
# 5. Cliquer "Play"

# Via ligne de commande (si configuré)
emulator -avd Pixel_4_API_30
```

### 3. Lancer l'App en Mode Dev
```bash
# Dans le projet YATOU
npm run dev

# Puis dans le terminal Expo :
# Appuyer sur 'a' pour Android
# Ou scanner le QR code avec Expo Go
```

### 4. Tests Possibles sur Émulateur
- ✅ **Interface utilisateur** complète
- ✅ **Navigation** entre écrans
- ✅ **Notifications locales** (via testeur intégré)
- ✅ **Génération de tokens** Expo Push
- ✅ **Sauvegarde en base de données**
- ❌ **Vraies notifications push** (ne marchent pas)

### 5. Tester les Notifications Locales
1. Aller sur `/driver/home`
2. Cliquer sur l'icône 🔔 rouge (mode dev)
3. Dans le testeur : "📱 Nouvelle Commande (Local)"
4. Une notification locale doit apparaître

## 📱 Test sur Appareil Physique

### Option A : Mode Développement (Rapide)
```bash
# Lancer l'app
npm run dev

# Sur votre téléphone :
# 1. Installer Expo Go depuis Play Store
# 2. Scanner le QR code affiché
# 3. L'app se lance directement
```

**Avantages :**
- ✅ Rapide à tester
- ✅ Rechargement à chaud
- ✅ Vraies notifications push fonctionnelles
- ✅ Debugging facile

### Option B : APK de Production (Recommandé pour Tests Finaux)

#### 1. Builder l'APK
```bash
# Build preview (plus rapide)
npx eas build --platform android --profile preview

# Ou build production
npx eas build --platform android --profile production
```

#### 2. Télécharger l'APK
- EAS Build vous donnera un lien
- Télécharger sur votre téléphone
- Autoriser l'installation depuis "Sources inconnues"

#### 3. Installer et Tester
1. **Installer l'APK** sur Android
2. **Ouvrir l'app** → Accepter les permissions
3. **Tester les notifications** complètement

## 🧪 Tests de Validation

### Test 1 : Permissions et Tokens
```
✅ Vérifier dans les logs :
📱 Génération du token Expo Push...
✅ Token de notification généré: ExponentPushToken[...]
💾 Sauvegarde du token pour le livreur: driver_id
```

### Test 2 : Notifications Locales
```
✅ Via le testeur intégré :
🔔 Cliquer sur l'icône rouge
📱 "Nouvelle Commande (Local)"
✅ Notification doit apparaître immédiatement
```

### Test 3 : Notifications Push Réelles (Appareil Physique Uniquement)
```
✅ Scénario complet :
1. Client crée commande
2. Livreur reçoit notification push
3. Livreur accepte via notification
4. Client reçoit notification d'acceptation
5. Vérifier que vraies données sont utilisées
```

### Test 4 : Base de Données
```sql
-- Vérifier les tokens en BDD
SELECT id, expo_push_token FROM users WHERE expo_push_token IS NOT NULL;
SELECT id, expo_push_token FROM drivers WHERE expo_push_token IS NOT NULL;
```

## 📊 Résultats Attendus

### Sur Émulateur
```
✅ Interface fonctionne
✅ Navigation OK
✅ Tokens générés : ExponentPushToken[development-simulator-token]
✅ Notifications locales OK
❌ Notifications push réelles ne marchent pas (normal)
```

### Sur Appareil Physique
```
✅ Interface fonctionne
✅ Navigation OK  
✅ Tokens générés : ExponentPushToken[vraitoken123...]
✅ Notifications locales OK
✅ Notifications push réelles OK
✅ Vraies données utilisées (pas données par défaut)
```

## 🔍 Debugging

### Logs à Surveiller
```bash
# Mode dev
npm run dev
# Puis regarder les logs dans le terminal

# Logs importants :
🔔 Configuration des notifications push...
✅ Token Expo généré: ExponentPushToken[...]
📱 Utilisation des données de notification pour commande order_xxx
✅ Livraison créée avec données de notification: delivery_id
```

### En Cas de Problème

#### Émulateur
```bash
# Redémarrer l'émulateur
# Vider le cache Expo
npx expo start --clear

# Vérifier les permissions dans les paramètres Android
```

#### Appareil Physique
```bash
# Vérifier la connexion réseau
# Accepter toutes les permissions
# Redémarrer l'app si nécessaire
```

## 🎯 Validation Finale

### Checklist Émulateur
- [ ] App se lance sans crash
- [ ] Navigation fluide
- [ ] Notifications locales fonctionnent
- [ ] Tokens générés (format development)
- [ ] Interface responsive

### Checklist Appareil Physique
- [ ] App se lance sans crash
- [ ] Permissions accordées automatiquement
- [ ] Tokens Expo Push réels générés
- [ ] Notifications push reçues
- [ ] Vraies données utilisées dans livraisons
- [ ] Client notifié des acceptations

## 🚀 Commandes Rapides

```bash
# Lancer en dev sur émulateur
npm run dev
# Puis 'a' pour Android

# Builder APK preview
npx eas build --platform android --profile preview

# Builder APK production
npx eas build --platform android --profile production

# Valider configuration
node scripts/validate-notifications.js

# Voir les logs détaillés
npx expo start --dev-client
```

## 📞 Support

### Si ça ne marche pas :
1. **Vérifier** `NOTIFICATION_PUSH_DIAGNOSTIC.md`
2. **Utiliser** le testeur intégré (🔔)
3. **Vérifier** les logs dans la console
4. **Tester** sur appareil physique si émulateur pose problème

---

**💡 Rappel : Pour tester complètement les notifications push, utilisez un appareil physique Android !**