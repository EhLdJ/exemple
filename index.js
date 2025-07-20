import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './package.json';

// Enregistrer l'application
AppRegistry.registerComponent(appName, () => App);