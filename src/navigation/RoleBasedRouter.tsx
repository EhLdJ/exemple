import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { 
  RootStackParamList, 
  AuthStackParamList, 
  ClientStackParamList, 
  ShopkeeperStackParamList,
  UserRole 
} from '@/types';
import AuthService from '@/services/AuthService';

// Import des écrans communs
import LoginScreen from '@/screens/common/LoginScreen';
import RegisterChoiceScreen from '@/screens/common/RegisterChoiceScreen';
import ClientRegisterScreen from '@/screens/common/ClientRegisterScreen';
import ShopkeeperRegisterScreen from '@/screens/common/ShopkeeperRegisterScreen';
import SMSVerificationScreen from '@/screens/common/SMSVerificationScreen';

// Import des écrans clients
import MyLoansScreen from '@/screens/client/MyLoansScreen';
import LoanDetailsScreen from '@/screens/client/LoanDetailsScreen';
import QRGeneratorScreen from '@/screens/client/QRGeneratorScreen';
import AIAssistantScreen from '@/screens/client/AIAssistantScreen';
import ClientProfileScreen from '@/screens/client/ClientProfileScreen';

// Import des écrans boutiquiers
import ShopkeeperDashboardScreen from '@/screens/shopkeeper/ShopkeeperDashboardScreen';
import NewLoanScreen from '@/screens/shopkeeper/NewLoanScreen';
import ClientSelectionScreen from '@/screens/shopkeeper/ClientSelectionScreen';
import ProductSelectionScreen from '@/screens/shopkeeper/ProductSelectionScreen';
import LoanSummaryScreen from '@/screens/shopkeeper/LoanSummaryScreen';
import QRScannerScreen from '@/screens/shopkeeper/QRScannerScreen';
import AllLoansScreen from '@/screens/shopkeeper/AllLoansScreen';
import InventoryScreen from '@/screens/shopkeeper/InventoryScreen';
import ShopkeeperProfileScreen from '@/screens/shopkeeper/ShopkeeperProfileScreen';

// Création des navigateurs
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ClientTab = createBottomTabNavigator<ClientStackParamList>();
const ShopkeeperTab = createBottomTabNavigator<ShopkeeperStackParamList>();

// Composant de chargement
const LoadingScreen: React.FC = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
    <ActivityIndicator size="large" color="#2196F3" />
    <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
      Chargement...
    </Text>
  </View>
);

