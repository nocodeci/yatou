require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function quickDriverFix() {
  console.log('🚀 SOLUTION RAPIDE POUR LES LIVREURS\n');

  try {
    // 1. Vérifier l'état actuel
    console.log('1️⃣ VÉRIFICATION DE L\'ÉTAT ACTUEL...\n');

    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select('id, user_id, is_available, current_location, vehicle_info, users!inner(name)');

    if (driversError) {
      console.error('❌ Erreur lors de la vérification des livreurs:', driversError);
      return;
    }

    console.log(`📊 LIVREURS ACTUELS: ${drivers.length}\n`);

    if (drivers.length > 0) {
      console.log('✅ LIVREURS TROUVÉS !');
      drivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.users.name}`);
        console.log(`   - Disponible: ${driver.is_available ? '✅' : '❌'}`);
        console.log(`   - Position: ${driver.current_location ? '✅' : '❌'}`);
        console.log(`   - Véhicule: ${driver.vehicle_info?.type || 'N/A'}`);
        console.log('');
      });

      console.log('🎉 PROBLÈME RÉSOLU !');
      console.log('   - Les livreurs existent déjà');
      console.log('   - Rechargez l\'app pour les voir sur la carte');
      console.log('   - Testez les commandes et notifications\n');
      return;
    }

    // 2. Si aucun livreur, créer un livreur simple
    console.log('❌ AUCUN LIVREUR TROUVÉ');
    console.log('   - Création d\'un livreur de test simple\n');

    // Récupérer le premier utilisateur avec rôle driver
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'driver')
      .limit(1);

    if (usersError || !users || users.length === 0) {
      console.log('❌ Aucun utilisateur avec rôle "driver" trouvé');
      console.log('   - Créez d\'abord un compte avec rôle "driver"');
      console.log('   - Ou changez le rôle d\'un utilisateur existant\n');
      return;
    }

    const user = users[0];
    console.log(`📝 Création d\'un livreur pour: ${user.name} (${user.email})\n`);

    // 3. Essayer de créer un livreur simple
    console.log('2️⃣ CRÉATION D\'UN LIVREUR SIMPLE...\n');

    const { data: newDriver, error: createError } = await supabase
      .from('drivers')
      .insert({
        user_id: user.id,
        license_number: 'TEST001',
        vehicle_info: {
          type: 'moto',
          model: 'MOTO TEST',
          color: 'Rouge',
          plate_number: 'CI-TEST001'
        },
        is_available: true,
        current_location: '(7.6995,-5.0189)', // Bouaké centre
        rating: 4.5,
        total_deliveries: 10,
      })
      .select('id')
      .single();

    if (createError) {
      console.log('❌ Impossible de créer le livreur automatiquement');
      console.log(`   - Erreur: ${createError.message}\n`);
      
      console.log('🔧 SOLUTION MANUELLE SIMPLE:\n');
      console.log('1️⃣ Allez sur https://supabase.com');
      console.log('2️⃣ Ouvrez votre projet YATOU');
      console.log('3️⃣ Allez dans "Table Editor" > "drivers"');
      console.log('4️⃣ Cliquez sur "Insert" > "Insert row"');
      console.log('5️⃣ Remplissez ces champs:\n');
      
      console.log('📝 DONNÉES À INSÉRER:');
      console.log(`   user_id: ${user.id}`);
      console.log('   license_number: TEST001');
      console.log('   vehicle_info: {"type": "moto", "model": "MOTO TEST", "color": "Rouge", "plate_number": "CI-TEST001"}');
      console.log('   is_available: true');
      console.log('   current_location: (7.6995,-5.0189)');
      console.log('   rating: 4.5');
      console.log('   total_deliveries: 10\n');
      
      console.log('6️⃣ Cliquez sur "Save"');
      console.log('7️⃣ Rechargez l\'app client');
      console.log('8️⃣ Vous devriez voir le livreur sur la carte\n');
      
    } else {
      console.log('✅ LIVREUR CRÉÉ AVEC SUCCÈS !');
      console.log(`   - ID: ${newDriver.id}`);
      console.log(`   - Pour: ${user.name}`);
      console.log('   - Type: Moto');
      console.log('   - Position: Bouaké centre');
      console.log('   - Disponible: Oui\n');
      
      console.log('🎉 PROBLÈME RÉSOLU !');
      console.log('   - Rechargez l\'app pour voir le livreur');
      console.log('   - Testez les commandes et notifications\n');
    }

    // 4. Vérification finale
    console.log('3️⃣ VÉRIFICATION FINALE...\n');
    
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select('id, is_available, current_location, vehicle_info, users!inner(name)');

    if (finalError) {
      console.error('❌ Erreur lors de la vérification finale:', finalError);
      return;
    }

    console.log(`📊 RÉSULTAT FINAL: ${finalDrivers.length} livreur(s) actif(s)\n`);

    if (finalDrivers.length > 0) {
      console.log('🚀 MAINTENANT VOUS POUVEZ:');
      console.log('1️⃣ Voir le(s) livreur(s) sur la carte client');
      console.log('2️⃣ Tester les commandes');
      console.log('3️⃣ Voir les notifications en temps réel');
      console.log('4️⃣ Tester l\'acceptation des commandes\n');
      
      console.log('📱 INSTRUCTIONS DE TEST:');
      console.log('1. Ouvrez l\'app client');
      console.log('2. Vous devriez voir le(s) livreur(s) sur la carte');
      console.log('3. Créez une commande');
      console.log('4. Le livreur recevra une notification\n');
    } else {
      console.log('❌ TOUJOURS AUCUN LIVREUR');
      console.log('   - Créez manuellement via Supabase');
      console.log('   - Suivez les instructions ci-dessus\n');
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'opération:', error);
  }
}

quickDriverFix();
