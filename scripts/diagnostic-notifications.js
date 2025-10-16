require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnosticNotifications() {
  console.log('🔍 DIAGNOSTIC : Problème des notifications push\n');

  console.log('1️⃣ Vérification des variables d\'environnement :');
  console.log('   EXPO_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Configuré' : '❌ Manquant');
  console.log('   EXPO_PUBLIC_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '✅ Configuré' : '❌ Manquant\n');

  console.log('2️⃣ Test de connexion à la base de données :');
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('id, expo_push_token, users!inner(name, email)')
      .limit(1);

    if (error) {
      console.log('   ❌ Erreur de connexion:', error.message);
    } else {
      console.log('   ✅ Connexion à la base de données réussie');
      console.log('   📊 Nombre de livreurs:', data.length);
    }
  } catch (error) {
    console.log('   ❌ Erreur de connexion:', error.message);
  }

  console.log('\n3️⃣ Vérification des tokens Expo Push :');
  try {
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select('id, expo_push_token, users!inner(name, email)');

    if (error) {
      console.log('   ❌ Erreur:', error.message);
    } else {
      const driversWithTokens = drivers.filter(d => d.expo_push_token);
      const driversWithoutTokens = drivers.filter(d => !d.expo_push_token);
      
      console.log('   📊 Livreurs avec tokens:', driversWithTokens.length);
      console.log('   📊 Livreurs sans tokens:', driversWithoutTokens.length);
      
      if (driversWithoutTokens.length > 0) {
        console.log('   ❌ PROBLÈME IDENTIFIÉ : Aucun token Expo Push enregistré');
        console.log('   📋 Livreurs sans tokens :');
        driversWithoutTokens.forEach((driver, index) => {
          console.log(`      ${index + 1}. ${driver.users.name} (${driver.users.email})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur:', error.message);
  }

  console.log('\n4️⃣ SOLUTIONS POUR RÉSOUDRE LE PROBLÈME :\n');

  console.log('🔧 SOLUTION 1 : Configurer les variables d\'environnement EAS');
  console.log('   1. Allez sur https://expo.dev/accounts/yohan0707/projects/yatou-delivery');
  console.log('   2. Cliquez sur "Settings" > "Environment variables"');
  console.log('   3. Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('   4. Reconstruisez l\'APK\n');

  console.log('🔧 SOLUTION 2 : Vérifier les permissions de notification');
  console.log('   1. Sur votre téléphone, allez dans Paramètres > Applications > YATOU');
  console.log('   2. Vérifiez que les notifications sont activées');
  console.log('   3. Vérifiez que l\'application a accès à la localisation\n');

  console.log('🔧 SOLUTION 3 : Tester avec Expo Go');
  console.log('   1. Installez Expo Go sur votre téléphone');
  console.log('   2. Scannez le QR code de l\'application');
  console.log('   3. Connectez-vous en tant que livreur');
  console.log('   4. Les notifications locales fonctionneront\n');

  console.log('🔧 SOLUTION 4 : Vérifier les logs de l\'application');
  console.log('   1. Ouvrez l\'application YATOU');
  console.log('   2. Connectez-vous en tant que livreur');
  console.log('   3. Regardez les logs dans le terminal Expo');
  console.log('   4. Cherchez les messages de token Expo Push\n');

  console.log('🎯 PROCHAINES ÉTAPES :');
  console.log('   1. Configurez les variables d\'environnement EAS');
  console.log('   2. Reconstruisez l\'APK');
  console.log('   3. Installez le nouvel APK');
  console.log('   4. Testez les notifications push\n');

  console.log('📊 VÉRIFICATION FINALE :');
  console.log('   Après avoir suivi les solutions, vérifiez avec :');
  console.log('   SELECT drivers.id, users.name, drivers.expo_push_token');
  console.log('   FROM drivers JOIN users ON drivers.user_id = users.id;\n');
}

diagnosticNotifications();
