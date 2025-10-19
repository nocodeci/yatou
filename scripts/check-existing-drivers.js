require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkExistingDrivers() {
  console.log('🔍 VÉRIFICATION DES LIVREURS EXISTANTS\n');

  try {
    // 1. Vérifier tous les livreurs
    const { data: allDrivers, error: allError } = await supabase
      .from('drivers')
      .select(`
        id,
        user_id,
        license_number,
        vehicle_info,
        is_available,
        current_location,
        rating,
        total_deliveries,
        expo_push_token,
        created_at,
        updated_at,
        users!inner(id, name, email, role, is_active)
      `);

    if (allError) {
      console.error('❌ Erreur lors de la récupération des livreurs:', allError);
      return;
    }

    console.log(`📊 TOTAL DES LIVREURS: ${allDrivers.length}\n`);

    if (allDrivers.length === 0) {
      console.log('❌ AUCUN LIVREUR TROUVÉ');
      console.log('   - La table drivers est vide');
      console.log('   - Créez des livreurs pour les voir sur la carte\n');
      return;
    }

    // 2. Analyser chaque livreur
    console.log('👥 LIVREURS TROUVÉS:\n');

    allDrivers.forEach((driver, index) => {
      console.log(`${index + 1}. ${driver.users.name}`);
      console.log(`   - ID: ${driver.id}`);
      console.log(`   - Email: ${driver.users.email}`);
      console.log(`   - Rôle: ${driver.users.role}`);
      console.log(`   - Actif: ${driver.users.is_active ? '✅' : '❌'}`);
      console.log(`   - Disponible: ${driver.is_available ? '✅' : '❌'}`);
      console.log(`   - Position: ${driver.current_location ? '✅' : '❌'}`);
      console.log(`   - Véhicule: ${driver.vehicle_info?.type || 'N/A'}`);
      console.log(`   - Note: ${driver.rating || 'N/A'}`);
      console.log(`   - Livraisons: ${driver.total_deliveries || 0}`);
      console.log(`   - Token Push: ${driver.expo_push_token ? '✅' : '❌'}`);
      console.log(`   - Créé: ${new Date(driver.created_at).toLocaleString()}`);
      console.log('');
    });

    // 3. Analyser les problèmes potentiels
    console.log('🔍 ANALYSE DES PROBLÈMES POTENTIELS:\n');

    const availableDrivers = allDrivers.filter(d => d.is_available);
    const driversWithLocation = allDrivers.filter(d => d.current_location);
    const activeUsers = allDrivers.filter(d => d.users.is_active);
    const driversWithToken = allDrivers.filter(d => d.expo_push_token);

    console.log('📈 STATISTIQUES:');
    console.log(`   - Livreurs disponibles: ${availableDrivers.length}/${allDrivers.length}`);
    console.log(`   - Livreurs avec position: ${driversWithLocation.length}/${allDrivers.length}`);
    console.log(`   - Utilisateurs actifs: ${activeUsers.length}/${allDrivers.length}`);
    console.log(`   - Livreurs avec token: ${driversWithToken.length}/${allDrivers.length}\n`);

    // 4. Identifier les livreurs qui devraient être visibles
    const visibleDrivers = allDrivers.filter(d => 
      d.is_available && 
      d.current_location && 
      d.users.is_active
    );

    console.log('👁️ LIVREURS QUI DEVRAIENT ÊTRE VISIBLES:');
    if (visibleDrivers.length === 0) {
      console.log('   ❌ AUCUN LIVREUR VISIBLE');
      console.log('   - Raisons possibles:');
      
      if (availableDrivers.length === 0) {
        console.log('     • Aucun livreur disponible (is_available = false)');
      }
      if (driversWithLocation.length === 0) {
        console.log('     • Aucun livreur avec position GPS');
      }
      if (activeUsers.length === 0) {
        console.log('     • Aucun utilisateur actif');
      }
    } else {
      console.log(`   ✅ ${visibleDrivers.length} livreur(s) visible(s):`);
      visibleDrivers.forEach((driver, index) => {
        console.log(`   ${index + 1}. ${driver.users.name} (${driver.vehicle_info?.type})`);
        console.log(`      Position: ${driver.current_location}`);
        console.log(`      Disponible: ${driver.is_available}`);
      });
    }

    console.log('\n🔧 SOLUTIONS POSSIBLES:');

    if (availableDrivers.length === 0) {
      console.log('1️⃣ ACTIVER LES LIVREURS:');
      console.log('   - Mettre is_available = true pour tous les livreurs');
      console.log('   - Requête SQL: UPDATE drivers SET is_available = true;\n');
    }

    if (driversWithLocation.length === 0) {
      console.log('2️⃣ AJOUTER DES POSITIONS:');
      console.log('   - Ajouter current_location pour tous les livreurs');
      console.log('   - Format: (longitude, latitude)');
      console.log('   - Exemple: (7.6995,-5.0189) pour Bouaké\n');
    }

    if (activeUsers.length === 0) {
      console.log('3️⃣ ACTIVER LES UTILISATEURS:');
      console.log('   - Mettre is_active = true pour tous les utilisateurs');
      console.log('   - Requête SQL: UPDATE users SET is_active = true WHERE role = \'driver\';\n');
    }

    console.log('🚀 SOLUTION RAPIDE:');
    console.log('   - Exécutez ces requêtes SQL dans Supabase:');
    console.log('   UPDATE drivers SET is_available = true;');
    console.log('   UPDATE drivers SET current_location = \'(7.6995,-5.0189)\' WHERE current_location IS NULL;');
    console.log('   UPDATE users SET is_active = true WHERE role = \'driver\';\n');

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  }
}

checkExistingDrivers();
