const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const loanRoutes = require('./routes/loans');
const qrRoutes = require('./routes/qr');
const shopkeeperRoutes = require('./routes/shopkeeper');
const clientRoutes = require('./routes/client');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
  }
});

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(limiter);
app.use(compression());

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://10.0.2.2:3000'], // Pour émulateur Android
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/shopkeeper', shopkeeperRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/payments', paymentRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Gestion d\'Emprunts',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      loans: '/api/loans',
      qr: '/api/qr',
      shopkeeper: '/api/shopkeeper',
      client: '/api/client',
      payments: '/api/payments'
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint non trouvé',
    method: req.method,
    url: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Erreur globale:', err);
  
  // Erreurs de validation Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Données de validation invalides',
      details: err.details.map(detail => detail.message)
    });
  }

  // Erreurs Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation des données',
      details: err.errors.map(e => e.message)
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: 'Cette donnée existe déjà',
      field: err.errors[0]?.path
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré'
    });
  }

  // Erreurs par défaut
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Erreur interne du serveur';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie avec succès.');

    // Synchronisation des modèles (uniquement en développement)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modèles synchronisés avec la base de données.');
    }

    // Démarrage du serveur
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
      console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📍 URL locale: http://localhost:${PORT}`);
      console.log(`📍 URL réseau: http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur:', error);
    process.exit(1);
  }
};

// Gestion des signaux de terminaison
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur...');
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée.');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Signal SIGTERM reçu. Arrêt gracieux...');
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée.');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
  }
  process.exit(0);
});

// Démarrer le serveur
startServer();

module.exports = app;