const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Configuration de la base de données
const sequelize = new Sequelize(
  process.env.DB_NAME || 'gestion_emprunts',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
    },
  }
);

// Import des modèles
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Product = require('./Product')(sequelize, Sequelize.DataTypes);
const Loan = require('./Loan')(sequelize, Sequelize.DataTypes);
const LoanProduct = require('./LoanProduct')(sequelize, Sequelize.DataTypes);
const Payment = require('./Payment')(sequelize, Sequelize.DataTypes);
const QRCode = require('./QRCode')(sequelize, Sequelize.DataTypes);

// Définition des associations
const models = {
  User,
  Product,
  Loan,
  LoanProduct,
  Payment,
  QRCode,
};

// Associations User
User.hasMany(Loan, { 
  as: 'ClientLoans',
  foreignKey: 'client_id' 
});
User.hasMany(Loan, { 
  as: 'ShopkeeperLoans',
  foreignKey: 'shopkeeper_id' 
});
User.hasMany(Product, { 
  as: 'Products',
  foreignKey: 'shopkeeper_id' 
});

// Associations Loan
Loan.belongsTo(User, { 
  as: 'Client',
  foreignKey: 'client_id' 
});
Loan.belongsTo(User, { 
  as: 'Shopkeeper',
  foreignKey: 'shopkeeper_id' 
});
Loan.hasMany(LoanProduct, { 
  as: 'LoanProducts',
  foreignKey: 'loan_id' 
});
Loan.hasMany(Payment, { 
  as: 'Payments',
  foreignKey: 'loan_id' 
});
Loan.hasOne(QRCode, { 
  as: 'QRCode',
  foreignKey: 'loan_id' 
});

// Associations Product
Product.belongsTo(User, { 
  as: 'Shopkeeper',
  foreignKey: 'shopkeeper_id' 
});
Product.hasMany(LoanProduct, { 
  as: 'LoanProducts',
  foreignKey: 'product_id' 
});

// Associations LoanProduct
LoanProduct.belongsTo(Loan, { 
  as: 'Loan',
  foreignKey: 'loan_id' 
});
LoanProduct.belongsTo(Product, { 
  as: 'Product',
  foreignKey: 'product_id' 
});

// Associations Payment
Payment.belongsTo(Loan, { 
  as: 'Loan',
  foreignKey: 'loan_id' 
});
Payment.belongsTo(User, { 
  as: 'ProcessedBy',
  foreignKey: 'processed_by' 
});

// Associations QRCode
QRCode.belongsTo(Loan, { 
  as: 'Loan',
  foreignKey: 'loan_id' 
});

// Méthodes utilitaires
const db = {
  sequelize,
  Sequelize,
  models,
  ...models,
};

// Fonction de synchronisation
db.sync = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✅ Base de données synchronisée');
  } catch (error) {
    console.error('❌ Erreur de synchronisation:', error);
    throw error;
  }
};

// Fonction de test de connexion
db.testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données établie');
    return true;
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données:', error);
    return false;
  }
};

// Fonction de fermeture de connexion
db.close = async () => {
  try {
    await sequelize.close();
    console.log('✅ Connexion fermée');
  } catch (error) {
    console.error('❌ Erreur lors de la fermeture:', error);
    throw error;
  }
};

module.exports = db;