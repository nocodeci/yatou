require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupExpoTokens() {
  console.log('🔧 Configuration des tokens Expo Push...\n');

  try {
    // 1. Vérifier si la colonne existe
    console.log('1️⃣ Vérification de la colonne expo_push_token...');
    
    const { data: columns, error: columnError } = await supabase
      .from('drivers')
      .select('expo_push_token')
      .limit(1);

    if (columnError && columnError.code === '42703') {
      console.log('❌ La colonne expo_push_token n\'existe pas encore');
      console.log('📝 Veuillez exécuter cette requête SQL dans Supabase :');
      console.log('   ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;\n');
    } else if (columnError) {
      console.error('❌ Erreur lors de la vérification:', columnError);
    } else {
      console.log('✅ La colonne expo_push_token existe déjà\n');
    }

    // 2. Afficher les livreurs actuels
    console.log('2️⃣ Liste des livreurs actuels :');
    
    const { data: drivers, error: driversError } = await supabase
      .from('drivers')
      .select(`
        id,
        user_id,
        expo_push_token,
        users!inner(name, email)
      `);

    if (driversError) {
      console.error('❌ Erreur lors de la récupération des livreurs:', driversError);
    } else {
      console.log(`📋 ${drivers.length} livreurs trouvés :\n`);
      
      drivers.forEach((driver, index) => {
        console.log(`${index + 1}. ${driver.users.name}`);
        console.log(`   ID: ${driver.id}`);
        console.log(`   Email: ${driver.users.email}`);
        console.log(`   Token: ${driver.expo_push_token || 'Non défini'}`);
        console.log('');
      });
    }

    // 3. Instructions pour les tests
    console.log('3️⃣ Instructions pour tester les notifications :\n');
    
    console.log('📱 Pour obtenir de vrais tokens Expo Push :');
    console.log('1. Installez l\'app sur un appareil physique');
    console.log('2. Connectez-vous en tant que livreur');
    console.log('3. Le token sera automatiquement enregistré\n');
    
    console.log('🔧 Alternative avec Expo Go :');
    console.log('1. Installez Expo Go sur votre téléphone');
    console.log('2. Scannez le QR code de l\'application');
    console.log('3. Connectez-vous en tant que livreur');
    console.log('4. Les notifications locales fonctionneront\n');

    console.log('📊 Vérification des tokens :');
    console.log('   SELECT drivers.id, users.name, drivers.expo_push_token');
    console.log('   FROM drivers JOIN users ON drivers.user_id = users.id;\n');

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

setupExpoTokens();
