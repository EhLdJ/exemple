import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  User, 
  AuthState, 
  LoginRequest, 
  RegisterClientRequest, 
  RegisterShopkeeperRequest, 
  SMSVerificationRequest, 
  ApiResponse,
  UserRole 
} from '@/types';
import { ApiService } from './ApiService';

class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false
  };
  private listeners: Array<(state: AuthState) => void> = [];

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Gestion des listeners pour les updates d'état
  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.authState));
  }

  private async updateAuthState(updates: Partial<AuthState>): Promise<void> {
    this.authState = { ...this.authState, ...updates };
    this.notifyListeners();
    
    // Sauvegarder le token et user en local
    if (updates.token) {
      await AsyncStorage.setItem('auth_token', updates.token);
    }
    if (updates.user) {
      await AsyncStorage.setItem('user_data', JSON.stringify(updates.user));
    }
  }

  // Initialisation - récupération des données stockées
  public async initialize(): Promise<void> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      
      if (token && userData) {
        const user: User = JSON.parse(userData);
        
        // Vérifier la validité du token avec le backend
        const isValid = await this.validateToken(token);
        
        if (isValid) {
          await this.updateAuthState({
            user,
            token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          await this.logout();
        }
      } else {
        await this.updateAuthState({ isLoading: false });
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      await this.updateAuthState({ isLoading: false });
    }
  }

  // Connexion
  public async login(credentials: LoginRequest): Promise<ApiResponse<User>> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const response = await ApiService.post<{user: User, token: string}>('/auth/login', credentials);
      
      if (response.success && response.data) {
        await this.updateAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false
        });
        
        return { success: true, data: response.data.user };
      } else {
        await this.updateAuthState({ isLoading: false });
        return { success: false, error: response.error || 'Erreur de connexion' };
      }
    } catch (error) {
      await this.updateAuthState({ isLoading: false });
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  // Inscription Client
  public async registerClient(data: RegisterClientRequest): Promise<ApiResponse<string>> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const response = await ApiService.post<{message: string}>('/auth/register/client', data);
      
      await this.updateAuthState({ isLoading: false });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data?.message || 'SMS envoyé pour vérification',
          message: 'Vérifiez votre SMS pour valider votre compte'
        };
      } else {
        return { success: false, error: response.error || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      await this.updateAuthState({ isLoading: false });
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }

  // Inscription Boutiquier
  public async registerShopkeeper(data: RegisterShopkeeperRequest): Promise<ApiResponse<string>> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const response = await ApiService.post<{message: string}>('/auth/register/shopkeeper', data);
      
      await this.updateAuthState({ isLoading: false });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data?.message || 'Compte créé avec succès',
          message: 'Vérifiez vos SMS et email pour activer votre compte'
        };
      } else {
        return { success: false, error: response.error || 'Erreur lors de l\'inscription' };
      }
    } catch (error) {
      await this.updateAuthState({ isLoading: false });
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }

  // Vérification SMS
  public async verifySMS(data: SMSVerificationRequest): Promise<ApiResponse<User>> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const response = await ApiService.post<{user: User, token: string}>('/auth/verify-sms', data);
      
      if (response.success && response.data) {
        await this.updateAuthState({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
          isLoading: false
        });
        
        return { success: true, data: response.data.user };
      } else {
        await this.updateAuthState({ isLoading: false });
        return { success: false, error: response.error || 'Code de vérification invalide' };
      }
    } catch (error) {
      await this.updateAuthState({ isLoading: false });
      return { success: false, error: 'Erreur de vérification' };
    }
  }

  // Validation du token
  private async validateToken(token: string): Promise<boolean> {
    try {
      const response = await ApiService.get('/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Déconnexion
  public async logout(): Promise<void> {
    try {
      // Nettoyer le storage local
      await AsyncStorage.multiRemove(['auth_token', 'user_data']);
      
      // Informer le backend de la déconnexion
      if (this.authState.token) {
        await ApiService.post('/auth/logout', {});
      }
      
      // Réinitialiser l'état
      await this.updateAuthState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  }

  // Getters pour l'état actuel
  public getAuthState(): AuthState {
    return this.authState;
  }

  public getCurrentUser(): User | null {
    return this.authState.user;
  }

  public getToken(): string | null {
    return this.authState.token;
  }

  public getUserRole(): UserRole | null {
    return this.authState.user?.role || null;
  }

  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated;
  }

  public isClient(): boolean {
    return this.authState.user?.role === UserRole.CLIENT;
  }

  public isShopkeeper(): boolean {
    return this.authState.user?.role === UserRole.SHOPKEEPER;
  }

  public isAdmin(): boolean {
    return this.authState.user?.role === UserRole.ADMIN;
  }

  // Demande de réinitialisation de mot de passe
  public async requestPasswordReset(phone: string): Promise<ApiResponse<string>> {
    try {
      const response = await ApiService.post<{message: string}>('/auth/reset-password', { phone });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data?.message || 'SMS envoyé',
          message: 'Un code de réinitialisation a été envoyé par SMS'
        };
      } else {
        return { success: false, error: response.error || 'Erreur lors de la demande' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  // Réinitialisation de mot de passe
  public async resetPassword(phone: string, code: string, newPassword: string): Promise<ApiResponse<string>> {
    try {
      const response = await ApiService.post<{message: string}>('/auth/reset-password/confirm', {
        phone,
        code,
        newPassword
      });
      
      if (response.success) {
        return { 
          success: true, 
          data: response.data?.message || 'Mot de passe réinitialisé',
          message: 'Votre mot de passe a été réinitialisé avec succès'
        };
      } else {
        return { success: false, error: response.error || 'Erreur lors de la réinitialisation' };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  // Mise à jour du profil
  public async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      await this.updateAuthState({ isLoading: true });
      
      const response = await ApiService.put<User>('/auth/profile', updates);
      
      if (response.success && response.data) {
        await this.updateAuthState({
          user: response.data,
          isLoading: false
        });
        
        return { success: true, data: response.data };
      } else {
        await this.updateAuthState({ isLoading: false });
        return { success: false, error: response.error || 'Erreur lors de la mise à jour' };
      }
    } catch (error) {
      await this.updateAuthState({ isLoading: false });
      return { success: false, error: 'Erreur de mise à jour' };
    }
  }
}

export default AuthService.getInstance();