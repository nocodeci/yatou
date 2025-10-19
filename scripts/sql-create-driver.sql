-- 🚀 SOLUTION SQL POUR CRÉER UN LIVREUR
-- Copiez et exécutez cette requête dans Supabase SQL Editor

-- 1. Vérifier les utilisateurs disponibles
SELECT id, name, email, role 
FROM users 
WHERE role = 'driver' 
LIMIT 5;

-- 2. Créer un livreur (remplacez USER_ID par un ID de la requête ci-dessus)
INSERT INTO drivers (
    user_id,
    license_number,
    vehicle_info,
    is_available,
    current_location,
    rating,
    total_deliveries
) VALUES (
    '4bb8a885-d9a6-44e7-81f7-638d7994fa65', -- Remplacez par un ID valide
    'MOTO001',
    '{"type": "moto", "model": "MOTO YATOU", "color": "Rouge", "plate_number": "CI-MOTO001"}',
    true,
    '(7.6995,-5.0189)',
    4.5,
    25
);

-- 3. Vérifier que le livreur a été créé
SELECT 
    d.id,
    d.license_number,
    d.vehicle_info,
    d.is_available,
    d.current_location,
    d.rating,
    u.name as driver_name,
    u.email
FROM drivers d
JOIN users u ON d.user_id = u.id
WHERE d.license_number = 'MOTO001';
