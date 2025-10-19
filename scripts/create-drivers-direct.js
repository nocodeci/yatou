require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createDriversDirect() {
  console.log('🚗 CRÉATION DIRECTE DE LIVREURS (contournement RLS)\n');

  // D'abord, récupérer les utilisateurs créés précédemment
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('role', 'driver');

  if (usersError) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
    return;
  }

  console.log(`📊 Utilisateurs livreur trouvés: ${users.length}\n`);

  if (users.length === 0) {
    console.log('❌ Aucun utilisateur livreur trouvé. Créons d\'abord les utilisateurs...\n');
    
    // Créer les utilisateurs si ils n'existent pas
    const testUsers = [
      { name: 'Kouassi Jean', email: 'kouassi.jean@yatou.com', phone: '+225 07 12 34 56 78' },
      { name: 'Traoré Amadou', email: 'traore.amadou@yatou.com', phone: '+225 07 23 45 67 89' },
      { name: 'Koné Fatou', email: 'kone.fatou@yatou.com', phone: '+225 07 34 56 78 90' },
      { name: 'Diabaté Ibrahim', email: 'diabate.ibrahim@yatou.com', phone: '+225 07 45 67 89 01' },
      { name: 'Ouattara Mariam', email: 'ouattara.mariam@yatou.com', phone: '+225 07 56 78 90 12' }
    ];

    for (const userData of testUsers) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: userData.email,
          password: 'password123',
          name: userData.name,
          phone: userData.phone,
          role: 'driver',
          is_active: true,
        })
        .select('id')
        .single();

      if (userError) {
        console.log(`⚠️ Utilisateur ${userData.name} existe peut-être déjà`);
      } else {
        console.log(`✅ Utilisateur créé: ${userData.name} (${user.id})`);
      }
    }

    // Récupérer à nouveau les utilisateurs
    const { data: newUsers, error: newUsersError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'driver');

    if (newUsersError) {
      console.error('❌ Erreur lors de la récupération des nouveaux utilisateurs:', newUsersError);
      return;
    }

    users.push(...newUsers);
  }

  // Maintenant créer les profils livreur
  const vehicleTypes = ['moto', 'fourgon', 'camion', 'moto', 'fourgon'];
  const locations = [
    { lat: -5.0189, lng: 7.6995 }, // Bouaké centre
    { lat: -5.0200, lng: 7.7000 }, // Bouaké nord
    { lat: -5.0170, lng: 7.6980 }, // Bouaké sud
    { lat: -5.0195, lng: 7.7010 }, // Bouaké est
    { lat: -5.0165, lng: 7.6970 }, // Bouaké ouest
  ];

  console.log('📝 Création des profils livreur...\n');

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
      console.error(`❌ Erreur création profil ${user.name}:`, driverError.message);
      
      // Essayer une approche alternative - utiliser une requête SQL directe
      console.log(`   🔄 Tentative alternative pour ${user.name}...`);
      
      try {
        // Utiliser une fonction RPC si elle existe
        const { data: rpcResult, error: rpcError } = await supabase.rpc('create_driver_profile', {
          p_user_id: user.id,
          p_license_number: `${vehicleType.toUpperCase()}${String(i + 1).padStart(3, '0')}`,
          p_vehicle_type: vehicleType,
          p_location: `(${location.lng},${location.lat})`
        });

        if (rpcError) {
          console.log(`   ❌ RPC échoué: ${rpcError.message}`);
        } else {
          console.log(`   ✅ Profil créé via RPC: ${user.name}`);
        }
      } catch (rpcErr) {
        console.log(`   ❌ RPC non disponible: ${rpcErr.message}`);
      }
    } else {
      console.log(`   ✅ Profil créé: ${driver.id}`);
    }
  }

  // Vérifier le résultat final
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
  console.log(`📊 TOTAL: ${finalDrivers.length} livreurs actifs\n`);

  if (finalDrivers.length === 0) {
    console.log('❌ AUCUN LIVREUR CRÉÉ');
    console.log('   - Problème de permissions RLS');
    console.log('   - Solution: Créer manuellement via l\'interface Supabase\n');
    
    console.log('🔧 SOLUTION MANUELLE :');
    console.log('1. Allez sur https://supabase.com');
    console.log('2. Ouvrez votre projet YATOU');
    console.log('3. Allez dans Table Editor > drivers');
    console.log('4. Créez manuellement quelques livreurs\n');
    
    console.log('📝 EXEMPLE DE DONNÉES À INSÉRER :');
    console.log('user_id: [ID d\'un utilisateur avec rôle driver]');
    console.log('license_number: MOTO001');
    console.log('vehicle_info: {"type": "moto", "model": "MOTO YATOU", "color": "Rouge"}');
    console.log('is_available: true');
    console.log('current_location: (7.6995,-5.0189)');
    console.log('rating: 4.8');
    console.log('total_deliveries: 25\n');
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
}

createDriversDirect();

