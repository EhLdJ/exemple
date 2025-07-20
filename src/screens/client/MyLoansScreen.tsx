import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ClientStackParamList, Loan, PaymentStatus, LoanStatus } from '@/types';
import AuthService from '@/services/AuthService';
import { ApiService } from '@/services/ApiService';
import { LoadingButton, PageLoader } from '@/components';

type MyLoansScreenNavigationProp = NativeStackNavigationProp<ClientStackParamList, 'MyLoans'>;

interface Props {
  navigation: MyLoansScreenNavigationProp;
}

interface LoanCardProps {
  loan: Loan;
  onPress: () => void;
  onPayPress: () => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onPress, onPayPress }) => {
  const getStatusColor = () => {
    switch (loan.paymentStatus) {
      case PaymentStatus.PAID:
        return '#4CAF50';
      case PaymentStatus.PARTIAL:
        return '#FF9800';
      case PaymentStatus.PENDING:
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusText = () => {
    switch (loan.paymentStatus) {
      case PaymentStatus.PAID:
        return 'Payé';
      case PaymentStatus.PARTIAL:
        return 'Partiel';
      case PaymentStatus.PENDING:
        return 'En attente';
      default:
        return 'Inconnu';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity style={styles.loanCard} onPress={onPress}>
      <View style={styles.loanHeader}>
        <View style={styles.loanInfo}>
          <Text style={styles.loanTitle}>
            {loan.products.length > 1 
              ? `${loan.products[0].productName} + ${loan.products.length - 1} autre(s)`
              : loan.products[0]?.productName || 'Emprunt'
            }
          </Text>
          <Text style={styles.loanDate}>
            {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.loanAmounts}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Total :</Text>
          <Text style={styles.amountValue}>{formatAmount(loan.totalAmount)} FCFA</Text>
        </View>
        {loan.remainingAmount > 0 && (
          <View style={styles.amountRow}>
            <Text style={styles.remainingLabel}>Reste à payer :</Text>
            <Text style={styles.remainingValue}>{formatAmount(loan.remainingAmount)} FCFA</Text>
          </View>
        )}
      </View>

      {loan.remainingAmount > 0 && (
        <View style={styles.loanActions}>
          <TouchableOpacity
            style={styles.payButton}
            onPress={(e) => {
              e.stopPropagation();
              onPayPress();
            }}
          >
            <Icon name="qr-code" size={16} color="#fff" />
            <Text style={styles.payButtonText}>Générer QR</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const MyLoansScreen: React.FC<Props> = ({ navigation }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalOwed, setTotalOwed] = useState(0);
  const [payingAll, setPayingAll] = useState(false);

  const user = AuthService.getCurrentUser();

  const fetchLoans = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      
      const response = await ApiService.get<Loan[]>('/loans');
      
      if (response.success && response.data) {
        setLoans(response.data);
        
        // Calculer le total dû
        const total = response.data.reduce((sum, loan) => sum + loan.remainingAmount, 0);
        setTotalOwed(total);
      } else {
        Alert.alert('Erreur', 'Impossible de charger vos emprunts');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLoans(false);
  };

  const handleLoanPress = (loan: Loan) => {
    navigation.navigate('LoanDetails', { loanId: loan.id });
  };

  const handlePayPress = (loan: Loan) => {
    if (loan.remainingAmount <= 0) {
      Alert.alert('Info', 'Cet emprunt est déjà payé intégralement');
      return;
    }
    
    navigation.navigate('QRGenerator', { loanId: loan.id });
  };

  const handlePayAll = async () => {
    if (totalOwed <= 0) {
      Alert.alert('Info', 'Vous n\'avez aucune dette en cours');
      return;
    }

    Alert.alert(
      'Payer tout',
      `Voulez-vous générer un QR code pour payer l'ensemble de vos dettes (${formatAmount(totalOwed)} FCFA) ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Générer QR', 
          onPress: async () => {
            setPayingAll(true);
            // Simuler un délai de traitement
            setTimeout(() => {
              setPayingAll(false);
              Alert.alert('Info', 'Fonctionnalité en cours de développement');
            }, 2000);
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getActiveLoansCount = () => {
    return loans.filter(loan => loan.remainingAmount > 0).length;
  };

  const getPaidLoansCount = () => {
    return loans.filter(loan => loan.remainingAmount === 0).length;
  };

  useFocusEffect(
    useCallback(() => {
      fetchLoans();
    }, [])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="receipt-long" size={80} color="#ddd" />
      <Text style={styles.emptyTitle}>Aucun emprunt</Text>
      <Text style={styles.emptySubtitle}>
        Vous n'avez encore aucun emprunt enregistré
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header avec salutation */}
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>Bonjour</Text>
          <Text style={styles.userName}>{user?.name || 'Client'} !</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => Alert.alert('Info', 'Notifications à venir')}
        >
          <Icon name="notifications" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>MES EMPRUNTS</Text>
        
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{getActiveLoansCount()}</Text>
            <Text style={styles.summaryLabel}>En cours</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{getPaidLoansCount()}</Text>
            <Text style={styles.summaryLabel}>Payés</Text>
          </View>
          <View style={[styles.summaryCard, styles.totalCard]}>
            <Text style={styles.totalAmount}>{formatAmount(totalOwed)} FCFA</Text>
            <Text style={styles.summaryLabel}>Total dû</Text>
          </View>
        </View>

        {totalOwed > 0 && (
          <View style={styles.paymentActions}>
            <LoadingButton
              title="Payer Tout"
              onPress={handlePayAll}
              loading={payingAll}
              loadingText="Génération..."
              icon="payment"
              color="#4CAF50"
              style={styles.payAllButton}
            />
          </View>
        )}
      </View>

      {/* Loans List */}
      <View style={styles.loansSection}>
        <FlatList
          data={loans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <LoanCard
              loan={item}
              onPress={() => handleLoanPress(item)}
              onPayPress={() => handlePayPress(item)}
            />
          )}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={loans.length === 0 ? styles.emptyContainer : undefined}
        />
      </View>

      {/* Page Loader for initial loading */}
      <PageLoader 
        visible={isLoading && loans.length === 0} 
        message="Chargement des emprunts..."
        color="#2196F3"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  greeting: {
    flex: 1,
  },
  greetingText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notificationButton: {
    padding: 8,
  },
  summarySection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  totalCard: {
    backgroundColor: '#e3f2fd',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  payAllButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  payAllText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  loansSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  loanDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loanAmounts: {
    marginBottom: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  remainingLabel: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  remainingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  loanActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  payButton: {
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default MyLoansScreen;