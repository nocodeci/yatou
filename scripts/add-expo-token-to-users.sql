-- Ajouter la colonne expo_push_token à la table users pour les notifications clients

-- 1. Ajouter la colonne expo_push_token à la table users
ALTER TABLE users ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 2. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'expo_push_token';

-- 3. Vérifier les utilisateurs avec des tokens
SELECT id, name, email, role, expo_push_token 
FROM users 
WHERE expo_push_token IS NOT NULL;

-- 4. Vérifier la structure complète de la table users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
