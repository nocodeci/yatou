# Guide de Diagnostic des Notifications Push YATOU

## 🔍 Diagnostic Rapide

### ✅ Checklist de Base

**1. Configuration Technique**
- [ ] Package `expo-notifications` installé
- [ ] Configuration dans `app.json` présente
- [ ] `google-services.json` présent (Android)
- [ ] Project ID EAS configuré
- [ ] Permissions accordées par l'utilisateur

**2. Token Expo Push**
- [ ] Token généré et enregistré
- [ ] Token sauvegardé en base de données
- [ ] Format du token valide (`ExponentPushToken[...]`)

**3. Base de Données**
- [ ] Colonne `expo_push_token` dans tables `users` et `drivers`
- [ ] Tokens non null pour les utilisateurs actifs

## 🧪 Tests de Diagnostic

### Test 1 : Permissions et Token

```typescript
// Dans l'app, exécuter ce code :
const testPermissions = async () => {
  console.log('🔍 Test des permissions...');
  
  // 1. Vérifier les permissions
  const permissions = await Notifications.getPermissionsAsync();
  console.log('Permissions:', permissions.status);
  
  // 2. Générer un token
  const token = await notificationService.registerForPushNotifications();
  console.log('Token:', token ? 'Présent' : 'Absent');
  
  // 3. Vérifier le format
  if (token) {
    const isValid = token.startsWith('ExponentPushToken[') && token.endsWith(']');
    console.log('Format valide:', isValid);
  }
};
```

**Résultats attendus :**
```
🔍 Test des permissions...
Permissions: granted
Token: Présent
Format valide: true
```

### Test 2 : Notification Locale

```typescript
// Tester une notification locale
await notificationService.sendLocalNotification({
  type: 'new_order',
  orderId: 'test_123',
  clientName: 'Test Client',
  pickupAddress: 'Adresse Test',
  deliveryAddress: 'Destination Test',
  estimatedPrice: 1000,
  vehicleType: 'moto'
});
```

**Résultat attendu :** Notification apparaît immédiatement

### Test 3 : API Expo Push

```bash
# Test avec curl
curl -H "Content-Type: application/json" \
     -X POST \
     -d '{
       "to": "VOTRE_TOKEN_ICI",
       "title": "Test YATOU",
       "body": "Test de notification push",
       "sound": "default"
     }' \
     https://exp.host/--/api/v2/push/send
```

**Réponse attendue :**
```json
{
  "data": [
    {
      "status": "ok",
      "id": "notification-id"
    }
  ]
}
```

## 🚨 Problèmes Courants et Solutions

### Problème 1 : "Permission de notification refusée"

**Symptômes :**
```
❌ Permission de notification refusée
Token: Absent
```

**Solutions :**
1. **Redémarrer l'app** complètement
2. **Vérifier les paramètres** de l'appareil :
   - iOS : Réglages > Notifications > YATOU > Autoriser les notifications
   - Android : Paramètres > Apps > YATOU > Notifications
3. **Réinstaller l'app** si nécessaire

### Problème 2 : "Project ID not found"

**Symptômes :**
```
❌ Erreur lors de l'obtention du token: Project ID not found
```

**Solution :**
Vérifier `app.json` :
```json
{
  "extra": {
    "eas": {
      "projectId": "c154c066-2561-48be-bd88-bb131406475f"
    }
  }
}
```

### Problème 3 : Token généré mais pas de notifications

**Diagnostic :**
```sql
-- Vérifier en base de données
SELECT id, email, expo_push_token FROM users WHERE expo_push_token IS NOT NULL;
SELECT id, expo_push_token FROM drivers WHERE expo_push_token IS NOT NULL;
```

**Solutions :**
1. **Vérifier le token** en base de données
2. **Tester l'API Expo** directement (voir Test 3)
3. **Vérifier les logs** de l'API :

```typescript
const result = await fetch('https://exp.host/--/api/v2/push/send', { ... });
console.log('Réponse API:', await result.json());
```

### Problème 4 : Notifications reçues mais pas affichées

**Causes possibles :**
1. **App en premier plan** (certaines notifications ne s'affichent qu'en arrière-plan)
2. **Notification handler** mal configuré
3. **Canal de notification** incorrect (Android)

