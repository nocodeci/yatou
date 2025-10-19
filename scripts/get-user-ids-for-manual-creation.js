require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getUserIdsForManualCreation() {
  console.log('📋 RÉCUPÉRATION DES IDs UTILISATEUR POUR CRÉATION MANUELLE\n');

  try {
    // Récupérer tous les utilisateurs avec rôle driver
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'driver');

    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }

    console.log(`📊 UTILISATEURS LIVREUR TROUVÉS: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur avec rôle "driver" trouvé');
      console.log('   - Créez d\'abord des comptes avec rôle "driver"');
      console.log('   - Ou changez le rôle d\'utilisateurs existants\n');
      return;
    }

    console.log('👥 UTILISATEURS DISPONIBLES POUR CRÉER DES PROFILS LIVREUR:\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log('');
    });

    console.log('🔧 INSTRUCTIONS POUR CRÉER MANUELLEMENT LES LIVREURS:\n');

    console.log('1️⃣ ALLEZ SUR SUPABASE:');
    console.log('   - Ouvrez https://supabase.com');
    console.log('   - Connectez-vous à votre compte');
    console.log('   - Ouvrez votre projet YATOU');
    console.log('   - Allez dans "Table Editor" > "drivers"\n');

    console.log('2️⃣ CRÉEZ LES LIVREURS UN PAR UN:');
    console.log('   - Cliquez sur "Insert" > "Insert row"');
    console.log('   - Remplissez les champs suivants:\n');

    const vehicleTypes = ['moto', 'fourgon', 'camion', 'moto', 'fourgon'];
    const locations = [
      { lat: -5.0189, lng: 7.6995 }, // Bouaké centre
      { lat: -5.0200, lng: 7.7000 }, // Bouaké nord
      { lat: -5.0170, lng: 7.6980 }, // Bouaké sud
      { lat: -5.0195, lng: 7.7010 }, // Bouaké est
      { lat: -5.0165, lng: 7.6970 }, // Bouaké ouest
    ];

    users.slice(0, 5).forEach((user, index) => {
      const vehicleType = vehicleTypes[index] || 'moto';
      const location = locations[index] || locations[0];

      console.log(`📝 LIVREUR ${index + 1} - ${user.name}:`);
      console.log(`   user_id: ${user.id}`);
      console.log(`   license_number: ${vehicleType.toUpperCase()}${String(index + 1).padStart(3, '0')}`);
      console.log(`   vehicle_info: {"type": "${vehicleType}", "model": "${vehicleType.toUpperCase()} YATOU", "color": "Rouge", "plate_number": "CI-${vehicleType.toUpperCase()}${String(index + 1).padStart(3, '0')}"}`);
      console.log(`   is_available: true`);
      console.log(`   current_location: (${location.lng},${location.lat})`);
      console.log(`   rating: ${(4.5 + Math.random() * 0.5).toFixed(1)}`);
      console.log(`   total_deliveries: ${Math.floor(Math.random() * 50) + 10}`);
      console.log('');
    });

    console.log('3️⃣ CHAMPS OBLIGATOIRES:');
    console.log('   - user_id: [Copiez l\'ID de l\'utilisateur ci-dessus]');
    console.log('   - license_number: [Numéro de licence unique]');
    console.log('   - vehicle_info: [JSON avec type, model, color, plate_number]');
    console.log('   - is_available: true');
    console.log('   - current_location: [Format: (longitude,latitude)]');
    console.log('   - rating: [Note entre 1.0 et 5.0]');
    console.log('   - total_deliveries: [Nombre de livraisons effectuées]\n');

    console.log('4️⃣ CHAMPS OPTIONNELS:');
    console.log('   - expo_push_token: [Laissez vide pour l\'instant]');
    console.log('   - created_at: [Laissez vide - sera automatique]');
    console.log('   - updated_at: [Laissez vide - sera automatique]\n');

    console.log('5️⃣ APRÈS LA CRÉATION:');
    console.log('   - Sauvegardez chaque livreur');
    console.log('   - Rechargez l\'application client');
    console.log('   - Vous devriez voir les livreurs sur la carte');
    console.log('   - Testez les commandes et notifications\n');

    console.log('🚀 RÉSULTAT ATTENDU:');
    console.log('   - 5 livreurs visibles sur la carte');
    console.log('   - Positions différentes autour de Bouaké');
    console.log('   - Types de véhicules variés (moto, fourgon, camion)');
    console.log('   - Statut disponible activé');
    console.log('   - Notifications fonctionnelles\n');

    console.log('💡 CONSEIL:');
    console.log('   - Créez au moins 2-3 livreurs pour tester');
    console.log('   - Utilisez des positions différentes');
    console.log('   - Activez le statut "is_available"');
    console.log('   - Vérifiez que current_location est bien formaté\n');

  } catch (error) {
    console.error('❌ Erreur lors de la récupération:', error);
  }
}

getUserIdsForManualCreation();

