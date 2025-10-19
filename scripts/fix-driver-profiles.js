require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixDriverProfiles() {
  console.log('🔧 CORRECTION DES PROFILS LIVREUR\n');

  try {
    // 1. Vérifier les utilisateurs avec rôle driver
    console.log('1️⃣ VÉRIFICATION DES UTILISATEURS LIVREUR...\n');

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, is_active')
      .eq('role', 'driver');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`📊 UTILISATEURS AVEC RÔLE "DRIVER": ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ AUCUN UTILISATEUR AVEC RÔLE "DRIVER"');
      console.log('   - Créez d\'abord des comptes avec rôle "driver"');
      console.log('   - Ou changez le rôle d\'utilisateurs existants\n');
      return;
    }

    // 2. Afficher les utilisateurs
    console.log('👥 UTILISATEURS DISPONIBLES:\n');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Actif: ${user.is_active ? '✅' : '❌'}`);
      console.log('');
    });

    // 3. Vérifier les profils livreur existants
    console.log('2️⃣ VÉRIFICATION DES PROFILS LIVREUR...\n');

    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, user_id, license_number, is_available, current_location');

    if (driversError) {
      console.error('❌ Erreur lors de la vérification des profils:', driversError);
      return;
    }

    console.log(`📊 PROFILS LIVREUR EXISTANTS: ${drivers.length}\n`);

    if (drivers.length > 0) {
      console.log('✅ PROFILS LIVREUR DÉJÀ EXISTANTS:');
      drivers.forEach((driver, index) => {
        console.log(`${index + 1}. Profil ${driver.id}`);
        console.log(`   - Utilisateur: ${driver.user_id}`);
        console.log(`   - Licence: ${driver.license_number}`);
        console.log(`   - Disponible: ${driver.is_available ? '✅' : '❌'}`);
        console.log(`   - Position: ${driver.current_location ? '✅' : '❌'}`);
        console.log('');
      });

      console.log('🎉 PROBLÈME RÉSOLU !');
      console.log('   - Les profils livreur existent déjà');
      console.log('   - Rechargez l\'app pour les voir sur la carte');
      console.log('   - Si ils ne s\'affichent pas, vérifiez is_available et current_location\n');
      return;
    }

    // 4. Créer les profils livreur manquants
    console.log('❌ AUCUN PROFIL LIVREUR TROUVÉ');
    console.log('   - Création des profils livreur manquants\n');

    console.log('3️⃣ CRÉATION DES PROFILS LIVREUR...\n');

    const vehicleTypes = ['moto', 'fourgon', 'camion', 'moto', 'fourgon'];
    const locations = [
      { lat: -5.0189, lng: 7.6995 }, // Bouaké centre
      { lat: -5.0200, lng: 7.7000 }, // Bouaké nord
      { lat: -5.0170, lng: 7.6980 }, // Bouaké sud
      { lat: -5.0195, lng: 7.7010 }, // Bouaké est
      { lat: -5.0165, lng: 7.6970 }, // Bouaké ouest
    ];

    let successCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const vehicleType = vehicleTypes[i] || 'moto';
      const location = locations[i] || locations[0];

      console.log(`📝 Création profil pour: ${user.name} (${vehicleType})`);

      // Vérifier si le profil existe déjà
      const { data: existingDriver, error: checkError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingDriver) {
        console.log(`   ⚠️ Profil existe déjà pour ${user.name}`);
        successCount++;
        continue;
      }

      // Créer le profil livreur
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user.id,
          license_number: `${vehicleType.toUpperCase()}${String(i + 1).padStart(3, '0')}`,
          vehicle_info: {
            type: vehicleType,
            model: `${vehicleType.toUpperCase()} YATOU`,
            color: 'Rouge',
            plate_number: `CI-${vehicleType.toUpperCase()}${String(i + 1).padStart(3, '0')}`
          },
          is_available: true,
          current_location: `(${location.lng},${location.lat})`,
          rating: 4.5 + Math.random() * 0.5,
          total_deliveries: Math.floor(Math.random() * 50) + 10,
        })
        .select('id')
        .single();

      if (driverError) {
        console.error(`   ❌ Erreur: ${driverError.message}`);
        
        // Essayer avec une approche SQL directe
        console.log(`   🔄 Tentative SQL directe...`);
        
        try {
          const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `
              INSERT INTO drivers (
                user_id, 
                license_number, 
                vehicle_info, 
                is_available, 
                current_location, 
                rating, 
                total_deliveries
              ) VALUES (
                '${user.id}',
                '${vehicleType.toUpperCase()}${String(i + 1).padStart(3, '0')}',
                '{"type": "${vehicleType}", "model": "${vehicleType.toUpperCase()} YATOU", "color": "Rouge"}',
                true,
                '(${location.lng},${location.lat})',
                ${4.5 + Math.random() * 0.5},
                ${Math.floor(Math.random() * 50) + 10}
              ) RETURNING id;
            `
          });

          if (sqlError) {
            console.log(`   ❌ SQL direct échoué: ${sqlError.message}`);
          } else {
            console.log(`   ✅ Profil créé via SQL direct: ${user.name}`);
            successCount++;
          }
        } catch (sqlErr) {
          console.log(`   ❌ SQL direct non disponible: ${sqlErr.message}`);
        }
      } else {
        console.log(`   ✅ Profil créé: ${driver.id}`);
        successCount++;
      }
    }

    // 5. Vérification finale
    console.log('\n4️⃣ VÉRIFICATION FINALE...\n');
    
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select('id, is_available, current_location, vehicle_info, users!inner(name)');

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
      return;
    }

    console.log(`📊 RÉSULTAT FINAL: ${finalDrivers.length} livreur(s) actif(s)`);
    console.log(`✅ SUCCÈS: ${successCount} profils créés/mis à jour\n`);

    if (finalDrivers.length === 0) {
      console.log('❌ TOUJOURS AUCUN LIVREUR');
      console.log('   - Problème de permissions RLS');
      console.log('   - Solution: Créer manuellement via Supabase\n');
      
      console.log('🔧 SOLUTION MANUELLE:');
      console.log('1. Allez sur https://supabase.com');
      console.log('2. Ouvrez votre projet YATOU');
      console.log('3. Allez dans "SQL Editor"');
      console.log('4. Exécutez cette requête:\n');
      
      console.log('   INSERT INTO drivers (');
      console.log('       user_id,');
      console.log('       license_number,');
      console.log('       vehicle_info,');
      console.log('       is_available,');
      console.log('       current_location,');
      console.log('       rating,');
      console.log('       total_deliveries');
      console.log('   ) VALUES (');
      console.log(`       '${users[0].id}',`);
      console.log('       \'MOTO001\',');
      console.log('       \'{"type": "moto", "model": "MOTO YATOU", "color": "Rouge"}\',');
      console.log('       true,');
      console.log('       \'(7.6995,-5.0189)\',');
      console.log('       4.5,');
      console.log('       25');
      console.log('   );\n');
    } else {
      console.log('🎉 PROBLÈME RÉSOLU !');
      finalDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.users.name}`);
        console.log(`   - Véhicule: ${driver.vehicle_info.type}`);
        console.log(`   - Disponible: ${driver.is_available ? '✅' : '❌'}`);
        console.log(`   - Position: ${driver.current_location ? '✅' : '❌'}`);
        console.log('');
      });

      console.log('🚀 MAINTENANT VOUS POUVEZ:');
      console.log('1️⃣ Voir les livreurs sur la carte client');
      console.log('2️⃣ Tester les commandes');
      console.log('3️⃣ Voir les notifications en temps réel');
      console.log('4️⃣ Tester l\'acceptation des commandes\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'opération:', error);
  }
}

fixDriverProfiles();
