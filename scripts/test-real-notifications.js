require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealNotifications() {
  console.log('🚀 Test des vraies notifications push...\n');

  // Token Expo Push de test (remplacez par un vrai token d'un appareil physique)
  const testExpoToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
  
  console.log('📋 Pour tester les vraies notifications push :\n');

  console.log('1️⃣ Ajoutez la colonne expo_push_token à la base de données :');
  console.log('   ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;\n');

  console.log('2️⃣ Obtenez un vrai token Expo Push :');
  console.log('   - Installez l\'app sur un appareil physique');
  console.log('   - Connectez-vous en tant que livreur');
  console.log('   - Le token sera affiché dans les logs\n');

  console.log('3️⃣ Testez l\'envoi de notification :');
  console.log('   - Remplacez le token de test par le vrai token');
  console.log('   - Exécutez ce script pour envoyer une notification\n');

  // Simuler l'envoi d'une notification
  const notificationData = {
    to: testExpoToken,
    sound: 'default',
    title: '🚨 NOUVELLE COMMANDE URGENTE !',
    body: 'Course de Abidjan à Yopougon pour 1500 FCFA (moto)',
    data: {
      type: 'new_order',
      orderId: 'test-order-123',
      clientId: 'test-client',
      clientName: 'Client Test',
      pickupAddress: 'Abidjan',
      deliveryAddress: 'Yopougon',
      estimatedPrice: 1500,
      vehicleType: 'moto',
      driverId: 'test-driver',
    },
    _displayInForeground: true,
  };

  try {
    console.log('📤 Envoi de la notification de test...');
    
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    const result = await response.json();
    
    if (result.data && result.data[0]?.status === 'ok') {
      console.log('✅ Notification envoyée avec succès !');
      console.log('📱 Vérifiez votre appareil pour voir la notification');
    } else {
      console.log('❌ Échec de l\'envoi de la notification :');
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', error);
  }

  console.log('\n🔧 Pour obtenir un vrai token Expo Push :');
  console.log('1. Installez l\'app sur un appareil physique');
  console.log('2. Connectez-vous en tant que livreur');
  console.log('3. Le token sera affiché dans les logs de l\'app');
  console.log('4. Copiez le token et remplacez-le dans ce script\n');

  console.log('📱 Alternative : Utilisez Expo Go');
  console.log('1. Installez Expo Go sur votre téléphone');
  console.log('2. Scannez le QR code avec Expo Go');
  console.log('3. Les notifications locales fonctionneront\n');
}

testRealNotifications();
