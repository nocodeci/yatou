# Guide de Test - YATOU

## 🧪 Tests à effectuer

### 1. Configuration Supabase

#### ✅ Vérifications préliminaires
- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées
- [ ] Tables créées dans la base de données
- [ ] Politiques RLS configurées

#### ✅ Test de connexion
```bash
# Vérifier que l'application démarre sans erreur
npx expo start
```

### 2. Tests d'authentification

#### ✅ Inscription Client
1. Ouvrir l'application
2. Cliquer sur "Créer un compte"
3. Sélectionner "Client"
4. Remplir les informations :
   - Prénom : Test
   - Nom : Client
   - Email : test.client@yatou.com
   - Téléphone : +225 07 12 34 56 78
   - Mot de passe : test123
   - Confirmer : test123
5. Cliquer sur "Créer mon compte"
6. **Résultat attendu** : Message de succès et redirection vers la connexion

#### ✅ Inscription Livreur
1. Cliquer sur "Créer un compte"
2. Sélectionner "Livreur"
3. Remplir les informations personnelles
4. Remplir les informations véhicule :
   - Type : Moto
   - Numéro de permis : AB123456
   - Immatriculation : AB-123-CD
5. Remplir le mot de passe
6. Cliquer sur "Créer mon compte"
7. **Résultat attendu** : Message de succès et redirection vers la connexion

#### ✅ Connexion Client
1. Sur l'écran de connexion
2. Entrer : test.client@yatou.com / test123
3. Cliquer sur "Se connecter"
4. **Résultat attendu** : Redirection vers l'interface client (tabs)

#### ✅ Connexion Livreur
1. Créer un compte livreur si pas encore fait
2. Se connecter avec les identifiants du livreur
3. **Résultat attendu** : Redirection vers l'interface livreur (/driver/home)

### 3. Tests Interface Client

#### ✅ Navigation
- [ ] Accès à l'écran d'accueil
- [ ] Affichage de la carte
- [ ] Sélection des adresses
- [ ] Affichage du sélecteur de véhicules
- [ ] Calcul des prix en temps réel

#### ✅ Création de commande
1. Sélectionner une adresse de départ
2. Sélectionner une adresse d'arrivée
3. Choisir un véhicule
4. Vérifier le prix calculé
5. **Résultat attendu** : Prix affiché correctement

### 4. Tests Interface Livreur

#### ✅ Écran principal
- [ ] Affichage des statistiques
- [ ] Bouton en ligne/hors ligne fonctionnel
- [ ] Navigation vers les commandes

#### ✅ Gestion des commandes
1. Aller dans "Commandes"
2. Vérifier l'onglet "Disponibles"
3. **Résultat attendu** : Liste des commandes en attente

#### ✅ Acceptation de commande
1. Cliquer sur "Accepter" sur une commande
2. Confirmer l'acceptation
3. **Résultat attendu** : Commande déplacée vers "Actives"

#### ✅ Refus de commande
1. Cliquer sur "Refuser" sur une commande
2. Confirmer le refus
3. **Résultat attendu** : Commande supprimée de la liste

### 5. Tests Base de Données

#### ✅ Vérification des données
1. Aller dans Supabase > Table Editor
2. Vérifier la table `users` :
   - [ ] Utilisateurs créés lors de l'inscription
   - [ ] Rôles correctement assignés
3. Vérifier la table `drivers` :
   - [ ] Entrées créées pour les livreurs
   - [ ] Informations véhicule correctes
4. Vérifier la table `deliveries` :
   - [ ] Commandes créées par les clients
   - [ ] Statuts mis à jour par les livreurs

### 6. Tests de Sécurité

#### ✅ Authentification
- [ ] Impossible d'accéder aux écrans sans connexion
- [ ] Redirection automatique vers la connexion
- [ ] Déconnexion fonctionnelle

#### ✅ Autorisation
- [ ] Clients ne peuvent pas accéder à l'interface livreur
- [ ] Livreurs ne peuvent pas accéder à l'interface client
- [ ] Redirection selon le rôle

### 7. Tests d'Erreur

#### ✅ Gestion des erreurs réseau
- [ ] Message d'erreur si Supabase non accessible
- [ ] Fallback vers des données de simulation
- [ ] Interface reste utilisable

#### ✅ Validation des formulaires
- [ ] Champs obligatoires vérifiés
- [ ] Format email validé
- [ ] Mots de passe correspondent
- [ ] Informations véhicule requises pour livreurs

## 🐛 Dépannage

### Erreur "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### Erreur de connexion Supabase
1. Vérifier les variables d'environnement
2. Vérifier l'URL et la clé API
3. Redémarrer l'application

### Erreur de permissions
1. Vérifier les politiques RLS dans Supabase
2. Vérifier que l'utilisateur est authentifié
3. Vérifier les contraintes de clés étrangères

### Interface ne se charge pas
1. Vérifier les imports des composants
2. Vérifier la configuration des routes
3. Vérifier les erreurs dans la console

## 📊 Métriques de Succès

### ✅ Critères d'acceptation
- [ ] Inscription client fonctionnelle
- [ ] Inscription livreur fonctionnelle
- [ ] Connexion selon le rôle
- [ ] Interface client accessible
- [ ] Interface livreur accessible
- [ ] Gestion des commandes fonctionnelle
- [ ] Données persistées en base
- [ ] Sécurité respectée

### 📈 Performance
- [ ] Temps de chargement < 3 secondes
- [ ] Pas d'erreurs JavaScript
- [ ] Interface responsive
- [ ] Navigation fluide

## 🚀 Prochaines étapes

Une fois tous les tests validés :

1. **Notifications Push** : Intégrer les notifications temps réel
2. **Paiements** : Intégrer Orange Money et Wave
3. **Géolocalisation** : Suivi GPS en temps réel
4. **Optimisations** : Performance et UX
5. **Tests automatisés** : Mise en place de tests unitaires
