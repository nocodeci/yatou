const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://192.168.100.191:8081', 'exp://192.168.100.191:8081'],
  credentials: true
}));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Route de base
app.get('/', (req, res) => {
  res.json({
    message: 'API Yatou Delivery',
    version: '1.0.0',
    status: 'running'
  });
});

// Route Mapbox simplifiée
app.get('/api/mapbox/token', (req, res) => {
  try {
    // Utiliser un token public pour le frontend
    const mapboxToken = 'pk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtrcmtoZzA2dm4yanFyd2dteWoxam8ifQ.4JxRLRtSELRMfYnl8Fa1NQ';
    
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

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur Yatou Delivery démarré sur le port ${PORT}`);
  console.log(`📱 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

module.exports = app;
