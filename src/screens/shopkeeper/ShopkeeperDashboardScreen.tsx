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
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { ShopkeeperStackParamList, ShopkeeperStats, Loan } from '@/types';
import AuthService from '@/services/AuthService';
import { ApiService } from '@/services/ApiService';
import { PageLoader } from '@/components';

type ShopkeeperDashboardNavigationProp = NativeStackNavigationProp<
  ShopkeeperStackParamList, 
  'Dashboard'
>;

interface Props {
  navigation: ShopkeeperDashboardNavigationProp;
}

interface QuickActionProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  color: string;
  trend?: string;
}

const { width } = Dimensions.get('window');

const QuickAction: React.FC<QuickActionProps> = ({ 
  icon, 
  title, 
  subtitle, 
  color, 
  onPress 
}) => (
  <TouchableOpacity style={[styles.quickAction, { borderLeftColor: color }]} onPress={onPress}>
    <View style={[styles.actionIcon, { backgroundColor: color }]}>
      <Icon name={icon} size={24} color="#fff" />
    </View>
    <View style={styles.actionText}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={20} color="#ccc" />
  </TouchableOpacity>
);

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, trend }) => (
  <View style={[styles.statCard, { borderTopColor: color }]}>
    <View style={styles.statHeader}>
      <Icon name={icon} size={20} color={color} />
      {trend && (
        <Text style={[styles.trend, { color: trend.includes('+') ? '#4CAF50' : '#F44336' }]}>
          {trend}
        </Text>
      )}
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ShopkeeperDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [stats, setStats] = useState<ShopkeeperStats | null>(null);
  const [recentLoans, setRecentLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const user = AuthService.getCurrentUser();

  const fetchDashboardData = async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);

      // Récupérer les statistiques
      const [statsResponse, loansResponse] = await Promise.all([
        ApiService.get<ShopkeeperStats>('/shopkeeper/stats'),
        ApiService.get<Loan[]>('/loans?limit=5&recent=true')
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (loansResponse.success && loansResponse.data) {
        setRecentLoans(loansResponse.data);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNewLoan = () => {
    navigation.navigate('ClientSelection');
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner');
  };

  const handleViewAllLoans = () => {
    navigation.navigate('AllLoans');
  };

  const handleInventory = () => {
    navigation.navigate('Inventory');
  };

  const handleLoanPress = (loan: Loan) => {
    Alert.alert(
      'Détails de l\'emprunt',
      `Client: ${loan.clientId}\nMontant: ${formatAmount(loan.totalAmount)} FCFA\nStatut: ${loan.paymentStatus}`,
      [{ text: 'OK' }]
    );
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Boutique</Text>
            <Text style={styles.shopName}>{user?.shopName || 'Ma Boutique'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => Alert.alert('Info', 'Notifications à venir')}
          >
            <Icon name="notifications" size={24} color="#4CAF50" />
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions Rapides</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="add-circle"
              title="Nouvel Emprunt"
              subtitle="Créer un emprunt"
              color="#4CAF50"
              onPress={handleNewLoan}
            />
            <QuickAction
              icon="qr-code-scanner"
              title="Scanner QR"
              subtitle="Valider un paiement"
              color="#2196F3"
              onPress={handleScanQR}
            />
            <QuickAction
              icon="inventory"
              title="Inventaire"
              subtitle="Gérer le stock"
              color="#FF9800"
              onPress={handleInventory}
            />
            <QuickAction
              icon="list"
              title="Tous les Emprunts"
              subtitle="Voir l'historique"
              color="#9C27B0"
              onPress={handleViewAllLoans}
            />
          </View>
        </View>

        {/* Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="trending-up"
              title="Emprunts ce mois"
              value={stats?.totalLoans.toString() || '0'}
              color="#4CAF50"
              trend="+12%"
            />
            <StatCard
              icon="schedule"
              title="Emprunts actifs"
              value={stats?.activeLoans.toString() || '0'}
              color="#FF9800"
            />
            <StatCard
              icon="attach-money"
              title="Revenus mensuels"
              value={stats ? `${formatAmount(stats.monthlyRevenue)} F` : '0 F'}
              color="#2196F3"
              trend="+8%"
            />
            <StatCard
              icon="pending"
              title="Paiements en attente"
              value={stats?.pendingPayments.toString() || '0'}
              color="#F44336"
            />
          </View>
        </View>

        {/* Recent Loans */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emprunts Récents</Text>
            <TouchableOpacity onPress={handleViewAllLoans}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          {recentLoans.length > 0 ? (
            <View style={styles.loansList}>
              {recentLoans.map((loan) => (
                <TouchableOpacity
                  key={loan.id}
                  style={styles.loanItem}
                  onPress={() => handleLoanPress(loan)}
                >
                  <View style={styles.loanInfo}>
                    <Text style={styles.loanClient}>Client #{loan.clientId}</Text>
                    <Text style={styles.loanDate}>
                      {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                    </Text>
                  </View>
                  <View style={styles.loanAmount}>
                    <Text style={styles.loanValue}>
                      {formatAmount(loan.totalAmount)} FCFA
                    </Text>
                    <View style={[
                      styles.loanStatus,
                      { backgroundColor: loan.remainingAmount > 0 ? '#FF9800' : '#4CAF50' }
                    ]}>
                      <Text style={styles.loanStatusText}>
                        {loan.remainingAmount > 0 ? 'En cours' : 'Payé'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLoans}>
              <Icon name="receipt-long" size={40} color="#ccc" />
              <Text style={styles.emptyText}>Aucun emprunt récent</Text>
            </View>
          )}
        </View>

        {/* Top Products */}
        {stats?.topProducts && stats.topProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Produits Populaires</Text>
            <View style={styles.topProducts}>
              {stats.topProducts.slice(0, 3).map((product, index) => (
                <View key={index} style={styles.productItem}>
                  <View style={styles.productRank}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productCount}>
                      {product.loanCount} emprunt{product.loanCount > 1 ? 's' : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Page Loader for initial loading */}
      <PageLoader 
        visible={isLoading && !stats && recentLoans.length === 0} 
        message="Chargement du tableau de bord..."
        color="#4CAF50"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
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
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  quickActions: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderLeftWidth: 4,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trend: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  loansList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loanItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  loanInfo: {
    flex: 1,
  },
  loanClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  loanDate: {
    fontSize: 14,
    color: '#666',
  },
  loanAmount: {
    alignItems: 'flex-end',
  },
  loanValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  loanStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loanStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyLoans: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
    marginTop: 8,
  },
  topProducts: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ShopkeeperDashboardScreen;