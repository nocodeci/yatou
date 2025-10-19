# Guide de Correction des Notifications Push

## Problème Identifié

Les notifications push arrivaient avec toutes les données nécessaires (adresses, prix, type de véhicule), mais le système créait des livraisons avec des données par défaut au lieu d'utiliser les vraies données de la notification.

### Logs d'erreur typiques :
```
⚠️ Commande order_1760763511740_8c1u8knsk non trouvée dans activeRequests (peut-être expirée)
📱 Livreur d6a15ef7-d9dc-4983-9c05-900e4233989f accepte une commande expirée - traitement direct
📦 Création d'une livraison pour commande expirée: order_1760763511740_8c1u8knsk
⚠️ Commande order_1760763511740_8c1u8knsk non trouvée dans activeRequests - utilisation de données par défaut
✅ Utilisateur temporaire créé: 174e19b8-bee2-4d8b-a17b-9d04bd1a5253
✅ Livraison créée avec données par défaut: cf99f204-95d4-46c2-a21b-057dc2f6fb44
```

## Solution Implémentée

### 1. Extraction des données de notification

- **Fichier modifié :** `app/driver/home.tsx`
- **Changement :** Extraction complète des données de la notification (adresses, prix, type de véhicule)
- **Cache temporaire :** Stockage des données pendant 10 minutes pour éviter la perte d'informations

### 2. Transmission des données au service

- **Interface mise à jour :** `DriverResponse` dans `driverRequestService.ts`
- **Nouvelle propriété :** `notificationData` optionnelle contenant toutes les informations

### 3. Utilisation intelligente des données

- **Priorité 1 :** Données de commande active (si trouvée dans `activeRequests`)
- **Priorité 2 :** Données de commande archivée (si trouvée dans `expiredRequests`)
- **Priorité 3 :** Données de notification (extraites du push)
- **Priorité 4 :** Données par défaut (en dernier recours)

### 4. Parsing intelligent du body de notification

- **Méthode ajoutée :** `parseNotificationBody()` dans `driverRequestService.ts`
- **Extraction :** Adresses de départ et d'arrivée depuis le texte de la notification

## Améliorations Clés

### Cache de Notification
```typescript
const [notificationDataCache, setNotificationDataCache] = useState<Map<string, any>>(new Map());
```

### Extraction des Données
```typescript
const notificationData = {
  orderId,
  clientName: notification.request.content.data?.clientName,
  pickupAddress: notification.request.content.data?.pickupAddress,
  deliveryAddress: notification.request.content.data?.deliveryAddress,
  estimatedPrice: notification.request.content.data?.estimatedPrice,
  vehicleType: notification.request.content.data?.vehicleType,
  body: notification.request.content.body,
};
```

### Parsing du Body
```typescript
private parseNotificationBody(body: string | undefined): {
  pickup?: string;
  delivery?: string;
} {
  if (!body) return {};
  
  const lines = body.split('\n');
  let pickup: string | undefined;
  let delivery: string | undefined;

  for (const line of lines) {
    if (line.startsWith('Départ:')) {
      pickup = line.replace('Départ:', '').trim();
    } else if (line.startsWith('Arrivée:')) {
      delivery = line.replace('Arrivée:', '').trim();
    }
  }

  return { pickup, delivery };
}
```

## Tests à Effectuer

### 1. Test de Notification Normale
1. Envoyer une notification push avec toutes les données
2. Le livreur accepte rapidement
3. Vérifier que les vraies données sont utilisées

### 2. Test de Commande Expirée
1. Envoyer une notification push
2. Attendre que la commande expire (30 secondes par défaut)
3. Le livreur accepte après expiration
4. Vérifier que les données de notification sont utilisées au lieu des données par défaut

### 3. Test sans Données de Notification
1. Simuler une notification avec données manquantes
2. Vérifier que le fallback fonctionne correctement

## Logs à Surveiller

### Succès avec données de notification :
```
📱 Utilisation des données de notification pour commande order_xxx
✅ Livraison créée avec données de notification: delivery_id
```

### Succès avec données par défaut (fallback) :
```
⚠️ Commande order_xxx non trouvée dans activeRequests - utilisation de données par défaut
✅ Livraison créée avec données par défaut: delivery_id
```

## Configurations Recommandées

### Timeout de Commande
```typescript
// Dans driverRequestService.ts - ajuster si nécessaire
timeoutSeconds: number = 30  // Peut être augmenté à 60 ou 120 secondes
```

### TTL du Cache de Notification
```typescript
// Dans home.tsx - actuellement 10 minutes
const NOTIFICATION_CACHE_TTL = 10 * 60 * 1000;
```

## Points d'Amélioration Futurs

1. **Géolocalisation des adresses :** Convertir les adresses en coordonnées GPS
2. **Validation des données :** Vérifier la cohérence des données de notification
3. **Retry automatique :** Réessayer en cas d'échec de création de livraison
4. **Analytics :** Tracker le taux de succès des différentes sources de données

## Surveillance

### Métriques à monitorer :
- Pourcentage de livraisons créées avec vraies données vs données par défaut
- Temps moyen de réponse des livreurs
- Taux d'échec de création de livraison

### Alertes à configurer :
- Taux élevé d'utilisation de données par défaut (> 20%)
- Échecs de création de livraison
- Timeouts fréquents de commandes