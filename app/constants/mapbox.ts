// Configuration Mapbox
export const MAPBOX_CONFIG = {
  // Le token Mapbox est maintenant géré côté backend pour plus de sécurité
  // Le token sera récupéré via l'API backend
  ACCESS_TOKEN: '', // Sera récupéré dynamiquement depuis le backend
  
  // Styles de carte disponibles
  STYLES: {
    STREETS: 'mapbox://styles/mapbox/streets-v12',
    OUTDOORS: 'mapbox://styles/mapbox/outdoors-v12',
    LIGHT: 'mapbox://styles/mapbox/light-v11',
    DARK: 'mapbox://styles/mapbox/dark-v11',
    SATELLITE: 'mapbox://styles/mapbox/satellite-v9',
    SATELLITE_STREETS: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  
  // Position par défaut (Bouaké, Côte d'Ivoire) - Coordonnées corrigées
  DEFAULT_CENTER: [-5.0333, 7.6833] as [number, number],
  
  // Niveau de zoom par défaut
  DEFAULT_ZOOM: 12,
  
  // Niveau de zoom pour la vue détaillée
  DETAILED_ZOOM: 15,
};

// Instructions pour obtenir votre token Mapbox :
// 1. Allez sur https://account.mapbox.com/
// 2. Créez un compte gratuit
// 3. Copiez votre token d'accès public
// 4. Remplacez la valeur ACCESS_TOKEN ci-dessus
