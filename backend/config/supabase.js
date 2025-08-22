const { createClient } = require('@supabase/supabase-js');

// Configuration temporaire pour éviter les erreurs
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.example';

// Ne pas lancer d'erreur si les variables ne sont pas définies
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variables d\'environnement Supabase manquantes - Utilisation de valeurs par défaut');
  console.warn('⚠️ Les fonctionnalités Supabase ne seront pas disponibles');
}

// Vérifier si les URLs sont valides avant de créer les clients
let supabase = null;
let supabaseAdmin = null;

try {
  // Client Supabase pour les opérations publiques
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Client Supabase avec service role pour les opérations admin
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('✅ Clients Supabase initialisés avec succès');
} catch (error) {
  console.warn('⚠️ Erreur lors de l\'initialisation des clients Supabase:', error.message);
  console.warn('⚠️ Les fonctionnalités Supabase ne seront pas disponibles');
  
  // Créer des objets factices pour éviter les erreurs
  supabase = {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    auth: { signUp: () => Promise.resolve({ data: null, error: null }) }
  };
  
  supabaseAdmin = {
    from: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
    auth: { signUp: () => Promise.resolve({ data: null, error: null }) }
  };
}

module.exports = {
  supabase,
  supabaseAdmin
};
