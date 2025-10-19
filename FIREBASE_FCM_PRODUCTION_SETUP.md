# 🚀 Configuration Firebase FCM pour Production - YATOU

## 🎯 Vue d'ensemble

Ce guide vous explique comment configurer Firebase Cloud Messaging (FCM) pour votre app YATOU en production. Firebase FCM est plus robuste qu'Expo Push pour la production et offre plus de fonctionnalités avancées.

## 🔧 Configuration Firebase Console

### Étape 1: Créer/Vérifier le projet Firebase

1. **Aller sur Firebase Console** : https://console.firebase.google.com/
2. **Sélectionner le projet** : `yatou-91baa` (déjà créé)
3. **Vérifier la configuration Android** :
   - Package ID: `com.yohan.yatou` ✅
   - App configurée ✅

### Étape 2: Activer Cloud Messaging

1. Dans Firebase Console, aller à **"Cloud Messaging"**
2. Vérifier que le service est activé
3. Noter les clés du serveur (sera automatique)

### Étape 3: Créer une clé de service (Critique)

**ATTENTION : Cette étape est OBLIGATOIRE pour que le backend fonctionne**

1. Aller dans **"Paramètres du projet"** ⚙️
2. Onglet **"Comptes de service"**
3. Cliquer **"Générer une nouvelle clé privée"**
4. Choisir **"Node.js"**
5. Télécharger le fichier JSON
6. **RENOMMER** le fichier en `firebase-service-account.json`

## 📱 Configuration Backend

### Étape 1: Variables d'environnement

Créer un fichier `.env` dans `yatou/backend/` avec :

```env
# Configuration existante...
PORT=3001
NODE_ENV=production
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# Configuration Firebase FCM (NOUVEAU)
FIREBASE_PROJECT_ID=yatou-91baa
FIREBASE_PRIVATE_KEY_ID=1234567890abcdef
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@yatou-91baa.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789012345678901
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40yatou-91baa.iam.gserviceaccount.com
```

### Étape 2: Extraire les données du fichier service-account

**Depuis le fichier `firebase-service-account.json` téléchargé :**

```json
{
  "type": "service_account",
  "project_id": "yatou-91baa", // → FIREBASE_PROJECT_ID
  "private_key_id": "abc123", // → FIREBASE_PRIVATE_KEY_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...", // → FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxx@yatou-91baa.iam.gserviceaccount.com", // → FIREBASE_CLIENT_EMAIL
  "client_id": "123456789", // → FIREBASE_CLIENT_ID
  "client_x509_cert_url": "https://..." // → FIREBASE_CLIENT_CERT_URL
}
```

### Étape 3: Démarrer le backend

```bash
cd backend
npm install
npm start
```

**Vérifier les logs :**
```
✅ Firebase Admin SDK initialisé avec succès
🎯 Projet: yatou-91baa
🚀 Serveur Yatou Delivery démarré sur le port 3001
```

## 📲 Configuration App Mobile

### Étape 1: Vérifier app.json

```json
{
  "expo": {
    "android": {
      "package": "com.yohan.yatou",
      "googleServicesFile": "./google-services.json",
      "useNextNotificationsApi": true
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/images/icon.png",
          "color": "#DC2626"
        }
      ]
    ]
  }
}
```

### Étape 2: Mise à jour du service de notifications

Le code a déjà été mis à jour pour supporter FCM ! ✅

## 🗄️ Configuration Base de Données

### Ajouter la colonne fcm_token

```sql
-- Pour les utilisateurs (clients)
ALTER TABLE users ADD COLUMN fcm_token TEXT;

-- Pour les livreurs
ALTER TABLE drivers ADD COLUMN fcm_token TEXT;

-- Vérifier
SELECT id, name, fcm_token FROM users WHERE fcm_token IS NOT NULL;
SELECT id, users.name, fcm_token FROM drivers 
JOIN users ON drivers.user_id = users.id 
WHERE fcm_token IS NOT NULL;
```

## 🚀 Test de la Configuration

### 1. Test Backend

