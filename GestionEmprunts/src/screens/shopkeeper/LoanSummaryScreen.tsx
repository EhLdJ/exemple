import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';, RouteProp
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ShopkeeperStackParamList } from '@/types';

type Props = {
  navigation: NativeStackNavigationProp<ShopkeeperStackParamList, 'LoanSummary'>;\n  route: RouteProp<ShopkeeperStackParamList, 'LoanSummary'>;
};

const LoanSummaryScreen: React.FC<Props> = ({ navigation, route }) => {\n  const { clientId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#666" />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Icon name="receipt" size={80} color="#4CAF50" />
        <Text style={styles.title}>LoanSummary</Text>
        <Text style={styles.subtitle}>
          clientId: {clientId}{'\n'}(En cours de développement)
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Retour</Text>
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#4CAF50',
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

export default LoanSummaryScreen;
