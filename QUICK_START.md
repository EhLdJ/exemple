# 🚀 Démarrage Rapide - Gestion d'Emprunts

## ⚡ Lancement en 5 minutes

### 1️⃣ Prérequis
```bash
# Vérifier Node.js (16+)
node --version

# Vérifier PostgreSQL
psql --version
```

### 2️⃣ Installation
```bash
# Clone et installation
git clone <repository-url>
cd GestionEmprunts
npm run setup
```

### 3️⃣ Base de données
```bash
# Créer la base PostgreSQL
createdb gestion_emprunts

# Configuration backend
cd backend
cp .env.example .env
# Éditer .env avec vos paramètres DB

# Initialiser la base
npm run setup
npm run seed  # Données de test
```

### 4️⃣ Démarrage
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
npm start

# Terminal 3: Mobile
npm run android  # ou npm run ios
```

## 🎯 Test de l'Application

### Dashboard Client
1. **Connexion** : `+33123456789` / `client123`
2. **Navigation** : Onglet "Emprunts" automatique
3. **Test QR** : Cliquer "Générer QR" sur un emprunt

### Dashboard Boutiquier  
1. **Connexion** : `+33987654321` / `shop123`
2. **Navigation** : Dashboard "Gestion" automatique
3. **Test Scan** : Onglet "Scanner QR"

## 🔧 Commandes Utiles

```bash
# Réinitialiser la base
cd backend && npm run setup

# Régénérer les données de test
cd backend && npm run seed

# Vérifier les logs
cd backend && tail -f logs/app.log

# Reset complet
rm -rf node_modules && npm install
```

## 🏗️ Architecture Rapide

```
📱 React Native App (Port Metro)
    ↕️ API Calls
🖥️ Express.js Backend (Port 3000)
    ↕️ Database Queries  
🗄️ PostgreSQL Database (Port 5432)
```

## 🚨 Dépannage Express

### "Cannot connect to database"
```bash
# Vérifier PostgreSQL
sudo service postgresql start

# Créer l'utilisateur
sudo -u postgres createuser --interactive
```

### "Port 3000 already in use"
```bash
# Tuer le processus
lsof -ti:3000 | xargs kill -9
```

### "Module not found"
```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
```

## 📱 Dépannage React Native

### "Metro bundler error"
```bash
# Reset Metro cache
npx react-native start --reset-cache
```

### "Android build failed"
```bash
# Clean build
cd android && ./gradlew clean
cd .. && npm run android
```

### "iOS build failed"
```bash
# Clean iOS
cd ios && xcodebuild clean
cd .. && npm run ios
```

## 🎨 Personnalisation Rapide

### Couleurs Principale
- **Client** : `#2196F3` (Bleu)
- **Boutiquier** : `#4CAF50` (Vert)
- **Erreur** : `#F44336` (Rouge)

### Modifier les couleurs
```typescript
// src/types/index.ts
export const COLORS = {
  client: '#2196F3',
  shopkeeper: '#4CAF50',
  // ...
}
```

## 📊 Status de Développement

| Fonctionnalité | Status | Note |
|---------------|--------|------|
| ✅ Authentification | Complete | Login/logout fonctionnel |
| ✅ Navigation Rôles | Complete | Dashboard conditionnel |
| ✅ Dashboard Client | Complete | Liste emprunts + UI |
| ✅ Dashboard Boutiquier | Complete | Stats + actions rapides |
| 🚧 QR Code | En cours | Service créé, UI à finaliser |
| 🚧 API Backend | En cours | Modèles + routes de base |
| ⏳ Assistant IA | Planifié | Intégration prévue V1.1 |
| ⏳ Sync Offline | Planifié | SQLite + sync cloud |

## 🔗 Liens Utiles

- **API Docs** : http://localhost:3000/
- **Health Check** : http://localhost:3000/health
- **Metro Bundler** : http://localhost:8081

---

💡 **Tip** : Gardez 3 terminaux ouverts (Backend / Metro / Build) pour un développement optimal !