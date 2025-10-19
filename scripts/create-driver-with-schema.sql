-- 🚀 CRÉATION D'UN LIVREUR AVEC VOTRE SCHÉMA EXACT
-- Copiez et exécutez cette requête dans Supabase SQL Editor

-- 1. Vérifier les utilisateurs disponibles avec rôle 'driver'
SELECT id, name, email, role, is_active 
FROM users 
WHERE role = 'driver' AND is_active = true
LIMIT 5;

-- 2. Créer un livreur (remplacez USER_ID par un ID de la requête ci-dessus)
INSERT INTO drivers (
    user_id,
    license_number,
    vehicle_info,
    is_available,
    current_location,
    rating,
    total_deliveries,
    expo_push_token
) VALUES (
    '4bb8a885-d9a6-44e7-81f7-638d7994fa65', -- Remplacez par un ID valide de la requête ci-dessus
    'MOTO001',
    '{"type": "moto", "model": "MOTO YATOU", "color": "Rouge", "plate_number": "CI-MOTO001"}',
    true,
    '(7.6995,-5.0189)', -- Format: (longitude, latitude) pour Bouaké centre
    4.5,
    25,
    NULL -- expo_push_token sera rempli automatiquement quand le livreur se connecte
);

-- 3. Vérifier que le livreur a été créé avec succès
SELECT 
    d.id as driver_id,
    d.license_number,
    d.vehicle_info,
    d.is_available,
    d.current_location,
    d.rating,
    d.total_deliveries,
    d.expo_push_token,
    d.created_at,
    u.id as user_id,
    u.name as driver_name,
    u.email,
    u.role,
    u.is_active
FROM drivers d
JOIN users u ON d.user_id = u.id
WHERE d.license_number = 'MOTO001';

-- 4. Vérifier le nombre total de livreurs
SELECT COUNT(*) as total_drivers FROM drivers;

-- 5. Vérifier les livreurs disponibles
SELECT COUNT(*) as available_drivers FROM drivers WHERE is_available = true;
