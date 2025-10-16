# Dépannage - Tables Supabase

## 🚨 Erreur : "relation 'users' already exists"

Cette erreur signifie que certaines tables existent déjà dans votre base de données Supabase. C'est normal !

## 🔍 **Étape 1 : Vérifier les tables existantes**

1. Allez dans votre projet Supabase > **SQL Editor**
2. Exécutez ce script pour voir quelles tables existent :

```sql
-- Vérifier l'existence de chaque table
SELECT 
  table_name,
  CASE 
    WHEN table_name IN (
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    ) THEN 'EXISTS ✅'
    ELSE 'MISSING ❌'
  END as status
FROM (
  VALUES 
    ('users'),
    ('drivers'),
    ('deliveries'),
    ('payments'),
    ('notifications'),
    ('ratings')
) AS tables_to_check(table_name);
```

## 🔧 **Étape 2 : Créer les tables manquantes**

Si certaines tables manquent, exécutez le script `create-missing-tables.sql` :

1. Copiez le contenu du fichier `scripts/create-missing-tables.sql`
2. Collez-le dans Supabase > **SQL Editor**
3. Exécutez le script

Ce script utilise `CREATE TABLE IF NOT EXISTS` pour éviter les erreurs.

## 🔒 **Étape 3 : Configurer les politiques de sécurité**

1. Copiez le contenu du fichier `scripts/setup-policies.sql`
2. Collez-le dans Supabase > **SQL Editor**
3. Exécutez le script

## ✅ **Étape 4 : Vérifier la configuration**

Après avoir exécuté les scripts, vérifiez que tout est en place :

```sql
-- Vérifier toutes les tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

## 🎯 **Résultat attendu**

Vous devriez voir :
- **6 tables** : users, drivers, deliveries, payments, notifications, ratings
- **Politiques RLS** activées sur toutes les tables
- **Contraintes** et **clés étrangères** en place

## 🚀 **Étape 5 : Tester l'application**

1. Configurez vos clés Supabase dans l'application
2. Redémarrez l'application : `npx expo start --clear`
3. Créez un nouveau compte
4. Vérifiez dans Supabase > **Table Editor** que les données sont créées

## 🔧 **Dépannage avancé**

### Si vous voulez recommencer à zéro :

```sql
-- ATTENTION : Ceci supprime toutes les données !
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.deliveries CASCADE;
DROP TABLE IF EXISTS public.drivers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

Puis exécutez le script `create-missing-tables.sql`.

### Si vous avez des erreurs de contraintes :

```sql
-- Vérifier les contraintes existantes
SELECT 
  tc.table_name, 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
```

## 📞 **Besoin d'aide ?**

Si vous rencontrez d'autres erreurs :
1. Copiez le message d'erreur exact
2. Vérifiez dans quelle table l'erreur se produit
3. Consultez la documentation Supabase

Votre base de données est presque prête ! 🎉
