# 📱 Guide de Construction de l'APK pour les Tests de Notifications Push

## 🎯 Objectif
Construire un APK de l'application YATOU pour tester les vraies notifications push sur un appareil physique.

## 🚀 Méthode 1: Dashboard EAS (Recommandée)

### **Étape 1: Accéder au Dashboard**
1. Allez sur https://expo.dev/accounts/mrcross/projects/yatou-delivery
2. Connectez-vous avec votre compte Expo (mrcross)

### **Étape 2: Lancer la Construction**
1. Cliquez sur **"Builds"** dans le menu de gauche
2. Cliquez sur **"New Build"**
3. Sélectionnez :
   - **Platform**: Android
   - **Profile**: Preview
4. Cliquez sur **"Build"**

### **Étape 3: Attendre la Construction**
- La construction prendra 5-10 minutes
- Vous verrez le statut en temps réel
- Un email sera envoyé à la fin

### **Étape 4: Télécharger l'APK**
1. Une fois terminé, cliquez sur le build
2. Téléchargez l'APK
3. Transférez-le sur votre téléphone Android

## 🔧 Méthode 2: Ligne de Commande

### **Prérequis**
- Credentials Android configurés
- Keystore généré

### **Commande**
```bash
eas build --platform android --profile preview
```

### **Si demande de keystore**
- Répondez "y" pour générer automatiquement
- Le build commencera automatiquement

## 📱 Installation et Test

### **Étape 1: Installation**
1. Transférez l'APK sur votre téléphone
2. Activez "Sources inconnues" dans les paramètres
3. Installez l'APK

### **Étape 2: Test des Notifications**
1. Ouvrez l'application YATOU
2. Créez un compte ou connectez-vous
3. Sélectionnez "Livreur" lors de l'inscription
4. Le token Expo Push sera automatiquement enregistré

### **Étape 3: Vérification**
1. Vérifiez les logs de l'application
2. Le token Expo Push sera affiché
3. Il sera sauvegardé en base de données

## 🎯 Test des Notifications Push

### **Côté Client**
1. Ouvrez l'application sur un autre appareil
2. Sélectionnez un véhicule
3. Cliquez "Commander maintenant"
4. Le système recherchera des livreurs

### **Côté Livreur**
1. Le livreur recevra une **vraie notification push**
2. Avec **son urgent** et **vibration**
3. Même si l'app est fermée
4. Options "Accepter" ou "Refuser"

## 🔍 Vérification en Base de Données

### **Requête SQL**
```sql
SELECT 
    drivers.id, 
    users.name, 
    drivers.expo_push_token 
FROM drivers 
JOIN users ON drivers.user_id = users.id
WHERE drivers.expo_push_token IS NOT NULL;
```

### **Résultat Attendu**
- Token Expo Push enregistré
- Format: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`

## 🚨 Dépannage

### **Problème: APK ne s'installe pas**
**Solution:**
- Vérifiez que "Sources inconnues" est activé
- Redémarrez le téléphone
- Réessayez l'installation

### **Problème: Notifications ne fonctionnent pas**
**Solution:**
- Vérifiez les permissions de notification
- Vérifiez la connexion internet
- Redémarrez l'application

### **Problème: Token non enregistré**
**Solution:**
- Vérifiez les logs de l'application
- Vérifiez la connexion à la base de données
- Redémarrez l'application

## 📊 État Actuel

### ✅ Configuré
- Projet EAS: `@mrcross/yatou-delivery`
- ID du projet: `dcf8c04d-b893-4953-9061-1615bd2d8c58`
- Configuration `eas.json`
- Plugin `expo-notifications`
- Service de notifications

### 🔄 En Cours
- Construction de l'APK
- Configuration des credentials

### ⏳ Prochaines Étapes
1. Construire l'APK via le dashboard EAS
2. Télécharger et installer sur appareil physique
3. Tester les vraies notifications push
4. Valider le fonctionnement complet

## 🎉 Résultat Attendu

Quand tout fonctionne :
- ✅ **APK installé** sur appareil physique
- ✅ **Vraies notifications push** avec son urgent
- ✅ **Vibration** et alertes visuelles
- ✅ **Affichage même si l'app est fermée**
- ✅ **Tokens automatiquement enregistrés**
- ✅ **Expérience utilisateur réelle**

## 📞 Support

Si vous rencontrez des problèmes :
1. Consultez les logs de l'application
2. Vérifiez la base de données
3. Testez avec Expo Go en fallback
4. Consultez la documentation Expo

---

**Note:** Les vraies notifications push nécessitent un appareil physique. Les simulateurs ne supportent pas les notifications push Expo.
