import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ClientStackParamList } from '@/types';
import { QRLoadingScreen, LoadingButton } from '@/components';

type Props = {
  navigation: NativeStackNavigationProp<ClientStackParamList, 'QRGenerator'>;
  route: RouteProp<ClientStackParamList, 'QRGenerator'>;
};

const QRGeneratorScreen: React.FC<Props> = ({ navigation, route }) => {
  const { loanId } = route.params;
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQR = () => {
    setIsGenerating(true);
    // Simuler la génération du QR
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#666" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Icon name="qr-code" size={80} color="#2196F3" />
        <Text style={styles.title}>Générateur QR</Text>
        <Text style={styles.subtitle}>
          Emprunt ID: {loanId}{'\n'}
          Générez votre QR code de paiement
        </Text>
        
        <LoadingButton
          title="Générer QR Code"
          onPress={handleGenerateQR}
          loading={isGenerating}
          loadingText="Génération..."
          icon="qr-code"
          style={styles.generateButton}
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
      </View>

      <QRLoadingScreen 
        visible={isGenerating}
        message="Génération de votre QR Code sécurisé"
        timeRemaining={300}
        onComplete={() => setIsGenerating(false)}
      />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  generateButton: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#666',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRGeneratorScreen;