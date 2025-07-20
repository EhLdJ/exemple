import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ClientStackParamList, Shop } from '@/types';
import ShopService from '@/services/ShopService';
import { LoadingButton, PageLoader } from '@/components';

type ShopSearchNavigationProp = NativeStackNavigationProp<ClientStackParamList, 'ShopSearch'>;

interface Props {
  navigation: ShopSearchNavigationProp;
}

const ShopSearchScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [requestingShop, setRequestingShop] = useState<number | null>(null);

  useEffect(() => {
    loadAllShops();
  }, []);

  const loadAllShops = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await ShopService.getInstance().getAllShops(pageNum, 20);
      
      if (refresh || pageNum === 1) {
        setShops(result.shops);
      } else {
        setShops(prev => [...prev, ...result.shops]);
      }
      
      setHasMore(result.shops.length === 20);
      setPage(pageNum);
    } catch (error) {
      console.error('Erreur chargement boutiques:', error);
      Alert.alert('Erreur', 'Impossible de charger les boutiques');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const searchShops = async (query: string) => {
    if (!query.trim()) {
      loadAllShops(1, true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await ShopService.getInstance().searchShops(query);
      setShops(result.shops);
      setHasMore(false);
    } catch (error) {
      console.error('Erreur recherche:', error);
      Alert.alert('Erreur', 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Recherche avec délai
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const searchTimeout = setTimeout(() => {
      searchShops(text);
    }, 500);
  };

  const handleSendRequest = async (shop: Shop) => {
    Alert.alert(
      'Demande de relation',
      `Voulez-vous envoyer une demande de relation à "${shop.shopName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Envoyer',
          onPress: () => sendRequest(shop),
        },
      ]
    );
  };

  const sendRequest = async (shop: Shop) => {
    setRequestingShop(shop.id);
    
    try {
      const success = await ShopService.getInstance().sendClientRequest(shop.id);
      
      if (success) {
        Alert.alert(
          'Demande envoyée',
          'Votre demande a été envoyée au boutiquier. Vous recevrez une notification dès qu\'il répondra.'
        );
      } else {
        Alert.alert('Erreur', 'Impossible d\'envoyer la demande');
      }
    } catch (error) {
      console.error('Erreur envoi demande:', error);
      Alert.alert('Erreur', 'Erreur lors de l\'envoi de la demande');
    } finally {
      setRequestingShop(null);
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore && !searchQuery.trim()) {
      loadAllShops(page + 1);
    }
  };

  const renderShopCard = ({ item }: { item: Shop }) => (
    <View style={styles.shopCard}>
      <View style={styles.shopHeader}>
        {item.shopImage ? (
          <Image source={{ uri: item.shopImage }} style={styles.shopImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="store" size={30} color="#666" />
          </View>
        )}
        
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{item.shopName}</Text>
          <Text style={styles.shopDescription} numberOfLines={2}>
            {item.shopDescription || 'Aucune description disponible'}
          </Text>
          <Text style={styles.shopAddress}>
            <Icon name="location-on" size={14} color="#666" />
            {' '}{item.shopAddress}
          </Text>
        </View>
      </View>

      <View style={styles.shopStats}>
        <View style={styles.statItem}>
          <Icon name="people" size={16} color="#2196F3" />
          <Text style={styles.statText}>{item.totalClients} clients</Text>
        </View>
        
        <View style={styles.statItem}>
          <Icon name="receipt" size={16} color="#2196F3" />
          <Text style={styles.statText}>{item.totalLoans} emprunts</Text>
        </View>
        
        {item.rating && (
          <View style={styles.statItem}>
            <Icon name="star" size={16} color="#FFA726" />
            <Text style={styles.statText}>{item.rating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      <View style={styles.shopActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => navigation.navigate('ShopDetails', { shopId: item.id })}
        >
          <Icon name="visibility" size={18} color="#2196F3" />
          <Text style={styles.viewButtonText}>Voir détails</Text>
        </TouchableOpacity>

        <LoadingButton
          title="Demander relation"
          onPress={() => handleSendRequest(item)}
          loading={requestingShop === item.id}
          loadingText="Envoi..."
          size="small"
          variant="primary"
          style={styles.requestButton}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="store" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'Aucune boutique trouvée' : 'Aucune boutique disponible'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Essayez avec d\'autres termes de recherche'
          : 'Les boutiques apparaîtront ici une fois inscrites'
        }
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rechercher une boutique</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Nom de boutique, téléphone ou ID unique..."
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => handleSearch('')}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Shops List */}
      <FlatList
        data={shops}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderShopCard}
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadAllShops(1, true)}
            colors={['#2196F3']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={shops.length === 0 ? styles.emptyContainer : styles.listContainer}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('QRScanner')}
      >
        <Icon name="qr-code-scanner" size={24} color="#fff" />
      </TouchableOpacity>

      <PageLoader
        visible={isLoading && shops.length === 0}
        message="Chargement des boutiques..."
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  shopCard: {
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
  shopHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  shopImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  shopDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  shopAddress: {
    fontSize: 12,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  shopActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  requestButton: {
    minWidth: 140,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ShopSearchScreen;