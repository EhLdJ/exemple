import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthStackParamList } from '@/types';

type RegisterChoiceScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList, 
  'RegisterChoice'
>;

interface Props {
  navigation: RegisterChoiceScreenNavigationProp;
}

const { width } = Dimensions.get('window');

const RegisterChoiceScreen: React.FC<Props> = ({ navigation }) => {
  const handleClientRegister = () => {
    navigation.navigate('ClientRegister');
  };

  const handleShopkeeperRegister = () => {
    navigation.navigate('ShopkeeperRegister');
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
          <Icon name="arrow-back" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre profil</Text>
          <Text style={styles.subtitle}>
            Sélectionnez le type de compte que vous souhaitez créer
          </Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {/* Option Client */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.clientCard]} 
            onPress={handleClientRegister}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, styles.clientIcon]}>
                <Icon name="person" size={40} color="#2196F3" />
              </View>
              <Text style={[styles.optionTitle, styles.clientTitle]}>Je suis un Client</Text>
            </View>
            
            <Text style={styles.optionDescription}>
              J'emprunte des produits chez des boutiquiers et je souhaite gérer mes emprunts
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Voir mes emprunts</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Générer des QR codes</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Assistant IA</Text>
              </View>
            </View>

            <View style={styles.process}>
              <Text style={styles.processTitle}>Processus d'inscription :</Text>
              <Text style={styles.processText}>Carte d'identité → SMS → Activation</Text>
            </View>
          </TouchableOpacity>

          {/* Option Boutiquier */}
          <TouchableOpacity 
            style={[styles.optionCard, styles.shopkeeperCard]} 
            onPress={handleShopkeeperRegister}
          >
            <View style={styles.optionHeader}>
              <View style={[styles.iconContainer, styles.shopkeeperIcon]}>
                <Icon name="store" size={40} color="#4CAF50" />
              </View>
              <Text style={[styles.optionTitle, styles.shopkeeperTitle]}>Je suis un Boutiquier</Text>
            </View>
            
            <Text style={styles.optionDescription}>
              Je prête des produits à mes clients et je souhaite gérer ma boutique
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Créer des emprunts</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Scanner les QR codes</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>Gérer l'inventaire</Text>
              </View>
            </View>

            <View style={styles.process}>
              <Text style={styles.processTitle}>Processus d'inscription :</Text>
              <Text style={styles.processText}>Invitation → SMS + Email → Activation</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Déjà un compte ?{' '}
            <Text style={styles.loginLink} onPress={handleBackToLogin}>
              Se connecter
            </Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  options: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  clientCard: {
    borderColor: '#e3f2fd',
  },
  shopkeeperCard: {
    borderColor: '#e8f5e8',
  },
  optionHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  clientIcon: {
    backgroundColor: '#e3f2fd',
  },
  shopkeeperIcon: {
    backgroundColor: '#e8f5e8',
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clientTitle: {
    color: '#2196F3',
  },
  shopkeeperTitle: {
    color: '#4CAF50',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  features: {
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#2c3e50',
    marginLeft: 8,
    fontWeight: '500',
  },
  process: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  processTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  processText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default RegisterChoiceScreen;