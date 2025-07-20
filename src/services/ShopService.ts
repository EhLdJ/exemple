import { ApiService } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shop, ShopClientRelation, LoanRequest, User } from '@/types';

export interface ShopSearchResult {
  shops: Shop[];
  total: number;
  page: number;
  limit: number;
}

export interface ShopClientRequest {
  shopId: number;
  clientId: number;
  message?: string;
}

class ShopService {
  private static instance: ShopService;

  static getInstance(): ShopService {
    if (!ShopService.instance) {
      ShopService.instance = new ShopService();
    }
    return ShopService.instance;
  }

  /**
   * Rechercher des boutiques
   */
  async searchShops(query: string, page = 1, limit = 20): Promise<ShopSearchResult> {
    try {
      const response = await ApiService.getInstance().request('/shops/search', {
        method: 'GET',
        params: {
          q: query,
          page: page.toString(),
          limit: limit.toString(),
        },
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors de la recherche');
      }
    } catch (error) {
      console.error('Erreur recherche boutiques:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les boutiques avec pagination
   */
  async getAllShops(page = 1, limit = 20, filters?: any): Promise<ShopSearchResult> {
    try {
      const response = await ApiService.getInstance().request('/shops', {
        method: 'GET',
        params: {
          page: page.toString(),
          limit: limit.toString(),
          ...filters,
        },
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || 'Erreur lors de la récupération des boutiques');
      }
    } catch (error) {
      console.error('Erreur getAllShops:', error);
      throw error;
    }
  }

  /**
   * Obtenir une boutique par son ID unique
   */
  async getShopByUniqueId(uniqueShopId: string): Promise<Shop | null> {
    try {
      const response = await ApiService.getInstance().request(`/shops/unique/${uniqueShopId}`, {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur getShopByUniqueId:', error);
      return null;
    }
  }

  /**
   * Obtenir une boutique par numéro de téléphone du boutiquier
   */
  async getShopByPhone(phone: string): Promise<Shop | null> {
    try {
      const response = await ApiService.getInstance().request(`/shops/phone/${phone}`, {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur getShopByPhone:', error);
      return null;
    }
  }

  /**
   * Envoyer une demande de relation client-boutique
   */
  async sendClientRequest(shopId: number, message?: string): Promise<boolean> {
    try {
      const response = await ApiService.getInstance().request('/shop-client-relations/request', {
        method: 'POST',
        body: JSON.stringify({
          shopId,
          message,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors de l\'envoi de la demande');
      }
    } catch (error) {
      console.error('Erreur sendClientRequest:', error);
      throw error;
    }
  }

  /**
   * Répondre à une demande de relation client-boutique (pour boutiquier)
   */
  async respondToClientRequest(relationId: number, action: 'accept' | 'reject'): Promise<boolean> {
    try {
      const response = await ApiService.getInstance().request(`/shop-client-relations/${relationId}/respond`, {
        method: 'PUT',
        body: JSON.stringify({ action }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        return true;
      } else {
        throw new Error(response.error || 'Erreur lors de la réponse');
      }
    } catch (error) {
      console.error('Erreur respondToClientRequest:', error);
      throw error;
    }
  }

  /**
   * Obtenir les demandes en attente pour un boutiquier
   */
  async getPendingClientRequests(): Promise<ShopClientRelation[]> {
    try {
      const response = await ApiService.getInstance().request('/shop-client-relations/pending', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur getPendingClientRequests:', error);
      return [];
    }
  }

  /**
   * Obtenir la liste des clients d'une boutique
   */
  async getShopClients(shopId?: number): Promise<User[]> {
    try {
      const endpoint = shopId ? `/shops/${shopId}/clients` : '/shop-client-relations/my-clients';
      const response = await ApiService.getInstance().request(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur getShopClients:', error);
      return [];
    }
  }

  /**
   * Obtenir les boutiques d'un client
   */
  async getClientShops(): Promise<Shop[]> {
    try {
      const response = await ApiService.getInstance().request('/shop-client-relations/my-shops', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur getClientShops:', error);
      return [];
    }
  }

  /**
   * Créer un client et envoyer les identifiants par SMS (pour boutiquier)
   */
  async createClientAndSendCredentials(clientData: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
  }): Promise<{ success: boolean; client?: User; error?: string }> {
    try {
      const response = await ApiService.getInstance().request('/clients/create-and-invite', {
        method: 'POST',
        body: JSON.stringify(clientData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        return {
          success: true,
          client: response.data.client,
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de la création du client',
        };
      }
    } catch (error) {
      console.error('Erreur createClientAndSendCredentials:', error);
      return {
        success: false,
        error: 'Erreur de connexion',
      };
    }
  }

  /**
   * Bloquer/débloquer un client
   */
  async toggleClientBlock(clientId: number, block: boolean): Promise<boolean> {
    try {
      const response = await ApiService.getInstance().request(`/shop-client-relations/${clientId}/block`, {
        method: 'PUT',
        body: JSON.stringify({ block }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.success;
    } catch (error) {
      console.error('Erreur toggleClientBlock:', error);
      return false;
    }
  }

  /**
   * Mettre à jour les informations de la boutique
   */
  async updateShopInfo(shopData: {
    shopName?: string;
    shopDescription?: string;
    shopAddress?: string;
    shopLocation?: { latitude: number; longitude: number };
  }): Promise<boolean> {
    try {
      const response = await ApiService.getInstance().request('/shops/my-shop', {
        method: 'PUT',
        body: JSON.stringify(shopData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        // Mettre à jour le cache local
        await this.updateLocalShopInfo(response.data);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur updateShopInfo:', error);
      return false;
    }
  }

  /**
   * Obtenir les statistiques de la boutique
   */
  async getShopStats(): Promise<any> {
    try {
      const response = await ApiService.getInstance().request('/shops/my-shop/stats', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur getShopStats:', error);
      return null;
    }
  }

  /**
   * Rechercher des clients dans une boutique
   */
  async searchShopClients(query: string): Promise<User[]> {
    try {
      const response = await ApiService.getInstance().request('/shop-client-relations/search-clients', {
        method: 'GET',
        params: { q: query },
      });

      if (response.success) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur searchShopClients:', error);
      return [];
    }
  }

  /**
   * Obtenir l'historique des relations client-boutique
   */
  async getRelationHistory(clientId?: number): Promise<ShopClientRelation[]> {
    try {
      const endpoint = clientId 
        ? `/shop-client-relations/history/${clientId}`
        : '/shop-client-relations/history';
        
      const response = await ApiService.getInstance().request(endpoint, {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Erreur getRelationHistory:', error);
      return [];
    }
  }

  /**
   * Sauvegarder les informations de boutique en local
   */
  private async updateLocalShopInfo(shopData: any): Promise<void> {
    try {
      await AsyncStorage.setItem('my_shop_info', JSON.stringify(shopData));
    } catch (error) {
      console.error('Erreur sauvegarde locale boutique:', error);
    }
  }

  /**
   * Obtenir les informations de boutique en local
   */
  async getLocalShopInfo(): Promise<Shop | null> {
    try {
      const shopData = await AsyncStorage.getItem('my_shop_info');
      return shopData ? JSON.parse(shopData) : null;
    } catch (error) {
      console.error('Erreur lecture locale boutique:', error);
      return null;
    }
  }

  /**
   * Nettoyer le cache local
   */
  async clearLocalCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('my_shop_info');
      await AsyncStorage.removeItem('shop_clients_cache');
      await AsyncStorage.removeItem('client_shops_cache');
    } catch (error) {
      console.error('Erreur nettoyage cache boutique:', error);
    }
  }

  /**
   * Synchroniser les données hors ligne
   */
  async syncOfflineData(): Promise<void> {
    try {
      // Synchroniser les demandes en attente
      const pendingRequests = await AsyncStorage.getItem('pending_client_requests');
      if (pendingRequests) {
        const requests = JSON.parse(pendingRequests);
        const processedRequests: string[] = [];

        for (const request of requests) {
          try {
            const success = await this.sendClientRequest(request.shopId, request.message);
            if (success) {
              processedRequests.push(request.id);
            }
          } catch (error) {
            console.error('Erreur sync request:', error);
          }
        }

        // Supprimer les requêtes traitées
        const remainingRequests = requests.filter((req: any) => !processedRequests.includes(req.id));
        await AsyncStorage.setItem('pending_client_requests', JSON.stringify(remainingRequests));
      }
    } catch (error) {
      console.error('Erreur synchronisation données:', error);
    }
  }
}

export default ShopService;