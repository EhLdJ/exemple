# Application Web - Guide d'Installation et de Démarrage

## 📋 Table des Matières
- [Prérequis](#prérequis)
- [Installation Locale avec WAMP](#installation-locale-avec-wamp)
- [Configuration de la Base de Données](#configuration-de-la-base-de-données)
- [Installation du Backend](#installation-du-backend)
- [Installation du Frontend](#installation-du-frontend)
- [Démarrage de l'Application](#démarrage-de-lapplication)
- [Migrations de Base de Données](#migrations-de-base-de-données)
- [Déploiement en Production](#déploiement-en-production)
- [Dépannage](#dépannage)

## 🔧 Prérequis

### Logiciels Requis
- **Node.js** (version 18.x ou supérieure) - [Télécharger](https://nodejs.org/)
- **npm** ou **yarn** (gestionnaire de paquets)
- **WAMP Server** (pour l'environnement local) - [Télécharger](https://www.wampserver.com/)
- **Git** - [Télécharger](https://git-scm.com/)

### Vérification des Versions
```bash
node --version    # v18.x.x ou supérieur
npm --version     # 9.x.x ou supérieur
git --version     # 2.x.x ou supérieur
```

## 🏠 Installation Locale avec WAMP

### 1. Installation de WAMP Server

1. **Télécharger WAMP Server** depuis le site officiel
2. **Installer WAMP** en suivant l'assistant d'installation
3. **Démarrer WAMP** - L'icône doit être verte dans la barre des tâches
4. **Vérifier l'installation** en allant sur `http://localhost`

### 2. Configuration de WAMP

1. **Clic droit sur l'icône WAMP** → Apache → Version → Sélectionner la dernière version
2. **Clic droit sur l'icône WAMP** → MySQL → Version → Sélectionner la dernière version
3. **Clic droit sur l'icône WAMP** → PHP → Version → Sélectionner PHP 8.x

### 3. Accès à phpMyAdmin
- URL: `http://localhost/phpmyadmin`
- Utilisateur: `root`
- Mot de passe: (laisser vide par défaut)

## 🗄️ Configuration de la Base de Données

### 1. Création de la Base de Données

1. **Ouvrir phpMyAdmin** (`http://localhost/phpmyadmin`)
2. **Cliquer sur "Nouvelle base de données"**
3. **Nom de la base**: `nom_de_votre_app`
4. **Interclassement**: `utf8mb4_unicode_ci`
5. **Cliquer sur "Créer"**

### 2. Configuration des Variables d'Environnement

Créer un fichier `.env` dans le dossier racine du backend :

```env
# Base de données
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=nom_de_votre_app

# Application
PORT=3000
NODE_ENV=development

# JWT (si utilisé)
JWT_SECRET=votre_secret_jwt_ultra_securise

# CORS
FRONTEND_URL=http://localhost:3001
```

## 🚀 Installation du Backend

### 1. Cloner le Projet
```bash
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

### 2. Installation des Dépendances Backend
```bash
cd backend
npm install
```

### 3. Structure du Backend (TypeScript + TypeORM)

Si le projet n'est pas encore créé, voici la structure recommandée :

```
backend/
├── src/
│   ├── entities/           # Entités TypeORM
│   ├── controllers/        # Contrôleurs API
│   ├── services/          # Logique métier
│   ├── routes/            # Routes Express
│   ├── middleware/        # Middlewares
│   ├── migrations/        # Migrations TypeORM
│   ├── config/            # Configuration
│   └── app.ts            # Point d'entrée
├── .env                   # Variables d'environnement
├── package.json
├── tsconfig.json
└── ormconfig.json        # Configuration TypeORM
```

### 4. Configuration TypeORM

Créer/modifier `ormconfig.json` :

```json
{
  "type": "mysql",
  "host": "localhost",
  "port": 3306,
  "username": "root",
  "password": "",
  "database": "nom_de_votre_app",
  "synchronize": false,
  "logging": true,
  "entities": ["src/entities/**/*.ts"],
  "migrations": ["src/migrations/**/*.ts"],
  "subscribers": ["src/subscribers/**/*.ts"],
  "cli": {
    "entitiesDir": "src/entities",
    "migrationsDir": "src/migrations",
    "subscribersDir": "src/subscribers"
  }
}
```

## 🎨 Installation du Frontend

### 1. Installation des Dépendances Frontend
```bash
cd frontend
npm install
```

### 2. Configuration Frontend

Créer un fichier `.env` dans le dossier frontend :

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

## ▶️ Démarrage de l'Application

### 1. Démarrage Complet (Recommandé)

**Terminal 1 - Backend :**
```bash
cd backend
npm run dev
# ou
npm start
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm start
```

### 2. Vérification des Services

- **Backend API**: `http://localhost:3000`
- **Frontend**: `http://localhost:3001`
- **Base de données**: Via phpMyAdmin `http://localhost/phpmyadmin`
- **WAMP**: `http://localhost`

### 3. Scripts Package.json Recommandés

**Backend package.json :**
```json
{
  "scripts": {
    "start": "node dist/app.js",
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert"
  }
}
```

## 🔄 Migrations de Base de Données

### 1. Créer une Migration
```bash
cd backend
npm run typeorm migration:generate -- -n NomDeLaMigration
```

### 2. Exécuter les Migrations
```bash
npm run typeorm migration:run
```

### 3. Annuler une Migration
```bash
npm run typeorm migration:revert
```

### 4. Première Migration (Initialisation)
```bash
# Créer la structure initiale
npm run typeorm migration:generate -- -n InitialMigration
npm run typeorm migration:run
```

## 🌐 Déploiement en Production

### 1. Prérequis Production
- Serveur avec Node.js
- Base de données MySQL distante
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)

### 2. Variables d'Environnement Production

```env
# Base de données production
DB_TYPE=mysql
DB_HOST=votre-serveur-mysql.com
DB_PORT=3306
DB_USERNAME=votre_user_prod
DB_PASSWORD=votre_password_securise
DB_DATABASE=votre_app_prod

# Application
PORT=3000
NODE_ENV=production

# Sécurité
JWT_SECRET=votre_secret_production_ultra_securise
FRONTEND_URL=https://votre-domaine.com
```

### 3. Build de Production

**Backend :**
```bash
cd backend
npm run build
npm start
```

**Frontend :**
```bash
cd frontend
npm run build
# Les fichiers statiques seront dans le dossier build/
```

### 4. Serveur Web (Nginx recommandé)

Configuration Nginx basique :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend
    location / {
        root /path/to/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Dépannage

### Problèmes Courants

**1. WAMP ne démarre pas**
- Vérifier qu'aucun autre serveur n'utilise les ports 80/3306
- Redémarrer en tant qu'administrateur
- Vérifier les logs dans WAMP

**2. Erreur de connexion à la base de données**
```bash
# Vérifier la connexion MySQL
mysql -u root -p
```

**3. Port déjà utilisé**
```bash
# Trouver le processus utilisant le port
netstat -ano | findstr :3000
# Tuer le processus (Windows)
taskkill /PID <PID> /F
```

**4. Erreurs TypeORM**
- Vérifier `ormconfig.json`
- S'assurer que la base de données existe
- Vérifier les permissions de l'utilisateur

**5. Problèmes de CORS**
- Vérifier la configuration CORS dans le backend
- S'assurer que `FRONTEND_URL` est correct

### Logs et Debugging

**Backend :**
```bash
# Mode debug
DEBUG=* npm run dev
```

**Base de données :**
- Activer les logs SQL dans `ormconfig.json`
- Utiliser phpMyAdmin pour vérifier les données

### Contacts et Support

- **Issues GitHub**: [Lien vers les issues]
- **Documentation**: [Lien vers la documentation]
- **Contact**: votre-email@example.com

---

## 📝 Notes Importantes

1. **Sécurité**: Ne jamais committer les fichiers `.env` en production
2. **Backup**: Toujours sauvegarder la base de données avant les migrations
3. **Testing**: Tester en local avant chaque déploiement
4. **Monitoring**: Mettre en place des logs et monitoring en production

---

*Dernière mise à jour: [Date]*