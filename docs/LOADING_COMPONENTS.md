# 🔄 Composants de Chargement - Documentation

## 📋 Vue d'ensemble

L'application dispose de plusieurs composants de chargement sophistiqués avec animations fluides et logo intégré pour une expérience utilisateur optimale.

## 🎨 Composants Disponibles

### 1. 🚀 **LoadingScreen** - Écran de chargement principal

Écran de chargement complet affiché au démarrage de l'application.

#### ✨ Fonctionnalités
- **Logo animé** avec rotation et pulsation
- **Cercles concentriques** animés
- **Texte avec points** animés
- **Barre de progression** animée
- **Version et copyright** en bas

#### 🛠️ Utilisation
```typescript
import { LoadingScreen } from '@/components';

<LoadingScreen 
  message="Gestion d'Emprunts" 
  subMessage="Chargement en cours..." 
/>
```

#### 📝 Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `message` | `string` | `'Gestion d\'Emprunts'` | Titre principal |
| `subMessage` | `string` | `'Chargement en cours...'` | Sous-titre |

---

### 2. ⚡ **PageLoader** - Chargement de pages

Loader overlay pour les transitions entre pages.

#### ✨ Fonctionnalités
- **Modal transparent** avec overlay
- **Animation d'entrée/sortie** fluide
- **Icône tournante** avec couleur personnalisable
- **Mode overlay** configurable

#### 🛠️ Utilisation
```typescript
import { PageLoader } from '@/components';

<PageLoader 
  visible={isLoading} 
  message="Chargement des données..."
  color="#4CAF50"
  overlay={true}
/>
```

#### 📝 Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `visible` | `boolean` | - | **Requis** - Visibilité du loader |
| `message` | `string` | `'Chargement...'` | Message affiché |
| `color` | `string` | `'#2196F3'` | Couleur principale |
| `overlay` | `boolean` | `true` | Afficher en overlay modal |

---

### 3. 🔘 **LoadingButton** - Bouton avec chargement

Bouton intelligent avec état de chargement intégré.

#### ✨ Fonctionnalités
- **3 variantes** : primary, secondary, outline
- **3 tailles** : small, medium, large
- **Animation de pression** et pulsation
- **Icône et texte** personnalisables
- **Spinner intégré** pendant le chargement

#### 🛠️ Utilisation
```typescript
import { LoadingButton } from '@/components';

<LoadingButton
  title="Se connecter"
  onPress={handleLogin}
  loading={isLoading}
  loadingText="Connexion..."
  icon="login"
  variant="primary"
  size="medium"
/>
```

#### 📝 Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `title` | `string` | - | **Requis** - Texte du bouton |
| `onPress` | `() => void` | - | **Requis** - Fonction au clic |
| `loading` | `boolean` | `false` | État de chargement |
| `disabled` | `boolean` | `false` | Bouton désactivé |
| `loadingText` | `string` | - | Texte pendant chargement |
| `icon` | `string` | - | Nom de l'icône Material |
| `variant` | `'primary' \| 'secondary' \| 'outline'` | `'primary'` | Style du bouton |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Taille du bouton |
| `color` | `string` | `'#2196F3'` | Couleur principale |

---

### 4. 📱 **QRLoadingScreen** - Chargement QR spécialisé

Écran de chargement dédié à la génération de QR codes.

#### ✨ Fonctionnalités
- **Animation QR** avec effets de rotation
- **Ligne de scan** animée
- **Barre de progression** avec timer
- **Éléments décoratifs** animés
- **Callback de completion**

#### 🛠️ Utilisation
```typescript
import { QRLoadingScreen } from '@/components';

<QRLoadingScreen 
  visible={isGenerating}
  message="Génération de votre QR Code sécurisé"
  timeRemaining={300}
  onComplete={() => setIsGenerating(false)}
/>
```

#### 📝 Props
| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `visible` | `boolean` | - | **Requis** - Visibilité |
| `message` | `string` | `'Génération du QR Code...'` | Message principal |
| `onComplete` | `() => void` | - | Callback fin d'animation |
| `timeRemaining` | `number` | `0` | Temps restant en secondes |

---

