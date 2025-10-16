-- Requête SQL corrigée pour éviter l'ambiguïté de la colonne "id"

-- 1. Ajouter la colonne expo_push_token si elle n'existe pas
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS expo_push_token TEXT;

-- 2. Vérifier les tokens (requête corrigée)
SELECT 
    drivers.id as driver_id, 
    users.name, 
    drivers.expo_push_token 
FROM drivers 
JOIN users ON drivers.user_id = users.id;

-- 3. Vérifier seulement les livreurs avec des tokens
SELECT 
    drivers.id as driver_id, 
    users.name, 
    drivers.expo_push_token 
FROM drivers 
JOIN users ON drivers.user_id = users.id
WHERE drivers.expo_push_token IS NOT NULL;

-- 4. Vérifier la structure de la table drivers
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'drivers' 
ORDER BY ordinal_position;
