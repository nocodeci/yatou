const express = require('express');
const app = express();
const PORT = 3000;

// Middleware CORS simple
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'Serveur de test fonctionnel',
    timestamp: new Date().toISOString()
  });
});

// Route Mapbox simplifiée
app.get('/api/mapbox/token', (req, res) => {
  res.json({
    token: 'sk.eyJ1IjoieW9oYW4wNzA3IiwiYSI6ImNtZWtwbDRkbDA2Y2IybHM5NjhrMXVucmYifQ.7vbwJ89hanJIWR5U0iAcpA',
    message: 'Token Mapbox récupéré avec succès'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de test démarré sur le port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});
