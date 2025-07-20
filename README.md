# Application avec Thème et Langues

Une application React moderne avec gestion des thèmes (clair/sombre) et support multilingue (français/anglais).

## Fonctionnalités

- 🎨 **Gestion des thèmes** : Basculement entre mode clair et mode sombre
- 🌐 **Support multilingue** : Français et anglais
- 💾 **Persistance** : Les préférences sont sauvegardées dans le localStorage
- 📱 **Design responsive** : Interface adaptée à tous les écrans
- ✨ **Animations fluides** : Transitions CSS modernes

## Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run dev

# Construction pour la production
npm run build
```

## Structure du projet

```
src/
├── composants/           # Composants React
│   ├── BoutonTheme.tsx
│   ├── EnTete.tsx
│   ├── SelecteurLangue.tsx
│   └── ContenuPrincipal.tsx
├── contextes/            # Contextes React
│   ├── ContexteTheme.tsx
│   └── ContexteLangue.tsx
├── traductions/          # Fichiers de traduction
│   ├── francais.ts
│   └── anglais.ts
├── hooks/               # Hooks personnalisés
│   └── utiliserTraduction.ts
├── styles/              # Styles CSS
│   └── styles.css
├── types/               # Types TypeScript
│   └── types.ts
├── Application.tsx      # Composant principal
└── principal.tsx        # Point d'entrée
```

## Technologies utilisées

- **React 18** avec TypeScript
- **Vite** pour le build
- **CSS Variables** pour les thèmes
- **Context API** pour la gestion d'état
- **LocalStorage** pour la persistance

## Utilisation

### Basculer le thème
Cliquez sur le bouton thème dans l'en-tête pour basculer entre le mode clair et sombre.

### Changer de langue
Utilisez le sélecteur de langue dans l'en-tête pour passer du français à l'anglais.

Les préférences de thème et de langue sont automatiquement sauvegardées et restaurées lors des visites ultérieures.