## 🎨 Design System

### 🎨 Couleurs par Rôle
```typescript
const LOADING_COLORS = {
  client: '#2196F3',      // Bleu - Interface client
  shopkeeper: '#4CAF50',  // Vert - Interface boutiquier
  error: '#F44336',       // Rouge - Erreurs
  warning: '#FF9800',     // Orange - Avertissements
  success: '#4CAF50',     // Vert - Succès
};
```

### 📏 Tailles Standards
```typescript
const SIZES = {
  small: { padding: 8, fontSize: 14 },
  medium: { padding: 12, fontSize: 16 },
  large: { padding: 16, fontSize: 18 },
};
```

---

## 🚀 Exemples d'Implémentation

### 📱 Dans l'écran de connexion
```typescript
// src/screens/common/LoginScreen.tsx
const LoginScreen = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <LoadingButton
      title="Se connecter"
      onPress={handleLogin}
      loading={isLoading}
      loadingText="Connexion..."
      icon="login"
    />
  );
};
```

### 🏪 Dans le dashboard boutiquier
```typescript
// src/screens/shopkeeper/ShopkeeperDashboardScreen.tsx
const ShopkeeperDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Contenu dashboard */}
      
      <PageLoader 
        visible={isLoading} 
        message="Chargement du tableau de bord..."
        color="#4CAF50"
      />
    </>
  );
};
```

### 📱 Génération QR
```typescript
// src/screens/client/QRGeneratorScreen.tsx
const QRGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <>
      <LoadingButton
        title="Générer QR Code"
        onPress={handleGenerate}
        loading={isGenerating}
        icon="qr-code"
      />
      
      <QRLoadingScreen 
        visible={isGenerating}
        message="Génération sécurisée..."
        timeRemaining={300}
      />
    </>
  );
};
```

---

## 🎭 Animations Incluses

### 🔄 Types d'animations
- **Rotation** : Logo et éléments rotatifs
- **Scale** : Effets de zoom et pulsation
- **Opacity** : Fade in/out fluides
- **Spring** : Animations élastiques naturelles
- **Loop** : Animations continues pendant le chargement

### ⚡ Performance
- **useNativeDriver: true** pour les animations GPU
- **Nettoyage automatique** des animations
- **Optimisations mémoire** intégrées

---

## 🔧 Personnalisation

### 🎨 Thème personnalisé
```typescript
// Créer un thème custom
const customTheme = {
  primary: '#FF6B6B',
  secondary: '#4ECDC4',
  accent: '#45B7D1',
};

<LoadingButton
  title="Action"
  color={customTheme.primary}
  variant="primary"
/>
```

### 📱 Adaptation responsive
```typescript
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const buttonSize = width < 350 ? 'small' : 'medium';

<LoadingButton size={buttonSize} />
```

---

## ✅ Bonnes Pratiques

### 🎯 Utilisation recommandée
1. **LoadingScreen** : Démarrage app et initialisation auth
2. **PageLoader** : Chargement données entre écrans
3. **LoadingButton** : Actions utilisateur (login, envoi)
4. **QRLoadingScreen** : Processus spécialisés (QR, crypto)

### 🚫 À éviter
- ❌ Multiples loaders simultanés
- ❌ Animations trop longues (>3s)
- ❌ Loaders sans feedback utilisateur
- ❌ Animations bloquantes

### ✅ Recommandations
- ✅ Feedback progressif (barres de progression)
- ✅ Messages contextuels informatifs
- ✅ Timeouts et gestion d'erreurs
- ✅ Animations fluides et naturelles

---

## 📊 Performance

### 📈 Métriques cibles
- **Démarrage app** : < 3s avec LoadingScreen
- **Transitions** : < 500ms avec PageLoader
- **Actions** : Feedback immédiat avec LoadingButton
- **QR Generation** : < 2s avec QRLoadingScreen

### 🎯 Optimisations
- Animations natives GPU
- Cleanup automatique
- Lazy loading des composants
- Minimisation des re-renders

---

💡 **Conseil** : Ces composants sont conçus pour s'intégrer parfaitement dans l'écosystème de l'app avec cohérence visuelle et performance optimale !