```bash
# Vérifier le statut FCM
curl -X GET http://localhost:3001/api/notifications/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "fcm": {
      "enabled": true,
      "projectId": "yatou-91baa",
      "status": "active"
    }
  }
}
```

### 2. Test App Mobile

```bash
# Construire l'APK avec EAS
npx eas build --platform android --profile preview

# Ou utiliser Expo Go pour test rapide
npm run dev
```

### 3. Test End-to-End

1. **Installer l'APK** sur un appareil physique
2. **Se connecter** comme livreur
3. **Créer une commande** depuis l'app client
4. **Vérifier** que le livreur reçoit la notification

## 📊 Monitoring et Logs

### Logs Backend à surveiller

```bash
# Démarrage
✅ Firebase Admin SDK initialisé avec succès
🎯 Projet: yatou-91baa

# Notifications envoyées
📱 Envoi notification nouvelle commande aux livreurs...
✅ Notification FCM envoyée: projects/yatou-91baa/messages/xxx

# Erreurs possibles
❌ Variables Firebase manquantes: FIREBASE_PRIVATE_KEY
⚠️ Firebase FCM désactivé - utilisez les tokens Expo Push en fallback
```

### Logs App Mobile

```bash
# Token généré
✅ Token FCM généré: fcm_1234567890_abcdef
📡 Enregistrement token client avec le backend...
✅ Token enregistré avec le backend

# Notification reçue
🔔 Handler de notification appelé: Nouvelle Commande YATOU
```

## 🛠️ Dépannage

### Problème 1: Firebase non initialisé

**Erreur :**
```
❌ Variables Firebase manquantes: FIREBASE_PRIVATE_KEY
```

**Solution :**
1. Vérifier le fichier `.env`
2. S'assurer que `FIREBASE_PRIVATE_KEY` contient `\n` littéraux
3. Redémarrer le serveur

### Problème 2: Token non enregistré

**Erreur :**
```
❌ Erreur enregistrement backend: 401 Unauthorized
```

**Solution :**
1. Vérifier que l'utilisateur est connecté
2. Vérifier le token d'authentification
3. Tester `/api/notifications/status`

### Problème 3: Notification non reçue

**Vérifications :**
1. Token FCM présent en base de données
2. Appareil physique (pas simulateur)
3. Permissions notifications activées
4. App pas en arrière-plan tuée

## ✅ Checklist Production

### Backend ✅
- [ ] Firebase Admin SDK installé
- [ ] Variables d'environnement configurées
- [ ] Service Firebase initialisé
- [ ] Routes notifications actives
- [ ] Logs de démarrage OK

### App Mobile ✅
- [ ] google-services.json à jour
- [ ] Plugin expo-notifications configuré
- [ ] Service notifications mis à jour
- [ ] APK construit avec EAS

### Base de Données ✅
- [ ] Colonne fcm_token ajoutée (users)
- [ ] Colonne fcm_token ajoutée (drivers)
- [ ] Tokens sauvegardés correctement

### Tests ✅
- [ ] Test /api/notifications/status
- [ ] Test enregistrement token
- [ ] Test notification end-to-end
- [ ] Test sur appareil physique

## 🎯 Avantages de FCM vs Expo Push

### Firebase FCM ✅
- **Production-ready** avec garanties Google
- **Scalabilité** illimitée
- **Analytics** avancées
- **Ciblage** sophistiqué
- **Indépendant** d'Expo

### Expo Push (Fallback) ✅
- **Simple** à implémenter
- **Bien intégré** avec Expo
- **Limite** à 100 notifications/jour (gratuit)

## 🚀 Résultat Final

Une fois configuré correctement :

✅ **Vraies notifications push Firebase**  
✅ **Notifications livreurs instantanées**  
✅ **Notifications clients mises à jour statut**  
✅ **Son et vibration personnalisés**  
✅ **Fonctionne même app fermée**  
✅ **Scalable en production**  

---

## 📞 Support

Si problèmes :
1. Vérifier les logs backend et mobile
2. Tester avec `/api/notifications/test`
3. Valider la configuration Firebase Console
4. S'assurer que l'appareil est physique

**🎉 Votre app YATOU est maintenant prête pour la production avec Firebase FCM !**