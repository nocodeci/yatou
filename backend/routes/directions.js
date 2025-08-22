const express = require('express');
const { Client } = require('@googlemaps/google-maps-services-js');
const router = express.Router();

// Créer une instance du client Google Maps
const client = new Client({});

// Clé API Google Maps
const GOOGLE_MAPS_API_KEY = 'AIzaSyBOwNDFwx9EerTB29GCdwyCyaaQIDgs9UI';

router.get('/directions', async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required.' });
  }

  try {
    console.log('Calcul itinéraire backend:', { origin, destination });

    // Utiliser la bibliothèque officielle Google Maps Services
    const response = await client.directions({
      params: {
        origin: origin,
        destination: destination,
        key: GOOGLE_MAPS_API_KEY,
        mode: 'driving', // Mode de transport
        language: 'fr', // Langue française
        units: 'metric', // Unités métriques
      },
      timeout: 10000, // Timeout de 10 secondes
    });

    console.log('Réponse Google Directions:', response.data.status);

    if (response.data.status === 'OK') {
      res.json(response.data);
    } else {
      console.error('Erreur Google Directions:', response.data.error_message);
      res.status(400).json({ 
        error: 'Failed to fetch directions.',
        details: response.data.error_message 
      });
    }
  } catch (error) {
    console.error('Error fetching directions:', error);
    res.status(500).json({ error: 'Failed to fetch directions.' });
  }
});

// Route pour l'autocomplétion des lieux
router.get('/places/autocomplete', async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.status(400).json({ error: 'Input query is required.' });
  }

  try {
    console.log('Recherche autocomplétion:', input);

    const response = await client.placeAutocomplete({
      params: {
        input: input,
        key: GOOGLE_MAPS_API_KEY,
        language: 'fr',
        components: 'country:ci', // Restreindre à la Côte d'Ivoire
        location: '7.6833,-5.0333', // Centre de Bouaké
        radius: 50000, // Rayon de 50km
      },
      timeout: 10000,
    });

    console.log('Réponse autocomplétion:', response.data.status);

    if (response.data.status === 'OK') {
      res.json(response.data);
    } else {
      console.error('Erreur autocomplétion:', response.data.error_message);
      res.status(400).json({ 
        error: 'Failed to fetch autocomplete results.',
        details: response.data.error_message 
      });
    }
  } catch (error) {
    console.error('Error fetching autocomplete:', error);
    res.status(500).json({ error: 'Failed to fetch autocomplete results.' });
  }
});

// Route pour obtenir les détails d'un lieu
router.get('/places/details', async (req, res) => {
  const { place_id } = req.query;

  if (!place_id) {
    return res.status(400).json({ error: 'Place ID is required.' });
  }

  try {
    console.log('Détails du lieu:', place_id);

    const response = await client.placeDetails({
      params: {
        place_id: place_id,
        key: GOOGLE_MAPS_API_KEY,
        language: 'fr',
        fields: 'geometry,formatted_address,name',
      },
      timeout: 10000,
    });

    console.log('Réponse détails lieu:', response.data.status);

    if (response.data.status === 'OK') {
      res.json(response.data);
    } else {
      console.error('Erreur détails lieu:', response.data.error_message);
      res.status(400).json({ 
        error: 'Failed to fetch place details.',
        details: response.data.error_message 
      });
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details.' });
  }
});

module.exports = router;
