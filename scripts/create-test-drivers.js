require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestDrivers() {
  console.log('🚗 CRÉATION DE LIVREURS DE TEST\n');

  const testDrivers = [
    {
      name: 'Kouassi Jean',
      email: 'kouassi.jean@yatou.com',
      phone: '+225 07 12 34 56 78',
      vehicleType: 'moto',
      licenseNumber: 'MOTO001',
      location: { lat: -5.0189, lng: 7.6995 }, // Bouaké centre
    },
    {
      name: 'Traoré Amadou',
      email: 'traore.amadou@yatou.com',
      phone: '+225 07 23 45 67 89',
      vehicleType: 'fourgon',
      licenseNumber: 'FOURGON001',
      location: { lat: -5.0200, lng: 7.7000 }, // Bouaké nord
    },
    {
      name: 'Koné Fatou',
      email: 'kone.fatou@yatou.com',
      phone: '+225 07 34 56 78 90',
      vehicleType: 'camion',
      licenseNumber: 'CAMION001',
      location: { lat: -5.0170, lng: 7.6980 }, // Bouaké sud
    },
    {
      name: 'Diabaté Ibrahim',
      email: 'diabate.ibrahim@yatou.com',
      phone: '+225 07 45 67 89 01',
      vehicleType: 'moto',
      licenseNumber: 'MOTO002',
      location: { lat: -5.0195, lng: 7.7010 }, // Bouaké est
    },
    {
      name: 'Ouattara Mariam',
      email: 'ouattara.mariam@yatou.com',
      phone: '+225 07 56 78 90 12',
      vehicleType: 'fourgon',
      licenseNumber: 'FOURGON002',
      location: { lat: -5.0165, lng: 7.6970 }, // Bouaké ouest
    }
  ];

  try {
    for (const driverData of testDrivers) {
      console.log(`📝 Création du livreur: ${driverData.name} (${driverData.vehicleType})`);

      // 1. Créer l'utilisateur
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          email: driverData.email,
          password: 'password123', // Mot de passe par défaut
          name: driverData.name,
          phone: driverData.phone,
          role: 'driver',
          is_active: true,
        })
        .select('id')
        .single();

      if (userError) {
        console.error(`❌ Erreur création utilisateur ${driverData.name}:`, userError);
        continue;
      }

      console.log(`   ✅ Utilisateur créé: ${user.id}`);

      // 2. Créer le profil livreur
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: user.id,
          license_number: driverData.licenseNumber,
          vehicle_info: {
            type: driverData.vehicleType,
            model: `${driverData.vehicleType.toUpperCase()} YATOU`,
            color: 'Rouge',
            plate_number: `CI-${driverData.licenseNumber}`
          },
          is_available: true,
          current_location: `(${driverData.location.lng},${driverData.location.lat})`,
          rating: 4.5 + Math.random() * 0.5, // Note entre 4.5 et 5.0
          total_deliveries: Math.floor(Math.random() * 50) + 10, // Entre 10 et 60 livraisons
        })
        .select('id')
        .single();

      if (driverError) {
        console.error(`❌ Erreur création profil livreur ${driverData.name}:`, driverError);
        continue;
      }

      console.log(`   ✅ Profil livreur créé: ${driver.id}`);
      console.log(`   📍 Position: ${driverData.location.lat}, ${driverData.location.lng}`);
      console.log('');
    }

    // Vérifier le résultat
    const { data: allDrivers, error: checkError } = await supabase
      .from('drivers')
      .select(`
        id,
        is_available,
        current_location,
        vehicle_info,
        users!inner(name, email, phone)
      `);

    if (checkError) {
      console.error('❌ Erreur lors de la vérification:', checkError);
      return;
    }

    console.log('🎉 LIVREURS DE TEST CRÉÉS AVEC SUCCÈS !\n');
    console.log(`📊 TOTAL: ${allDrivers.length} livreurs créés\n`);

    allDrivers.forEach((driver, index) => {
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

    console.log('📱 INSTRUCTIONS POUR TESTER :');
    console.log('1. Ouvrez l\'app client');
    console.log('2. Vous devriez voir 5 livreurs sur la carte');
    console.log('3. Créez une commande');
    console.log('4. Les livreurs recevront des notifications\n');

  } catch (error) {
    console.error('❌ Erreur lors de la création des livreurs:', error);
  }
}

createTestDrivers();

