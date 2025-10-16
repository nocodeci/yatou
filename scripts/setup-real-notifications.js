require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupRealNotifications() {
  console.log('🚀 Configuration des vraies notifications push...\n');

  console.log('📋 Étapes pour activer les vraies notifications push :\n');

  console.log('1️⃣ Ajouter la colonne expo_push_token à la base de données :');
  console.log('   ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;\n');

  console.log('2️⃣ Construire l\'application avec EAS :');
  console.log('   eas build --platform android --profile development\n');

  console.log('3️⃣ Installer l\'application sur un appareil physique :');
  console.log('   - Télécharger l\'APK généré par EAS');
  console.log('   - Installer sur un téléphone Android\n');

  console.log('4️⃣ Tester les notifications :');
  console.log('   - Ouvrir l\'app sur le téléphone');
  console.log('   - Se connecter en tant que livreur');
  console.log('   - Le token Expo Push sera automatiquement enregistré\n');

  console.log('5️⃣ Vérifier les tokens en base :');
  console.log('   SELECT id, users.name, expo_push_token FROM drivers JOIN users ON drivers.user_id = users.id;\n');

  // Vérifier si la colonne existe
  try {
    const { data: columns, error } = await supabase
      .from('drivers')
      .select('expo_push_token')
      .limit(1);

    if (error && error.code === '42703') {
      console.log('❌ La colonne expo_push_token n\'existe pas encore');
      console.log('   Veuillez l\'ajouter avec la requête SQL ci-dessus\n');
    } else if (error) {
      console.error('❌ Erreur lors de la vérification:', error);
    } else {
      console.log('✅ La colonne expo_push_token existe déjà\n');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }

  console.log('🔧 Commandes EAS à exécuter :');
  console.log('   eas build:configure  # Configurer EAS (déjà fait)');
  console.log('   eas build --platform android --profile development');
  console.log('   eas build --platform ios --profile development  # Pour iOS\n');

  console.log('📱 Après la construction :');
  console.log('   - L\'APK sera disponible dans le dashboard EAS');
  console.log('   - Téléchargez et installez sur un appareil physique');
  console.log('   - Les tokens Expo Push seront automatiquement générés\n');

  console.log('🎯 Test des notifications :');
  console.log('   - Utilisez l\'app sur l\'appareil physique');
  console.log('   - Les notifications push fonctionneront réellement');
  console.log('   - Plus de simulation, de vraies notifications !\n');
}

// Exécuter le script
setupRealNotifications();
