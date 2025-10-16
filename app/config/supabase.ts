/**
 * Configuration Supabase pour YATOU
 */

import { createClient } from '@supabase/supabase-js';

// Remplacez ces valeurs par vos vraies clés Supabase
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
};

// Instance client Supabase
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Instructions pour configurer Supabase :
/*
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Dans Settings > API, copiez :
   - Project URL
   - anon public key
4. Remplacez les valeurs ci-dessus par vos vraies clés
5. Redémarrez l'application
*/

// Instructions pour configurer Supabase :
/*
1. Allez sur https://supabase.com
2. Créez un nouveau projet
3. Dans Settings > API, copiez :
   - Project URL
   - anon public key
4. Créez un fichier .env.local dans la racine du projet avec :
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
5. Redémarrez l'application
*/
