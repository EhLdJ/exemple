import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

import RoleBasedRouter from './src/navigation/RoleBasedRouter';
import { QRService } from './src/services/QRService';

const App: React.FC = () => {
  useEffect(() => {
    // Nettoyage automatique des QR expirés au démarrage
    QRService.cleanupExpiredQRs();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider>
        <StatusBar
          barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
          backgroundColor="#2196F3"
          translucent={false}
        />
        <RoleBasedRouter />
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;