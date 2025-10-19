# Guide de Test - Solution Notifications Push

## 🎯 Objectif du Test

Vérifier que les livreurs peuvent accepter des commandes expirées en utilisant les vraies données des notifications push, et que les clients sont correctement notifiés.

## ⚙️ Pré-requis

1. **Application livreur** installée et connectée
2. **Application client** installée et connectée
3. **Base de données** Supabase configurée
4. **Notifications push** activées sur les deux appareils
5. **Logs** accessibles (via console ou Flipper)

## 📋 Scénarios de Test

### Test 1 : Commande Normale (Baseline)

**Objectif :** Vérifier que le flux normal fonctionne toujours

**Étapes :**
1. **Client** : Créer une nouvelle commande
2. **Système** : Observer l'envoi de notification au livreur
3. **Livreur** : Accepter la commande dans les 30 secondes
4. **Client** : Vérifier la réception de la notification d'acceptation

**Résultats attendus :**
```
📱 Nouvelle commande reçue: order_xxx
✅ Livreur_ID a accepté la commande order_xxx
📱 Notification push envoyée au client: client_ID
✅ Commande créée avec vraies données: delivery_id
```

### Test 2 : Commande Expirée avec Données de Notification (Principal)

**Objectif :** Vérifier que la solution fonctionne pour les commandes expirées

**Étapes :**
1. **Client** : Créer une commande avec vraies adresses
   ```
   Départ: Collège Privé Tesla, Bouaké, Côte d'Ivoire
   Arrivée: Coopec Bouaké, Bouaké, Côte d'Ivoire
   Prix: 700 FCFA
   Véhicule: moto
   ```

2. **Système** : Laisser la commande expirer (attendre 35+ secondes)

3. **Livreur** : Accepter la notification après expiration

4. **Observer les logs** côté livreur :
   ```
   ⚠️ Commande order_xxx non trouvée dans activeRequests (peut-être expirée)
   📱 Livreur driver_id accepte une commande expirée - traitement direct
   📦 Création d'une livraison pour commande expirée: order_xxx
   📱 Utilisation des données de notification pour commande order_xxx
   ✅ Livraison créée avec données de notification: delivery_id
   📱 Notification client pour commande expirée acceptée: order_xxx
   ```

5. **Observer les logs** côté client :
   ```
   📱 Client - Notification reçue: order_accepted
   ✅ Commande acceptée - OrderID: order_xxx, DriverID: driver_id
   🔄 Données des livraisons rechargées côté client
   ```

6. **Client** : Vérifier la notification d'acceptation
7. **Client** : Vérifier que la livraison apparaît avec les vraies adresses

**Résultats attendus :**
- ✅ Livraison créée avec vraies adresses (pas "Adresse de départ")
- ✅ Prix correct (700 FCFA, pas 0)
- ✅ Type de véhicule correct (moto)
- ✅ Client notifié de l'acceptation
- ✅ Livraison visible dans l'app client

### Test 3 : Parsing du Body de Notification

**Objectif :** Vérifier que les adresses sont correctement extraites du texte

**Étapes :**
1. Créer une commande avec des adresses complexes
2. Vérifier que le parsing fonctionne avec différents formats :
   ```
   Format 1: "Départ: Adresse A\nArrivée: Adresse B"
   Format 2: "Nouvelle commande...\nDépart: Adresse A\nArrivée: Adresse B\n700 FCFA"
   ```

**Code de test :** Observer dans `parseNotificationBody()`
```typescript
console.log('📍 Adresses extraites - Départ:', pickup, 'Arrivée:', delivery);
```

### Test 4 : Cache de Notifications

**Objectif :** Vérifier que le cache temporaire fonctionne

**Étapes :**
1. Recevoir une notification
2. Attendre quelques minutes avant d'accepter
3. Vérifier que les données sont toujours disponibles

**Code de vérification :**
```typescript
console.log('🗃️ Données du cache:', notificationDataCache.get(orderId));
```

### Test 5 : Fallback vers Données Par Défaut

**Objectif :** Vérifier que le système fonctionne même sans données de notification

**Étapes :**
1. Simuler une notification sans données complètes
2. Accepter la commande
3. Vérifier que des données par défaut sont utilisées

**Résultats attendus :**
```
⚠️ Commande order_xxx non trouvée dans activeRequests - utilisation de données par défaut
✅ Livraison créée avec données par défaut: delivery_id
```

## 🔍 Points de Vérification

### Côté Livreur