// Stack d'authentification
const AuthNavigator: React.FC = () => (
  <AuthStack.Navigator 
    screenOptions={{ 
      headerShown: false,
      gestureEnabled: true,
      animation: 'slide_from_right'
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
    <AuthStack.Screen name="ClientRegister" component={ClientRegisterScreen} />
    <AuthStack.Screen name="ShopkeeperRegister" component={ShopkeeperRegisterScreen} />
    <AuthStack.Screen name="SMSVerification" component={SMSVerificationScreen} />
  </AuthStack.Navigator>
);

// Navigation pour les clients
const ClientNavigator: React.FC = () => (
  <ClientTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'MyLoans':
            iconName = 'list-alt';
            break;
          case 'AIAssistant':
            iconName = 'smart-toy';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'help';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      headerStyle: {
        backgroundColor: '#2196F3',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <ClientTab.Screen 
      name="MyLoans" 
      component={MyLoansScreen}
      options={{ 
        title: 'Mes Emprunts',
        tabBarLabel: 'Emprunts'
      }}
    />
    <ClientTab.Screen 
      name="AIAssistant" 
      component={AIAssistantScreen}
      options={{ 
        title: 'Assistant IA',
        tabBarLabel: 'Assistant'
      }}
    />
    <ClientTab.Screen 
      name="Profile" 
      component={ClientProfileScreen}
      options={{ 
        title: 'Mon Profil',
        tabBarLabel: 'Profil'
      }}
    />
  </ClientTab.Navigator>
);

// Stack pour les détails d'emprunts clients (modales)
const ClientStackNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={{ presentation: 'modal' }}>
    <RootStack.Screen 
      name="Main" 
      component={ClientNavigator}
      options={{ headerShown: false }}
    />
    <RootStack.Screen 
      name="LoanDetails" 
      component={LoanDetailsScreen}
      options={{ title: 'Détails de l\'emprunt' }}
    />
    <RootStack.Screen 
      name="QRGenerator" 
      component={QRGeneratorScreen}
      options={{ title: 'Générer QR Code' }}
    />
  </RootStack.Navigator>
);

// Navigation pour les boutiquiers
const ShopkeeperNavigator: React.FC = () => (
  <ShopkeeperTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'NewLoan':
            iconName = 'add-circle';
            break;
          case 'QRScanner':
            iconName = 'qr-code-scanner';
            break;
          case 'AllLoans':
            iconName = 'list';
            break;
          case 'Inventory':
            iconName = 'inventory';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'help';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 5,
        paddingBottom: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '500',
      },
      headerStyle: {
        backgroundColor: '#4CAF50',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <ShopkeeperTab.Screen 
      name="Dashboard" 
      component={ShopkeeperDashboardScreen}
      options={{ 
        title: 'Tableau de Bord',
        tabBarLabel: 'Accueil'
      }}
    />
    <ShopkeeperTab.Screen 
      name="NewLoan" 
      component={NewLoanScreen}
      options={{ 
        title: 'Nouvel Emprunt',
        tabBarLabel: 'Nouveau'
      }}
    />
    <ShopkeeperTab.Screen 
      name="QRScanner" 
      component={QRScannerScreen}
      options={{ 
        title: 'Scanner QR',
        tabBarLabel: 'Scanner'
      }}
    />
    <ShopkeeperTab.Screen 
      name="AllLoans" 
      component={AllLoansScreen}
      options={{ 
        title: 'Tous les Emprunts',
        tabBarLabel: 'Emprunts'
      }}
    />
    <ShopkeeperTab.Screen 
      name="Inventory" 
      component={InventoryScreen}
      options={{ 
        title: 'Inventaire',
        tabBarLabel: 'Stock'
      }}
    />
    <ShopkeeperTab.Screen 
      name="Profile" 
      component={ShopkeeperProfileScreen}
      options={{ 
        title: 'Mon Profil',
        tabBarLabel: 'Profil'
      }}
    />
  </ShopkeeperTab.Navigator>
);

// Stack pour les écrans modaux boutiquiers
const ShopkeeperStackNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={{ presentation: 'modal' }}>
    <RootStack.Screen 
      name="Main" 
      component={ShopkeeperNavigator}
      options={{ headerShown: false }}
    />
    <RootStack.Screen 
      name="ClientSelection" 
      component={ClientSelectionScreen}
      options={{ title: 'Sélectionner un Client' }}
    />
    <RootStack.Screen 
      name="ProductSelection" 
      component={ProductSelectionScreen}
      options={{ title: 'Sélectionner des Produits' }}
    />
    <RootStack.Screen 
      name="LoanSummary" 
      component={LoanSummaryScreen}
      options={{ title: 'Résumé de l\'Emprunt' }}
    />
  </RootStack.Navigator>
);

// Composant principal du routeur basé sur les rôles
const RoleBasedRouter: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState(AuthService.getAuthState());

  useEffect(() => {
    // Initialiser l'authentification
    const initializeAuth = async () => {
      await AuthService.initialize();
      setIsLoading(false);
    };

    initializeAuth();

    // S'abonner aux changements d'état d'authentification
    const unsubscribe = AuthService.subscribe((newState) => {
      setAuthState(newState);
      setIsLoading(newState.isLoading);
    });

    return unsubscribe;
  }, []);

  // Afficher l'écran de chargement
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {!authState.isAuthenticated ? (
          // Utilisateur non connecté - afficher les écrans d'authentification
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // Utilisateur connecté - redirection basée sur le rôle
          <RootStack.Screen 
            name="Main" 
            component={
              authState.user?.role === UserRole.CLIENT 
                ? ClientStackNavigator 
                : ShopkeeperStackNavigator
            } 
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RoleBasedRouter;