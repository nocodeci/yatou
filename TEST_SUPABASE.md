# Test de Configuration Supabase - YATOU

## 🧪 Comment tester que Supabase est bien configuré

### 1. Vérifier la configuration

**Option A : Utiliser le script automatique**
```bash
node scripts/setup-supabase.js
```

**Option B : Configuration manuelle**
1. Créez un fichier `.env.local` à la racine du projet
2. Ajoutez vos clés Supabase :
```env
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anon
```

### 2. Créer les tables dans Supabase

1. Allez dans votre projet Supabase > **SQL Editor**
2. Exécutez le script SQL complet (voir CONFIGURATION_RAPIDE.md)
3. Vérifiez que toutes les tables sont créées

### 3. Tester l'application

1. Redémarrez l'application :
```bash
npx expo start --clear
```

2. **Test d'inscription** :
   - Créez un nouveau compte client
   - Créez un nouveau compte livreur
   - Vérifiez que vous ne voyez plus "(Simulation)" dans les messages

3. **Vérification dans Supabase** :
   - Allez dans **Table Editor** > **users**
   - Vous devriez voir vos utilisateurs créés
   - Allez dans **Table Editor** > **drivers**
   - Vous devriez voir les livreurs créés

### 4. Tests spécifiques

#### ✅ Test Client
1. Inscription avec email : `client@test.com`
2. Vérifier dans la table `users` :
   - `role` = 'customer'
   - `email` = 'client@test.com'
   - `name` = 'Prénom Nom'

#### ✅ Test Livreur
1. Inscription avec email : `driver@test.com`
2. Sélectionner "Livreur"
3. Remplir les informations véhicule
4. Vérifier dans la table `users` :
   - `role` = 'driver'
5. Vérifier dans la table `drivers` :
   - `user_id` correspond à l'ID de l'utilisateur
   - `license_number` et `vehicle_info` sont remplis

### 5. Messages de succès

**Si Supabase est configuré :**
- "Votre compte a été créé avec succès !"
- "Connexion réussie"

**Si Supabase n'est pas configuré :**
- "Votre compte a été créé avec succès ! (Mode simulation)"
- "Supabase non configuré, utilisation de la simulation"

### 6. Vérifications dans la console

Ouvrez la console de l'application et vérifiez :

**Si configuré :**
```
Initialisation de l'authentification...
Connexion réussie avec Supabase
```

**Si non configuré :**
```
Supabase non configuré, utilisation de la simulation
Initialisation de l'authentification...
```

### 7. Dépannage

#### ❌ Erreur "Invalid API key"
- Vérifiez que votre clé anon est correcte
- Vérifiez que le fichier `.env.local` est bien créé
- Redémarrez l'application

#### ❌ Erreur "Table doesn't exist"
- Vérifiez que vous avez exécuté le script SQL
- Vérifiez que toutes les tables sont créées

#### ❌ Erreur "Permission denied"
- Vérifiez que RLS est activé
- Vérifiez que les politiques sont créées
- Vérifiez que l'utilisateur est authentifié

#### ❌ Données non sauvegardées
- Vérifiez la console pour les erreurs
- Vérifiez que Supabase est bien configuré
- Vérifiez que les tables existent

### 8. Validation finale

Une fois que tout fonctionne, vous devriez voir :

1. **Dans l'application** :
   - Inscription/connexion sans message "(Simulation)"
   - Redirection correcte selon le rôle
   - Interface livreur accessible

2. **Dans Supabase** :
   - Utilisateurs dans la table `users`
   - Livreurs dans la table `drivers`
   - Données persistées entre les sessions

3. **Dans la console** :
   - Pas d'erreurs Supabase
   - Messages de succès d'authentification

## 🎉 Félicitations !

Si tous les tests passent, votre application YATOU est maintenant connectée à Supabase et toutes les données sont sauvegardées en base de données !
