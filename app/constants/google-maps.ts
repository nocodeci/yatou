// Configuration Google Maps
export const GOOGLE_MAPS_CONFIG = {
  // Clé API Google Maps
  API_KEY: "AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI",
  
  // Coordonnées d'Abidjan, Côte d'Ivoire
  DEFAULT_CENTER: {
    latitude: 5.3600,
    longitude: -4.0083,
  },
  
  // Niveau de zoom par défaut
  DEFAULT_ZOOM: 12,
  
  // Niveau de zoom pour la vue détaillée
  DETAILED_ZOOM: 15,
  
  // Région par défaut (Côte d'Ivoire)
  DEFAULT_REGION: 'ci',
  
  // Langue par défaut
  DEFAULT_LANGUAGE: 'fr',
  
  // Unités par défaut
  DEFAULT_UNITS: 'metric',
};

// Instructions pour obtenir votre clé API Google Maps :
// 1. Allez sur https://console.cloud.google.com/
// 2. Créez un projet ou sélectionnez un projet existant
// 3. Activez l'API Directions et l'API Maps
// 4. Créez des identifiants (clé API)
// 5. Remplacez la valeur API_KEY ci-dessus
