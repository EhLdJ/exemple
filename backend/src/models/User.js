const bcrypt = require('bcryptjs');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Méthode pour vérifier le mot de passe
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    // Méthode pour obtenir les données publiques
    toPublicJSON() {
      const userData = this.toJSON();
      delete userData.password;
      delete userData.sms_code;
      delete userData.sms_expires_at;
      delete userData.email_verification_token;
      delete userData.password_reset_token;
      delete userData.password_reset_expires;
      return userData;
    }

    // Vérifier si l'utilisateur est client
    isClient() {
      return this.role === 'client';
    }

    // Vérifier si l'utilisateur est boutiquier
    isShopkeeper() {
      return this.role === 'shopkeeper';
    }

    // Vérifier si l'utilisateur est admin
    isAdmin() {
      return this.role === 'admin';
    }

    // Générer un code SMS
    generateSMSCode() {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      this.sms_code = code;
      this.sms_expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      return code;
    }

    // Vérifier le code SMS
    validateSMSCode(code) {
      if (!this.sms_code || !this.sms_expires_at) {
        return false;
      }
      
      if (new Date() > this.sms_expires_at) {
        return false;
      }
      
      return this.sms_code === code;
    }

    // Nettoyer les codes expirés
    clearExpiredCodes() {
      if (this.sms_expires_at && new Date() > this.sms_expires_at) {
        this.sms_code = null;
        this.sms_expires_at = null;
      }
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[+]?[0-9]{8,15}$/
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('client', 'shopkeeper', 'admin'),
      allowNull: false,
      defaultValue: 'client'
    },
    shop_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isShopkeeperShopName() {
          if (this.role === 'shopkeeper' && !this.shop_name) {
            throw new Error('Le nom de la boutique est requis pour les boutiquiers');
          }
        }
      }
    },
    identity_card: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isClientIdentityCard() {
          if (this.role === 'client' && !this.identity_card) {
            throw new Error('La carte d\'identité est requise pour les clients');
          }
        }
      }
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    sms_code: {
      type: DataTypes.STRING(6),
      allowNull: true
    },
    sms_expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    email_verification_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    password_reset_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    password_reset_expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    last_login_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    invitation_token: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    invited_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: {
        notifications: {
          sms: true,
          email: true,
          push: true
        },
        language: 'fr',
        currency: 'FCFA'
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    hooks: {
      // Hacher le mot de passe avant création
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hacher le mot de passe avant modification
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Nettoyer les codes expirés avant validation
      beforeValidate: (user) => {
        user.clearExpiredCodes();
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['phone']
      },
      {
        unique: true,
        fields: ['email'],
        where: {
          email: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      },
      {
        fields: ['role']
      },
      {
        fields: ['is_verified']
      },
      {
        fields: ['is_active']
      }
    ]
  });

  return User;
};