**Solution :**
Vérifier le handler dans `notificationService.ts` :
```typescript
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

### Problème 5 : "ExponentPushToken is malformed"

**Symptômes :**
```json
{
  "data": [
    {
      "status": "error",
      "message": "ExponentPushToken is malformed"
    }
  ]
}
```

**Solutions :**
1. **Régénérer le token** :
```typescript
await notificationService.registerForPushNotifications();
```

2. **Vérifier le format** :
```typescript
const isValid = token.startsWith('ExponentPushToken[') && token.endsWith(']');
```

## 📱 Tests par Plateforme

### iOS

**Configuration requise :**
1. Apple Developer Account
2. Push Notification Certificate
3. Configuration EAS Build

**Test spécifique :**
```bash
# Vérifier les entitlements
cat ios/YourApp/YourApp.entitlements
```

### Android

**Configuration requise :**
1. Firebase Project
2. `google-services.json` configuré
3. Permissions dans `AndroidManifest.xml`

**Test spécifique :**
```bash
# Vérifier google-services.json
grep "project_id" google-services.json
```

## 🔧 Mode Debug Avancé

### Activer les Logs Détaillés

Dans `notificationService.ts`, ajouter :
```typescript
// En début de fichier
const DEBUG_NOTIFICATIONS = __DEV__;

// Dans chaque méthode
if (DEBUG_NOTIFICATIONS) {
  console.log('🔍 [NotificationService]', 'Détail du debug...');
}
```

### Monitorer en Temps Réel

```typescript
// Ajouter dans AuthProvider ou App.tsx
if (__DEV__) {
  // Logger toutes les notifications reçues
  notificationService.addNotificationReceivedListener((notification) => {
    console.log('📱 [DEBUG] Notification reçue:', {
      title: notification.request.content.title,
      body: notification.request.content.body,
      data: notification.request.content.data,
      trigger: notification.request.trigger,
    });
  });
}
```

## 📊 Métriques de Santé

### Indicateurs à Surveiller

1. **Taux de génération de tokens** : > 95%
2. **Taux de sauvegarde en BDD** : > 95%
3. **Taux de succès API Expo** : > 90%
4. **Temps de réponse API** : < 2s

### Requêtes de Monitoring

```sql
-- Pourcentage d'utilisateurs avec tokens
SELECT 
  COUNT(*) as total_users,
  COUNT(expo_push_token) as users_with_token,
  ROUND(COUNT(expo_push_token) * 100.0 / COUNT(*), 2) as token_percentage
FROM users;

-- Tokens récents (dernières 24h)
SELECT COUNT(*) as recent_tokens
FROM users 
WHERE expo_push_token IS NOT NULL 
  AND updated_at > NOW() - INTERVAL '24 hours';
```

## 🎯 Validation Finale

### Checklist de Production

- [ ] **Test sur appareil réel** (pas simulateur)
- [ ] **Test en arrière-plan** et premier plan
- [ ] **Test avec app fermée**
- [ ] **Vérification des délais** de réception
- [ ] **Test de volume** (plusieurs notifications)
- [ ] **Validation des données** dans les notifications
- [ ] **Test de fallback** en cas d'échec

### Script de Test Automatisé

```typescript
const runFullNotificationTest = async () => {
  console.log('🧪 Démarrage du test complet des notifications...');
  
  const results = {
    permissions: false,
    tokenGeneration: false,
    tokenSaving: false,
    localNotification: false,
    apiTest: false,
  };
  
  try {
    // 1. Test permissions
    const permissions = await Notifications.getPermissionsAsync();
    results.permissions = permissions.status === 'granted';
    
    // 2. Test génération token
    const token = await notificationService.registerForPushNotifications();
    results.tokenGeneration = !!token;
    
    // 3. Test notification locale
    await notificationService.testNotification();
    results.localNotification = true;
    
    // ... autres tests
    
    console.log('📊 Résultats des tests:', results);
    
    const successRate = Object.values(results).filter(Boolean).length / Object.keys(results).length;
    console.log(`📈 Taux de succès: ${Math.round(successRate * 100)}%`);
    
    return successRate > 0.8; // 80% minimum
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
};
```

## 🆘 Support et Dépannage

### Logs Utiles pour le Support

```typescript
// Collecter les informations de diagnostic
const collectDiagnosticInfo = async () => {
  const info = {
    platform: Platform.OS,
    device: Device.isDevice,
    permissions: await Notifications.getPermissionsAsync(),
    token: notificationService.getExpoPushToken(),
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
    version: Constants.expoConfig?.version,
    timestamp: new Date().toISOString(),
  };
  
  console.log('📋 Informations de diagnostic:', JSON.stringify(info, null, 2));
  return info;
};
```

### Contacts et Ressources

- **Documentation Expo** : https://docs.expo.dev/push-notifications/
- **API Status** : https://status.expo.dev/
- **Firebase Console** : https://console.firebase.google.com/
- **EAS Build** : https://expo.dev/accounts/[account]/projects/[project]/builds

---

**🔔 Les notifications push sont maintenant configurées et prêtes à fonctionner !**

Utilisez ce guide pour diagnostiquer tout problème et valider que votre système fonctionne correctement.