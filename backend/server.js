const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const deliveryRoutes = require('./routes/deliveries');
const userRoutes = require('./routes/users');
const mapboxRoutes = require('./routes/mapbox');
const directionsRoutes = require('./routes/directions');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());

// Middleware CORS
app.use(cors({
  origin: ['http://localhost:8081', 'http://192.168.100.191:8081', 'exp://192.168.100.191:8081'],
  credentials: true
}));

// Middleware de logging
app.use(morgan('combined'));

// Middleware pour parser le JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes de base
app.get('/', (req, res) => {
  res.json({
    message: 'API Yatou Delivery',
    version: '1.0.0',
    status: 'running'
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mapbox', mapboxRoutes);
app.use('/api', directionsRoutes);

// Middleware de gestion d'erreurs
app.use(errorHandler);

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Yatou Delivery démarré sur le port ${PORT}`);
  console.log(`📱 Mode: ${process.env.NODE_ENV}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🌐 URL réseau: http://192.168.100.191:${PORT}`);
});

module.exports = app;
