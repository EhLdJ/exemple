import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShopkeeperStackParamList } from '@/types';
import ShopService from '@/services/ShopService';
import SMSService from '@/services/SMSService';
import { LoadingButton, ImagePicker } from '@/components';
import ImageUploadService from '@/services/ImageUploadService';

type CreateClientNavigationProp = NativeStackNavigationProp<ShopkeeperStackParamList, 'CreateClient'>;

interface Props {
  navigation: CreateClientNavigationProp;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  profileImage: string;
}

const CreateClientScreen: React.FC<Props> = ({ navigation }) => {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    profileImage: '',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [smsBalance, setSmsBalance] = useState<number | null>(null);
  const [smsCost, setSmsCost] = useState<number>(25);

  React.useEffect(() => {
    loadSMSBalance();
  }, []);

  const loadSMSBalance = async () => {
    try {
      const balance = await SMSService.getInstance().getSMSBalance();
      if (balance) {
        setSmsBalance(balance.balance);
      }
      
      // Calculer le coût SMS estimé
      if (formData.phone) {
        const cost = await SMSService.getInstance().calculateSMSCost(formData.phone, 200);
        setSmsCost(cost);
      }
    } catch (error) {
      console.error('Erreur chargement solde SMS:', error);
    }
  };

  const updateField = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Recalculer le coût SMS si on change le téléphone
    if (field === 'phone' && value) {
      SMSService.getInstance().calculateSMSCost(value, 200).then(cost => {
        setSmsCost(cost);
      });
    }
  };

  const handleImageSelected = async (imageUri: string, imageData: any) => {
    if (!imageUri) {
      setFormData(prev => ({ ...prev, profileImage: '' }));
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await ImageUploadService.getInstance().uploadProfilePicture(
        { uri: imageUri, ...imageData },
        'temp_client' // ID temporaire, sera mis à jour après création du client
      );

      if (result.success && result.imageUrl) {
        setFormData(prev => ({ ...prev, profileImage: result.imageUrl }));
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      console.error('Erreur upload image:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    // Validation nom
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    // Validation téléphone
    const phoneValidation = SMSService.getInstance().validatePhoneNumber(formData.phone);
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else if (!phoneValidation.valid) {
      newErrors.phone = phoneValidation.error;
    }

    // Validation email (optionnel mais doit être valide si fourni)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateClient = async () => {
    if (!validateForm()) {
      return;
    }

    // Vérifier le solde SMS
    if (smsBalance !== null && smsBalance < smsCost) {
      Alert.alert(
        'Solde SMS insuffisant',
        `Votre solde (${smsBalance} FCFA) est insuffisant pour envoyer l'invitation (${smsCost} FCFA). Voulez-vous recharger votre compte ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Recharger', onPress: () => navigation.navigate('SMSRecharge') }
        ]
      );
      return;
    }

    Alert.alert(
      'Créer le client',
      'Un compte sera créé pour ce client et les identifiants de connexion lui seront envoyés par SMS. Continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Créer', onPress: createClient }
      ]
    );
  };

  const createClient = async () => {
    setIsCreating(true);
    
    try {
      const result = await ShopService.getInstance().createClientAndSendCredentials({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      });

      if (result.success && result.client) {
        // Mettre à jour l'image de profil si elle existe
        if (formData.profileImage) {
          try {
            await ImageUploadService.getInstance().uploadProfilePicture(
              { uri: formData.profileImage },
              result.client.id.toString()
            );
          } catch (error) {
            console.error('Erreur mise à jour image profil:', error);
          }
        }

        Alert.alert(
          'Client créé avec succès',
          `Le client ${result.client.name} a été créé et les identifiants de connexion ont été envoyés par SMS.`,
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );

        // Recharger le solde SMS
        loadSMSBalance();
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors de la création du client');
      }
    } catch (error) {
      console.error('Erreur création client:', error);
      Alert.alert('Erreur', 'Erreur lors de la création du client');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un client</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* SMS Balance Info */}
            <View style={styles.smsBalanceContainer}>
              <View style={styles.smsBalanceHeader}>
                <Icon name="sms" size={20} color="#2196F3" />
                <Text style={styles.smsBalanceTitle}>Solde SMS</Text>
              </View>
              <View style={styles.smsBalanceInfo}>
                <Text style={styles.smsBalanceAmount}>
                  {smsBalance !== null ? `${smsBalance} FCFA` : 'Chargement...'}
                </Text>
                <Text style={styles.smsBalanceCost}>
                  Coût envoi: {smsCost} FCFA
                </Text>
              </View>
              {smsBalance !== null && smsBalance < smsCost && (
                <TouchableOpacity
                  style={styles.rechargeButton}
                  onPress={() => navigation.navigate('SMSRecharge')}
                >
                  <Icon name="add" size={16} color="#fff" />
                  <Text style={styles.rechargeButtonText}>Recharger</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Photo de profil */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photo de profil (optionnel)</Text>
              <ImagePicker
                onImageSelected={handleImageSelected}
                currentImage={formData.profileImage}
                placeholder="Ajouter une photo de profil"
                style={styles.profileImagePicker}
                borderRadius={60}
                disabled={isUploadingImage}
              />
              {isUploadingImage && (
                <Text style={styles.uploadingText}>Upload en cours...</Text>
              )}
            </View>

            {/* Informations personnelles */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prénom *</Text>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  placeholder="Entrez le prénom"
                  autoCapitalize="words"
                />
                {errors.firstName && (
                  <Text style={styles.errorText}>{errors.firstName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nom *</Text>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  placeholder="Entrez le nom"
                  autoCapitalize="words"
                />
                {errors.lastName && (
                  <Text style={styles.errorText}>{errors.lastName}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Téléphone *</Text>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(text) => updateField('phone', text)}
                  placeholder="Ex: +221 77 123 45 67"
                  keyboardType="phone-pad"
                />
                {errors.phone && (
                  <Text style={styles.errorText}>{errors.phone}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email (optionnel)</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  placeholder="email@exemple.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && (
                  <Text style={styles.errorText}>{errors.email}</Text>
                )}
              </View>
            </View>

            {/* Informations sur le processus */}
            <View style={styles.infoContainer}>
              <Icon name="info" size={20} color="#2196F3" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Après création :</Text>
                <Text style={styles.infoText}>
                  • Un compte sera automatiquement créé pour le client{'\n'}
                  • Un mot de passe temporaire sera généré{'\n'}
                  • Les identifiants seront envoyés par SMS{'\n'}
                  • Le client pourra se connecter et modifier son mot de passe
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <LoadingButton
            title="Créer le client et envoyer SMS"
            onPress={handleCreateClient}
            loading={isCreating}
            loadingText="Création en cours..."
            icon="person-add"
            style={styles.createButton}
            disabled={smsBalance !== null && smsBalance < smsCost}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  smsBalanceContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smsBalanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  smsBalanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  smsBalanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smsBalanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  smsBalanceCost: {
    fontSize: 14,
    color: '#666',
  },
  rechargeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  rechargeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  profileImagePicker: {
    height: 120,
    marginBottom: 8,
  },
  uploadingText: {
    textAlign: 'center',
    color: '#2196F3',
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  createButton: {
    marginHorizontal: 0,
  },
});

export default CreateClientScreen;