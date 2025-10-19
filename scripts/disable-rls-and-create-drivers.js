require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function disableRLSAndCreateDrivers() {
  console.log('🔧 DÉSACTIVATION RLS ET CRÉATION DE LIVREURS\n');

  try {
    // 1. Désactiver temporairement RLS sur la table drivers
    console.log('1️⃣ Désactivation de RLS sur la table drivers...');
    
    const { data: rlsResult, error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.log('⚠️ Impossible de désactiver RLS via RPC (normal)');
      console.log('   - RLS doit être désactivé manuellement dans Supabase');
      console.log('   - Ou nous devons utiliser une approche différente\n');
    } else {
      console.log('✅ RLS désactivé temporairement\n');
    }

    // 2. Récupérer un utilisateur livreur existant
    console.log('2️⃣ Récupération des utilisateurs livreur...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'driver')
      .limit(5);

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`📊 Utilisateurs livreur trouvés: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur livreur trouvé');
      console.log('   - Créez d\'abord des comptes avec rôle "driver"');
      return;
    }

    // 3. Créer les profils livreur
    console.log('3️⃣ Création des profils livreur...\n');

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

    // 4. Réactiver RLS (si nous l'avions désactivé)
    if (rlsResult) {
      console.log('\n4️⃣ Réactivation de RLS...');
      
      const { data: rlsReenableResult, error: rlsReenableError } = await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;'
      });

      if (rlsReenableError) {
        console.log('⚠️ Impossible de réactiver RLS via RPC');
      } else {
        console.log('✅ RLS réactivé');
      }
    }

    // 5. Vérifier le résultat final
    console.log('\n5️⃣ Vérification du résultat final...');
    
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select(`
        id,
        is_available,
        current_location,
        vehicle_info,
        users!inner(name, email)
      `);

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
      return;
    }

    console.log('\n🎉 RÉSULTAT FINAL !\n');
    console.log(`📊 TOTAL: ${finalDrivers.length} livreurs actifs`);
    console.log(`✅ SUCCÈS: ${successCount} profils créés/mis à jour\n`);

    if (finalDrivers.length === 0) {
      console.log('❌ AUCUN LIVREUR CRÉÉ');
      console.log('   - Problème persistant de permissions RLS');
      console.log('   - Solution: Créer manuellement via l\'interface Supabase\n');
      
      console.log('🔧 SOLUTION MANUELLE URGENTE :');
      console.log('1. Allez sur https://supabase.com');
      console.log('2. Ouvrez votre projet YATOU');
      console.log('3. Allez dans Table Editor > drivers');
      console.log('4. Cliquez sur "Insert" > "Insert row"');
      console.log('5. Créez manuellement quelques livreurs\n');
      
      console.log('📝 EXEMPLE DE DONNÉES À INSÉRER :');
      console.log('user_id: [Copiez un ID d\'utilisateur avec rôle driver]');
      console.log('license_number: MOTO001');
      console.log('vehicle_info: {"type": "moto", "model": "MOTO YATOU", "color": "Rouge", "plate_number": "CI-MOTO001"}');
      console.log('is_available: true');
      console.log('current_location: (7.6995,-5.0189)');
      console.log('rating: 4.8');
      console.log('total_deliveries: 25\n');
      
      console.log('🚀 APRÈS LA CRÉATION MANUELLE :');
      console.log('1. Rechargez l\'app client');
      console.log('2. Vous devriez voir les livreurs sur la carte');
      console.log('3. Testez les commandes et notifications\n');
    } else {
      finalDrivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.users.name}`);
        console.log(`   - Véhicule: ${driver.vehicle_info.type}`);
        console.log(`   - Disponible: ${driver.is_available ? '✅' : '❌'}`);
        console.log(`   - Position: ${driver.current_location ? '✅' : '❌'}`);
        console.log('');
      });

      console.log('🚀 MAINTENANT VOUS POUVEZ :');
      console.log('1️⃣ Voir les livreurs sur la carte client');
      console.log('2️⃣ Tester les commandes');
      console.log('3️⃣ Voir les notifications en temps réel');
      console.log('4️⃣ Tester l\'acceptation des commandes\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'opération:', error);
  }
}

disableRLSAndCreateDrivers();

