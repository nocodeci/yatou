-- 🧹 NETTOYAGE DES DONNÉES DE PRODUCTION
-- Supprimer toutes les données fictives et temporaires

-- 1. Supprimer toutes les livraisons avec des données par défaut
DELETE FROM deliveries 
WHERE pickup_address = 'Adresse de départ' 
   OR delivery_address = 'Adresse d''arrivée'
   OR estimated_price = 0;

-- 2. Supprimer les utilisateurs temporaires (ceux créés automatiquement)
DELETE FROM users 
WHERE name = 'Utilisateur temporaire' 
   OR email LIKE '%temp%'
   OR email LIKE '%temporary%';

-- 3. Vérifier les données restantes
SELECT 
    'users' as table_name,
    COUNT(*) as count
FROM users
UNION ALL
SELECT 
    'deliveries' as table_name,
    COUNT(*) as count
FROM deliveries
UNION ALL
SELECT 
    'drivers' as table_name,
    COUNT(*) as count
FROM drivers;

-- 4. Afficher les livraisons restantes (vraies données)
SELECT 
    id,
    user_id,
    pickup_address,
    delivery_address,
    estimated_price,
    status,
    created_at
FROM deliveries
ORDER BY created_at DESC
LIMIT 10;
