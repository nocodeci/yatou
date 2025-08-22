const express = require('express');
const router = express.Router();

// Route pour récupérer le token Mapbox de manière sécurisée
router.get('/token', (req, res) => {
  try {
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      return res.status(500).json({ 
        error: 'Token Mapbox non configuré' 
      });
    }
    
    res.json({ 
      token: mapboxToken,
      message: 'Token Mapbox récupéré avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du token Mapbox:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération du token Mapbox' 
    });
  }
});

module.exports = router;
