import { ApiService } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SMSMessage, SMSBalance } from '@/types';

export interface SMSCost {
  local: number; // Coût pour SMS local
  international: number; // Coût pour SMS international
  currency: string;
}

export interface SMSTemplate {
  type: 'verification' | 'invitation' | 'notification' | 'reminder';
  template: string;
  variables: string[];
}

class SMSService {
  private static instance: SMSService;

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService();
    }
    return SMSService.instance;
  }

  /**
   * Obtenir le solde SMS de l'utilisateur
   */
  async getSMSBalance(): Promise<SMSBalance | null> {
    try {
      const response = await ApiService.getInstance().request('/sms/balance', {
        method: 'GET',
      });

      if (response.success) {
        await this.saveSMSBalanceLocally(response.data);
        return response.data;
      } else {
        return await this.getLocalSMSBalance();
      }
    } catch (error) {
      console.error('Erreur getSMSBalance:', error);
      return await this.getLocalSMSBalance();
    }
  }

  /**
   * Obtenir les tarifs SMS
   */
  async getSMSCosts(): Promise<SMSCost> {
    try {
      const response = await ApiService.getInstance().request('/sms/costs', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        // Tarifs par défaut
        return {
          local: 25, // 25 FCFA
          international: 50, // 50 FCFA
          currency: 'FCFA'
        };
      }
    } catch (error) {
      console.error('Erreur getSMSCosts:', error);
      return {
        local: 25,
        international: 50,
        currency: 'FCFA'
      };
    }
  }

  /**
   * Calculer le coût d'un SMS
   */
  async calculateSMSCost(phoneNumber: string, messageLength: number): Promise<number> {
    try {
      const costs = await this.getSMSCosts();
      const isInternational = !phoneNumber.startsWith('+221') && !phoneNumber.startsWith('221');
      const baseCost = isInternational ? costs.international : costs.local;
      
      // Calculer le nombre de SMS (160 caractères par SMS)
      const smsCount = Math.ceil(messageLength / 160);
      
      return baseCost * smsCount;
    } catch (error) {
      console.error('Erreur calculateSMSCost:', error);
      return 25; // Coût par défaut
    }
  }

  /**
   * Envoyer un SMS de vérification
   */
  async sendVerificationSMS(phoneNumber: string, code: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = `Votre code de vérification est: ${code}. Ne le partagez avec personne.`;
      
      return await this.sendSMS({
        to: phoneNumber,
        message,
        type: 'verification'
      });
    } catch (error) {
      console.error('Erreur sendVerificationSMS:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du SMS de vérification'
      };
    }
  }

  /**
   * Envoyer un SMS d'invitation client
   */
  async sendClientInvitation(phoneNumber: string, shopName: string, loginLink: string, tempPassword: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = `Bonjour! ${shopName} vous a créé un compte sur notre plateforme. Votre mot de passe temporaire: ${tempPassword}. Connectez-vous: ${loginLink}`;
      
      return await this.sendSMS({
        to: phoneNumber,
        message,
        type: 'invitation'
      });
    } catch (error) {
      console.error('Erreur sendClientInvitation:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi de l\'invitation'
      };
    }
  }

  /**
   * Envoyer un SMS de notification
   */
  async sendNotificationSMS(phoneNumber: string, title: string, content: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const message = `${title}\n${content}`;
      
      return await this.sendSMS({
        to: phoneNumber,
        message,
        type: 'notification'
      });
    } catch (error) {
      console.error('Erreur sendNotificationSMS:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi de la notification'
      };
    }
  }

  /**
   * Envoyer un SMS de rappel
   */
  async sendReminderSMS(phoneNumber: string, reminderText: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      return await this.sendSMS({
        to: phoneNumber,
        message: reminderText,
        type: 'reminder'
      });
    } catch (error) {
      console.error('Erreur sendReminderSMS:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'envoi du rappel'
      };
    }
  }

  /**
   * Envoyer un SMS générique
   */
  private async sendSMS(smsData: {
    to: string;
    message: string;
    type: 'verification' | 'invitation' | 'notification' | 'reminder';
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Vérifier le solde SMS d'abord
      const balance = await this.getSMSBalance();
      const cost = await this.calculateSMSCost(smsData.to, smsData.message.length);
      
      if (balance && balance.balance < cost) {
        return {
          success: false,
          error: `Solde SMS insuffisant. Solde: ${balance.balance} FCFA, Coût: ${cost} FCFA. Veuillez recharger votre compte.`
        };
      }

      const response = await ApiService.getInstance().request('/sms/send', {
        method: 'POST',
        body: JSON.stringify(smsData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        // Mettre à jour le solde localement
        if (balance) {
          const newBalance = {
            ...balance,
            balance: balance.balance - cost,
            totalSpent: balance.totalSpent + cost
          };
          await this.saveSMSBalanceLocally(newBalance);
        }

        return {
          success: true,
          messageId: response.data.messageId
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de l\'envoi du SMS'
        };
      }
    } catch (error) {
      console.error('Erreur sendSMS:', error);
      
      // En cas d'erreur réseau, sauvegarder pour envoi ultérieur
      await this.savePendingSMS(smsData);
      
      return {
        success: false,
        error: 'Erreur de connexion. SMS mis en attente d\'envoi.'
      };
    }
  }

  /**
   * Recharger le solde SMS
   */
  async rechargeSMSBalance(amount: number, paymentMethod: string): Promise<{ success: boolean; newBalance?: number; error?: string }> {
    try {
      const response = await ApiService.getInstance().request('/sms/recharge', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          paymentMethod
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        // Mettre à jour le solde local
        await this.saveSMSBalanceLocally(response.data.balance);
        
        return {
          success: true,
          newBalance: response.data.balance.balance
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de la recharge'
        };
      }
    } catch (error) {
      console.error('Erreur rechargeSMSBalance:', error);
      return {
        success: false,
        error: 'Erreur de connexion'
      };
    }
  }

  /**
   * Obtenir l'historique des SMS
   */
  async getSMSHistory(page = 1, limit = 50): Promise<{ messages: SMSMessage[]; total: number }> {
    try {
      const response = await ApiService.getInstance().request('/sms/history', {
        method: 'GET',
        params: {
          page: page.toString(),
          limit: limit.toString()
        },
      });

      if (response.success) {
        return response.data;
      } else {
        return { messages: [], total: 0 };
      }
    } catch (error) {
      console.error('Erreur getSMSHistory:', error);
      return { messages: [], total: 0 };
    }
  }

  /**
   * Obtenir les templates SMS
   */
  async getSMSTemplates(): Promise<SMSTemplate[]> {
    try {
      const response = await ApiService.getInstance().request('/sms/templates', {
        method: 'GET',
      });

      if (response.success) {
        return response.data;
      } else {
        return this.getDefaultTemplates();
      }
    } catch (error) {
      console.error('Erreur getSMSTemplates:', error);
      return this.getDefaultTemplates();
    }
  }

  /**
   * Valider un numéro de téléphone
   */
  validatePhoneNumber(phoneNumber: string): { valid: boolean; formatted?: string; error?: string } {
    // Supprimer tous les espaces et caractères spéciaux
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Vérifier la longueur
    if (cleaned.length < 8 || cleaned.length > 15) {
      return {
        valid: false,
        error: 'Numéro de téléphone invalide'
      };
    }

    // Formatter pour le Sénégal
    let formatted = cleaned;
    if (cleaned.startsWith('221')) {
      formatted = `+${cleaned}`;
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      formatted = `+221${cleaned}`;
    } else if (!cleaned.startsWith('+')) {
      formatted = `+${cleaned}`;
    }

    return {
      valid: true,
      formatted
    };
  }

  /**
   * Synchroniser les SMS en attente
   */
  async syncPendingSMS(): Promise<void> {
    try {
      const pendingSMS = await this.getPendingSMS();
      const successfulSends: string[] = [];

      for (const sms of pendingSMS) {
        try {
          const result = await this.sendSMS(sms.data);
          if (result.success) {
            successfulSends.push(sms.id);
          }
        } catch (error) {
          console.error('Erreur sync SMS:', error);
        }
      }

      // Supprimer les SMS envoyés avec succès
      const remainingSMS = pendingSMS.filter(sms => !successfulSends.includes(sms.id));
      await this.savePendingSMSList(remainingSMS);
    } catch (error) {
      console.error('Erreur syncPendingSMS:', error);
    }
  }

  // Méthodes privées pour la gestion locale
  private async saveSMSBalanceLocally(balance: SMSBalance): Promise<void> {
    try {
      await AsyncStorage.setItem('sms_balance', JSON.stringify(balance));
    } catch (error) {
      console.error('Erreur sauvegarde solde SMS:', error);
    }
  }

  private async getLocalSMSBalance(): Promise<SMSBalance | null> {
    try {
      const balance = await AsyncStorage.getItem('sms_balance');
      return balance ? JSON.parse(balance) : null;
    } catch (error) {
      console.error('Erreur lecture solde SMS:', error);
      return null;
    }
  }

  private async savePendingSMS(smsData: any): Promise<void> {
    try {
      const pendingSMS = await this.getPendingSMS();
      const newSMS = {
        id: Date.now().toString(),
        data: smsData,
        createdAt: new Date().toISOString()
      };
      
      pendingSMS.push(newSMS);
      await this.savePendingSMSList(pendingSMS);
    } catch (error) {
      console.error('Erreur sauvegarde SMS en attente:', error);
    }
  }

  private async getPendingSMS(): Promise<any[]> {
    try {
      const pending = await AsyncStorage.getItem('pending_sms');
      return pending ? JSON.parse(pending) : [];
    } catch (error) {
      console.error('Erreur lecture SMS en attente:', error);
      return [];
    }
  }

  private async savePendingSMSList(smsList: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem('pending_sms', JSON.stringify(smsList));
    } catch (error) {
      console.error('Erreur sauvegarde liste SMS:', error);
    }
  }

  private getDefaultTemplates(): SMSTemplate[] {
    return [
      {
        type: 'verification',
        template: 'Votre code de vérification est: {code}. Ne le partagez avec personne.',
        variables: ['code']
      },
      {
        type: 'invitation',
        template: 'Bonjour! {shopName} vous a créé un compte. Mot de passe: {password}. Lien: {link}',
        variables: ['shopName', 'password', 'link']
      },
      {
        type: 'notification',
        template: '{title}\n{content}',
        variables: ['title', 'content']
      },
      {
        type: 'reminder',
        template: 'Rappel: {message}',
        variables: ['message']
      }
    ];
  }

  /**
   * Nettoyer le cache SMS
   */
  async clearSMSCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem('sms_balance');
      await AsyncStorage.removeItem('pending_sms');
    } catch (error) {
      console.error('Erreur nettoyage cache SMS:', error);
    }
  }
}

export default SMSService;