**Interface :**
- [ ] Alert "NOUVELLE COMMANDE !" s'affiche
- [ ] Boutons "Accepter" / "Refuser" fonctionnent
- [ ] Redirection vers `/driver/orders` après acceptation
- [ ] Message "Commande acceptée !" s'affiche

**Logs à surveiller :**
```
📱 Nouvelle commande reçue: order_xxx
📦 Création d'une livraison pour commande expirée: order_xxx
📱 Utilisation des données de notification pour commande order_xxx
✅ Livraison créée avec données de notification: delivery_id
📱 Notification client pour commande expirée acceptée: order_xxx
```

### Côté Client

**Interface :**
- [ ] Notification push reçue : "✅ Commande acceptée"
- [ ] Alert "Commande acceptée !" s'affiche
- [ ] Bouton "Voir ma commande" fonctionne
- [ ] Livraison visible dans l'onglet "Livraisons"
- [ ] Vraies adresses affichées (pas "Adresse de départ")

**Logs à surveiller :**
```
📱 Client - Notification reçue: order_accepted
✅ Commande acceptée - OrderID: order_xxx, DriverID: driver_id
🔄 Données des livraisons rechargées côté client
```

### Base de Données

**Table `deliveries` :**
- [ ] Nouvelle entrée créée
- [ ] `pickup_address` = vraie adresse (pas "Adresse de départ")
- [ ] `delivery_address` = vraie adresse (pas "Adresse d'arrivée")  
- [ ] `estimated_price` = prix correct (pas 0)
- [ ] `status` = 'accepted'
- [ ] `driver_id` = ID du livreur

## 🚨 Problèmes Potentiels et Solutions

### Problème 1 : Pas de notification côté client
**Symptôme :** Client ne reçoit pas la notification d'acceptation
**Vérification :** 
```sql
SELECT expo_push_token FROM users WHERE id = 'client_id';
```
**Solution :** Vérifier que le token Expo est enregistré

### Problème 2 : Données par défaut utilisées
**Symptôme :** Livraison créée avec "Adresse de départ"
**Causes possibles :**
- Données de notification manquantes
- Parsing du body échoué
- Cache expiré

**Debug :**
```
console.log('🔍 Données de notification reçues:', notificationData);
console.log('📍 Adresses parsées:', addresses);
```

### Problème 3 : Timeout des commandes
**Symptôme :** Toutes les commandes expirent rapidement
**Solution :** Augmenter le timeout dans `driverRequestService.ts`
```typescript
const REQUEST_TIMEOUT = 120; // 2 minutes au lieu de 30 secondes
```

### Problème 4 : Duplicate notifications
**Symptôme :** Plusieurs notifications pour la même commande
**Solution :** Vérifier le cache `processedNotifications`

## 📊 Métriques de Succès

**Avant la correction :**
- Données par défaut : ~80%
- Vraies données : ~20%

**Après la correction (objectif) :**
- Données par défaut : <10%
- Vraies données : >90%

**KPIs à mesurer :**
```typescript
const metrics = {
  commandes_normales_reussies: 0,
  commandes_expirees_avec_vraies_donnees: 0,
  commandes_expirees_avec_donnees_defaut: 0,
  clients_notifies_correctement: 0,
  parsing_adresses_reussi: 0,
};
```

## ✅ Checklist de Validation

- [ ] **Test 1** : Commande normale fonctionne
- [ ] **Test 2** : Commande expirée utilise vraies données de notification
- [ ] **Test 3** : Parsing des adresses fonctionne
- [ ] **Test 4** : Cache de notifications fonctionne
- [ ] **Test 5** : Fallback par défaut fonctionne
- [ ] **UI Livreur** : Interface réactive et intuitive
- [ ] **UI Client** : Notifications reçues et livraisons visibles
- [ ] **Base de Données** : Données correctes enregistrées
- [ ] **Logs** : Tous les logs attendus présents
- [ ] **Performance** : Pas de ralentissement notable

## 🎉 Critères de Réussite

La solution est considérée comme **réussie** si :

1. **Fonctionnalité principale** : Les commandes expirées utilisent les vraies données des notifications (>90% des cas)
2. **Expérience utilisateur** : Les clients sont notifiés quand leur commande est acceptée
3. **Robustesse** : Le système fonctionne même en cas de données manquantes
4. **Traçabilité** : Tous les événements sont loggés correctement
5. **Performance** : Aucune régression sur les performances

---

**Note :** Ce guide doit être exécuté dans un environnement de test avant le déploiement en production.