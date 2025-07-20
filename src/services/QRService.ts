import QRCode from 'react-native-qrcode-generator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  QRData, 
  QRGenerationResponse, 
  Loan, 
  ApiResponse,
  UserRole 
} from '@/types';
import { ApiService } from './ApiService';
import AuthService from './AuthService';

class QRServiceClass {
  private static instance: QRServiceClass;
  private readonly QR_EXPIRY_MINUTES = 5; // 5 minutes d'expiration

  public static getInstance(): QRServiceClass {
    if (!QRServiceClass.instance) {
      QRServiceClass.instance = new QRServiceClass();
    }
    return QRServiceClass.instance;
  }

  // Génération de QR Code pour un emprunt (côté client)
  public async generateLoanQR(loanId: number): Promise<ApiResponse<QRGenerationResponse>> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== UserRole.CLIENT) {
        return {
          success: false,
          error: 'Seuls les clients peuvent générer des QR codes de paiement'
        };
      }

      // Récupérer les détails de l'emprunt
      const loanResponse = await ApiService.get<Loan>(`/loans/${loanId}`);
      if (!loanResponse.success || !loanResponse.data) {
        return {
          success: false,
          error: 'Emprunt non trouvé'
        };
      }

      const loan = loanResponse.data;

      // Vérifier que l'emprunt appartient au client
      if (loan.clientId !== user.id) {
        return {
          success: false,
          error: 'Vous ne pouvez générer un QR que pour vos propres emprunts'
        };
      }

      // Générer la signature et les données QR
      const timestamp = Date.now();
      const expiryTime = timestamp + (this.QR_EXPIRY_MINUTES * 60 * 1000);

      const qrData: QRData = {
        loanId: loan.id,
        clientId: loan.clientId,
        shopkeeperId: loan.shopkeeperId,
        amount: loan.remainingAmount,
        timestamp,
        signature: await this.generateSignature(loan, timestamp)
      };

      // Générer le QR code
      const qrCodeData = JSON.stringify(qrData);
      const qrCodeSVG = await this.createQRCodeSVG(qrCodeData);

      // Sauvegarder en local pour validation offline
      await this.saveQRDataLocally(loanId, qrData, expiryTime);

      // Informer le backend de la génération
      await ApiService.post('/qr/generate', {
        loanId,
        expiryTime,
        qrData: qrCodeData
      });

      return {
        success: true,
        data: {
          qrCode: qrCodeSVG,
          expiryTime,
          loanId
        }
      };

    } catch (error) {
      console.error('Erreur lors de la génération QR:', error);
      return {
        success: false,
        error: 'Erreur lors de la génération du QR code'
      };
    }
  }

  // Validation de QR Code (côté boutiquier)
  public async validateQR(qrCodeData: string): Promise<ApiResponse<{
    loan: Loan;
    isValid: boolean;
    message: string;
  }>> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== UserRole.SHOPKEEPER) {
        return {
          success: false,
          error: 'Seuls les boutiquiers peuvent valider des QR codes'
        };
      }

      // Parser les données QR
      let qrData: QRData;
      try {
        qrData = JSON.parse(qrCodeData);
      } catch (error) {
        return {
          success: false,
          error: 'QR code invalide ou corrompu'
        };
      }

      // Vérifier l'expiration
      const currentTime = Date.now();
      const qrAge = currentTime - qrData.timestamp;
      const maxAge = this.QR_EXPIRY_MINUTES * 60 * 1000;

      if (qrAge > maxAge) {
        return {
          success: false,
          error: 'QR code expiré. Demandez au client de générer un nouveau code.'
        };
      }

      // Vérifier que le QR correspond au boutiquier
      if (qrData.shopkeeperId !== user.id) {
        return {
          success: false,
          error: 'Ce QR code ne correspond pas à votre boutique'
        };
      }

      // Valider avec le backend
      const validationResponse = await ApiService.post<{
        loan: Loan;
        isValid: boolean;
        message: string;
      }>('/qr/validate', {
        qrData: qrCodeData,
        shopkeeperId: user.id
      });

      if (!validationResponse.success) {
        return {
          success: false,
          error: validationResponse.error || 'Erreur de validation'
        };
      }

      return validationResponse;

    } catch (error) {
      console.error('Erreur lors de la validation QR:', error);
      return {
        success: false,
        error: 'Erreur lors de la validation du QR code'
      };
    }
  }

  // Confirmer le paiement après validation QR
  public async confirmPayment(
    loanId: number, 
    amount?: number,
    paymentMethod: 'full' | 'partial' = 'full'
  ): Promise<ApiResponse<Loan>> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user || user.role !== UserRole.SHOPKEEPER) {
        return {
          success: false,
          error: 'Seuls les boutiquiers peuvent confirmer des paiements'
        };
      }

      const response = await ApiService.post<Loan>('/payments/confirm', {
        loanId,
        amount,
        paymentMethod,
        shopkeeperId: user.id
      });

      if (response.success) {
        // Nettoyer les données QR locales après confirmation
        await this.clearQRDataLocally(loanId);
      }

      return response;

    } catch (error) {
      console.error('Erreur lors de la confirmation de paiement:', error);
      return {
        success: false,
        error: 'Erreur lors de la confirmation du paiement'
      };
    }
  }

  // Générer une signature sécurisée pour le QR
  private async generateSignature(loan: Loan, timestamp: number): Promise<string> {
    // En production, utiliser une vraie cryptographie (crypto-js par exemple)
    const data = `${loan.id}-${loan.clientId}-${loan.shopkeeperId}-${loan.remainingAmount}-${timestamp}`;
    
    // Simple hash pour la démo (remplacer par HMAC-SHA256 en production)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Créer le SVG du QR code
  private async createQRCodeSVG(data: string): Promise<string> {
    try {
      return QRCode.create(data, {
        errorCorrectionLevel: 'M',
        type: 'svg',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
    } catch (error) {
      throw new Error('Erreur lors de la création du QR code');
    }
  }

  // Sauvegarder les données QR localement
  private async saveQRDataLocally(
    loanId: number, 
    qrData: QRData, 
    expiryTime: number
  ): Promise<void> {
    try {
      const localData = {
        qrData,
        expiryTime,
        createdAt: Date.now()
      };
      
      await AsyncStorage.setItem(
        `qr_data_${loanId}`, 
        JSON.stringify(localData)
      );
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde QR locale:', error);
    }
  }

  // Récupérer les données QR locales
  public async getQRDataLocally(loanId: number): Promise<{
    qrData: QRData;
    expiryTime: number;
    isExpired: boolean;
  } | null> {
    try {
      const storedData = await AsyncStorage.getItem(`qr_data_${loanId}`);
      if (!storedData) return null;

      const localData = JSON.parse(storedData);
      const currentTime = Date.now();
      const isExpired = currentTime > localData.expiryTime;

      return {
        qrData: localData.qrData,
        expiryTime: localData.expiryTime,
        isExpired
      };
    } catch (error) {
      console.warn('Erreur lors de la récupération QR locale:', error);
      return null;
    }
  }

  // Nettoyer les données QR locales
  private async clearQRDataLocally(loanId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem(`qr_data_${loanId}`);
    } catch (error) {
      console.warn('Erreur lors du nettoyage QR local:', error);
    }
  }

  // Nettoyer tous les QR expirés
  public async cleanupExpiredQRs(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const qrKeys = keys.filter(key => key.startsWith('qr_data_'));
      
      for (const key of qrKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const localData = JSON.parse(data);
          const currentTime = Date.now();
          
          if (currentTime > localData.expiryTime) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.warn('Erreur lors du nettoyage des QR expirés:', error);
    }
  }

  // Vérifier si un QR est encore valide
  public async isQRValid(loanId: number): Promise<boolean> {
    const localData = await this.getQRDataLocally(loanId);
    return localData ? !localData.isExpired : false;
  }

  // Obtenir le temps restant pour un QR
  public async getQRTimeRemaining(loanId: number): Promise<number> {
    const localData = await this.getQRDataLocally(loanId);
    if (!localData) return 0;

    const currentTime = Date.now();
    const remaining = localData.expiryTime - currentTime;
    
    return Math.max(0, remaining);
  }

  // Formater le temps restant en minutes et secondes
  public formatTimeRemaining(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Générer un QR de test (pour le développement)
  public async generateTestQR(): Promise<string> {
    const testData = {
      test: true,
      timestamp: Date.now(),
      message: 'QR Code de test'
    };
    
    return this.createQRCodeSVG(JSON.stringify(testData));
  }
}

export const QRService = QRServiceClass.getInstance();