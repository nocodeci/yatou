require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables d\'environnement Supabase manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addExpoTokenColumn() {
  console.log('🔧 Ajout de la colonne expo_push_token à la table drivers...\n');

  try {
    // Utiliser l'API RPC pour exécuter du SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;'
    });

    if (error) {
      console.log('⚠️ Impossible d\'ajouter la colonne via l\'API RPC');
      console.log('📝 Veuillez exécuter manuellement cette requête SQL dans Supabase :\n');
      console.log('ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;\n');
      
      console.log('📋 Instructions :');
      console.log('1. Allez sur https://supabase.com');
      console.log('2. Ouvrez votre projet YATOU');
      console.log('3. Allez dans SQL Editor');
      console.log('4. Exécutez la requête ci-dessus');
      console.log('5. Redémarrez l\'application\n');
    } else {
      console.log('✅ Colonne expo_push_token ajoutée avec succès !\n');
    }

    // Vérifier si la colonne existe maintenant
    console.log('🔍 Vérification de la colonne...');
    
    const { data: testData, error: testError } = await supabase
      .from('drivers')
      .select('expo_push_token')
      .limit(1);

    if (testError && testError.code === '42703') {
      console.log('❌ La colonne expo_push_token n\'existe pas encore');
      console.log('   Veuillez l\'ajouter manuellement avec la requête SQL ci-dessus\n');
    } else if (testError) {
      console.error('❌ Erreur lors de la vérification:', testError);
    } else {
      console.log('✅ La colonne expo_push_token existe maintenant !\n');
      
      // Afficher les livreurs
      console.log('📋 Liste des livreurs :');
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
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
    console.log('\n📝 Solution manuelle :');
    console.log('Exécutez cette requête SQL dans Supabase :');
    console.log('ALTER TABLE drivers ADD COLUMN expo_push_token TEXT;\n');
  }
}

addExpoTokenColumn();
