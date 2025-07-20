import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { AuthStackParamList } from '@/types';
import AuthService from '@/services/AuthService';
import { LoadingButton } from '@/components';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const passwordRef = useRef<TextInput>(null);

  const validateInputs = (): boolean => {
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre numéro de téléphone');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre mot de passe');
      return false;
    }

    // Validation basique du numéro de téléphone
    const phoneRegex = /^[+]?[0-9]{8,15}$/;
    if (!phoneRegex.test(phone.trim())) {
      Alert.alert('Erreur', 'Format de numéro de téléphone invalide');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    
    try {
      const result = await AuthService.login({
        phone: phone.trim(),
        password: password.trim(),
      });

      if (result.success) {
        // La navigation sera gérée automatiquement par RoleBasedRouter
        // grâce aux listeners d'AuthService
      } else {
        Alert.alert('Erreur de connexion', result.error || 'Identifiants invalides');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Mot de passe oublié',
      'Contactez le support ou votre boutiquier pour réinitialiser votre mot de passe.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const formatPhoneNumber = (text: string) => {
    // Retirer tous les caractères non numériques sauf le +
    const cleaned = text.replace(/[^\d+]/g, '');
    setPhone(cleaned);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Icon name="account-balance-wallet" size={60} color="#2196F3" />
            </View>
            <Text style={styles.title}>Gestion d'Emprunts</Text>
            <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Numéro de téléphone"
                  placeholderTextColor="#999"
                  value={phone}
                  onChangeText={formatPhoneNumber}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.textInput}
                  placeholder="Mot de passe"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <LoadingButton
              title="Se connecter"
              onPress={handleLogin}
              loading={isLoading}
              loadingText="Connexion..."
              icon="login"
              style={styles.loginButton}
            />
          </View>

          {/* Register Section */}
          <View style={styles.registerSection}>
            <Text style={styles.registerText}>Pas encore de compte ?</Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('RegisterChoice')}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>S'inscrire</Text>
            </TouchableOpacity>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="security" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Connexion sécurisée</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="support-agent" size={16} color="#4CAF50" />
              <Text style={styles.infoText}>Support 24/7</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  registerButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  registerButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
});

export default LoginScreen;