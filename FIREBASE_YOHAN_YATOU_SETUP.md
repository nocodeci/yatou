# Configuration Firebase pour com.yohan.yatou

## 🔥 Étapes de Configuration Firebase

### 1. Accéder à Firebase Console
1. Aller sur https://console.firebase.google.com/
2. Se connecter avec votre compte Google
3. Sélectionner le projet existant `coaching-63f64` ou créer un nouveau projet

### 2. Ajouter une Nouvelle Application Android

#### Option A : Ajouter à un Projet Existant
1. Dans Firebase Console, ouvrir le projet `coaching-63f64`
2. Cliquer sur l'icône ⚙️ (Paramètres du projet)
3. Aller dans l'onglet "Général"
4. Scroller vers "Vos applications"
5. Cliquer sur "Ajouter une application" → Choisir Android
6. Remplir les informations :
   - **Nom du package Android** : `com.yohan.yatou`
   - **Surnom de l'application** : `YATOU`
   - **Certificat de signature SHA-1** : (optionnel pour notifications)

#### Option B : Créer un Nouveau Projet (Recommandé)
1. Cliquer sur "Créer un projet"
2. Nom du projet : `yatou-delivery`
3. Activer Google Analytics (optionnel)
4. Créer le projet
5. Ajouter une application Android avec :
   - **Package** : `com.yohan.yatou`
   - **Nom** : `YATOU`

### 3. Télécharger google-services.json

1. Après création de l'app Android
2. Cliquer sur "Télécharger google-services.json"
3. **IMPORTANT** : Remplacer le fichier existant dans votre projet :
   ```bash
   # Sauvegarder l'ancien (optionnel)
   mv google-services.json google-services.json.backup
   
   # Placer le nouveau fichier
   cp ~/Downloads/google-services.json ./
   ```

### 4. Vérifier le Contenu du Nouveau Fichier

Le nouveau `google-services.json` doit contenir :

```json
{
  "project_info": {
    "project_id": "yatou-delivery",
    "project_number": "123456789"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:123:android:abc",
        "android_client_info": {
          "package_name": "com.yohan.yatou"
        }
      },
      "oauth_client": [...],
      "api_key": [...],
      "services": {
        "appinvite_service": {...}
      }
    }
  ]
}
```

### 5. Activer les Services Nécessaires

Dans Firebase Console :

#### A. Cloud Messaging (Pour Notifications Push)
1. Aller dans "Cloud Messaging"
2. Aucune configuration supplémentaire nécessaire
3. Les clés sont automatiquement configurées

#### B. Authentication (Si utilisé)
1. Aller dans "Authentication"
2. Onglet "Sign-in method"
3. Activer les méthodes souhaitées (Email/Password, Google, etc.)

#### C. Firestore Database (Si utilisé)
1. Aller dans "Firestore Database"
2. Cliquer "Créer une base de données"
3. Choisir les règles de sécurité

### 6. Validation de la Configuration

Après avoir remplacé le fichier, valider :

```bash
# Vérifier que le package correspond
node scripts/validate-notifications.js
```

Vous devriez voir :
```
✅ Package Android configuré: com.yohan.yatou
✅ Package ID cohérent entre app.json et Firebase
📈 Score: 10/10 (100%)
```

### 7. Test de la Configuration

1. **Build de test** :
   ```bash
   npx eas build --platform android --profile preview
   ```

2. **Installer l'APK** sur un appareil

3. **Tester les notifications** dans l'app

## 🔑 Clés Importantes

### Project ID
- **Nouveau** : `yatou-delivery` (recommandé)
- **Ou existant** : `coaching-63f64` (si ajout d'app)

### Package ID
- **App.json** : `com.yohan.yatou` ✅
- **Firebase** : `com.yohan.yatou` ✅

### Expo Push Tokens
- Les tokens existants restent valides
- Nouveaux appareils généreront de nouveaux tokens
- Base de données Supabase inchangée

## 🚨 Points d'Attention

### 1. Certificat SHA-1 (Production)
Pour la production, ajouter le certificat SHA-1 :
```bash
# Générer le certificat pour EAS Build
npx eas credentials --platform android
```

### 2. Migration des Données
Si vous changez de projet Firebase :
- Les tokens push existants restent valides
- Les nouveaux appareils auront de nouveaux tokens
- Aucune migration de données nécessaire

### 3. Build EAS
Aucun changement nécessaire dans `eas.json`, le package ID est pris depuis `app.json`.

## ✅ Checklist Final

- [ ] Nouveau projet Firebase créé ou app ajoutée
- [ ] Package ID `com.yohan.yatou` configuré
- [ ] Nouveau `google-services.json` téléchargé
- [ ] Fichier remplacé dans le projet
- [ ] Validation script passée (10/10)
- [ ] Build EAS lancé
- [ ] Test sur appareil physique

## 🎯 Résultat Attendu

Après cette configuration :
- **Score validation** : 10/10 (100%)
- **Build APK** : Fonctionnel
- **Notifications push** : Opérationnelles
- **Package ID** : Cohérent partout
- **Vraies données** : Préservées dans les notifications

---

**🚀 Votre app YATOU sera prête pour la production avec le package `com.yohan.yatou` !**