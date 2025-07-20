import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse } from '@/types';

class ApiServiceClass {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Configuration de base - à ajuster selon l'environnement
    this.baseURL = __DEV__ 
      ? 'http://localhost:3000/api' 
      : 'https://your-production-api.com/api';

    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Intercepteur pour les requêtes sortantes
    this.instance.interceptors.request.use(
      async (config) => {
        // Ajouter le token d'authentification automatiquement
        try {
          const token = await AsyncStorage.getItem('auth_token');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('Erreur lors de la récupération du token:', error);
        }

        // Logging en mode développement
        if (__DEV__) {
          console.log(`🌐 ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }

        return config;
      },
      (error) => {
        console.error('Erreur dans l\'intercepteur de requête:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur pour les réponses
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (__DEV__) {
          console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            status: response.status,
            data: response.data,
          });
        }
        return response;
      },
      async (error) => {
        if (__DEV__) {
          console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message,
          });
        }

        // Gestion de l'expiration du token
        if (error.response?.status === 401) {
          try {
            await AsyncStorage.multiRemove(['auth_token', 'user_data']);
            // Rediriger vers la page de connexion (géré par AuthService)
          } catch (storageError) {
            console.error('Erreur lors du nettoyage du storage:', storageError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Méthode GET générique
  public async get<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.get<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Méthode POST générique
  public async post<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.post<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Méthode PUT générique
  public async put<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.put<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Méthode PATCH générique
  public async patch<T>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.patch<T>(url, data, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Méthode DELETE générique
  public async delete<T>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.instance.delete<T>(url, config);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Upload de fichiers
  public async uploadFile<T>(
    url: string,
    file: {
      uri: string;
      type: string;
      name: string;
    },
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      // Ajouter le fichier
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      } as any);

      // Ajouter les données supplémentaires
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key]);
        });
      }

      const response = await this.instance.post<T>(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return this.handleError<T>(error);
    }
  }

  // Gestion centralisée des erreurs
  private handleError<T>(error: any): ApiResponse<T> {
    let errorMessage = 'Une erreur est survenue';

    if (error.response) {
      // Erreur de réponse du serveur
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data?.error || data?.message || 'Requête invalide';
          break;
        case 401:
          errorMessage = 'Non autorisé - Veuillez vous reconnecter';
          break;
        case 403:
          errorMessage = 'Accès refusé';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée';
          break;
        case 409:
          errorMessage = data?.error || 'Conflit - Les données existent déjà';
          break;
        case 422:
          errorMessage = data?.error || 'Données de validation invalides';
          break;
        case 500:
          errorMessage = 'Erreur serveur interne';
          break;
        case 503:
          errorMessage = 'Service temporairement indisponible';
          break;
        default:
          errorMessage = data?.error || data?.message || `Erreur ${status}`;
      }
    } else if (error.request) {
      // Erreur de réseau
      errorMessage = 'Erreur de connexion - Vérifiez votre connexion internet';
    } else {
      // Autre erreur
      errorMessage = error.message || 'Erreur inconnue';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }

  // Méthodes utilitaires
  public setBaseURL(url: string): void {
    this.baseURL = url;
    this.instance.defaults.baseURL = url;
  }

  public getBaseURL(): string {
    return this.baseURL;
  }

  public setTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout;
  }

  // Vérification de la connectivité
  public async checkConnectivity(): Promise<boolean> {
    try {
      const response = await this.instance.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // Retry mechanism pour les requêtes critiques
  public async retryRequest<T>(
    requestFunction: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: ApiResponse<T>;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFunction();
        if (result.success) {
          return result;
        }
        lastError = result;
      } catch (error: any) {
        lastError = this.handleError<T>(error);
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    return lastError!;
  }

  // Annulation de requêtes
  public createCancelToken() {
    return axios.CancelToken.source();
  }

  public isCancel(error: any): boolean {
    return axios.isCancel(error);
  }
}

export const ApiService = new ApiServiceClass();