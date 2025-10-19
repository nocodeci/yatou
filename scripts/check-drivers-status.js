require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkDriversStatus() {
  console.log('🔍 VÉRIFICATION DU STATUT DES LIVREURS\n');

  try {
    // Vérifier tous les livreurs
    const { data: allDrivers, error: allError } = await supabase
      .from('drivers')
      .select(`
        id,
        user_id,
        is_available,
        current_location,
        vehicle_info,
        rating,
        total_deliveries,
        created_at,
        updated_at,
        expo_push_token,
        users!inner(id, name, email, phone, role)
      `);

    if (allError) {
      console.error('❌ Erreur lors de la récupération des livreurs:', allError);
      return;
    }

    console.log(`📊 TOTAL DES LIVREURS: ${allDrivers.length}\n`);

    if (allDrivers.length === 0) {
      console.log('❌ AUCUN LIVREUR TROUVÉ');
      console.log('   - Aucun livreur enregistré dans la base de données');
      console.log('   - Créez des comptes livreur pour les voir sur la carte\n');
      return;
    }

    // Analyser le statut de chaque livreur
    allDrivers.forEach((driver, index) => {
      console.log(`🚗 LIVREUR ${index + 1}:`);
      console.log(`   - ID: ${driver.id}`);
      console.log(`   - Nom: ${driver.users?.name || 'N/A'}`);
      console.log(`   - Email: ${driver.users?.email || 'N/A'}`);
      console.log(`   - Rôle: ${driver.users?.role || 'N/A'}`);
      console.log(`   - Disponible: ${driver.is_available ? '✅ OUI' : '❌ NON'}`);
      console.log(`   - Position: ${driver.current_location ? '✅ GPS activé' : '❌ Pas de GPS'}`);
      console.log(`   - Véhicule: ${driver.vehicle_info?.type || 'N/A'}`);
      console.log(`   - Token Push: ${driver.expo_push_token ? '✅ Configuré' : '❌ Manquant'}`);
      console.log(`   - Créé: ${new Date(driver.created_at).toLocaleString()}`);
      console.log(`   - Mis à jour: ${new Date(driver.updated_at).toLocaleString()}`);
      console.log('');
    });

    // Compter les livreurs disponibles
    const availableDrivers = allDrivers.filter(d => d.is_available);
    const driversWithLocation = allDrivers.filter(d => d.current_location);
    const driversWithToken = allDrivers.filter(d => d.expo_push_token);

    console.log('📈 STATISTIQUES:');
    console.log(`   - Livreurs disponibles: ${availableDrivers.length}/${allDrivers.length}`);
    console.log(`   - Livreurs avec GPS: ${driversWithLocation.length}/${allDrivers.length}`);
    console.log(`   - Livreurs avec token: ${driversWithToken.length}/${allDrivers.length}\n`);

    // Vérifier les livreurs qui devraient être visibles
    const visibleDrivers = allDrivers.filter(d => 
      d.is_available && d.current_location
    );

    console.log('👁️ LIVREURS VISIBLES SUR LA CARTE:');
    if (visibleDrivers.length === 0) {
      console.log('   ❌ AUCUN LIVREUR VISIBLE');
      console.log('   - Raisons possibles:');
      console.log('     • Aucun livreur disponible');
      console.log('     • Aucun livreur avec GPS activé');
      console.log('     • Problème de localisation');
    } else {
      visibleDrivers.forEach((driver, index) => {
        console.log(`   ${index + 1}. ${driver.users?.name} (${driver.vehicle_info?.type})`);
        console.log(`      Position: ${driver.current_location}`);
      });
    }

    console.log('\n🔧 SOLUTIONS POSSIBLES:');
    console.log('1️⃣ Créer des livreurs de test:');
    console.log('   - Créer des comptes avec rôle "driver"');
    console.log('   - Activer leur statut disponible');
    console.log('   - Activer leur GPS\n');

    console.log('2️⃣ Vérifier la localisation:');
    console.log('   - S\'assurer que les livreurs ont activé leur GPS');
    console.log('   - Vérifier que current_location est mis à jour\n');

    console.log('3️⃣ Tester avec un livreur existant:');
    console.log('   - Se connecter comme livreur');
    console.log('   - Activer le mode disponible');
    console.log('   - Vérifier que la position est mise à jour\n');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkDriversStatus();

