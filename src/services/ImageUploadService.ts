import { ApiService } from './ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageUploadResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  localUri?: string;
}

export interface ImageData {
  uri: string;
  type?: string;
  name?: string;
  size?: number;
}

class ImageUploadService {
  private static instance: ImageUploadService;
  private uploadQueue: Map<string, Promise<ImageUploadResult>> = new Map();

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService();
    }
    return ImageUploadService.instance;
  }

  /**
   * Upload une image vers le serveur
   */
  async uploadImage(
    imageData: ImageData,
    category: 'profile' | 'product' | 'loan' | 'document',
    userId?: string
  ): Promise<ImageUploadResult> {
    try {
      // Générer un ID unique pour éviter les uploads doubles
      const uploadId = `${category}_${Date.now()}_${Math.random()}`;
      
      // Vérifier si un upload identique est déjà en cours
      if (this.uploadQueue.has(uploadId)) {
        return await this.uploadQueue.get(uploadId)!;
      }

      // Créer la promesse d'upload
      const uploadPromise = this.performUpload(imageData, category, userId);
      this.uploadQueue.set(uploadId, uploadPromise);

      const result = await uploadPromise;
      
      // Nettoyer la queue
      this.uploadQueue.delete(uploadId);
      
      return result;
    } catch (error) {
      console.error('Erreur upload image:', error);
      return {
        success: false,
        error: 'Erreur lors de l\'upload de l\'image'
      };
    }
  }

  private async performUpload(
    imageData: ImageData,
    category: string,
    userId?: string
  ): Promise<ImageUploadResult> {
    try {
      // Préparer les données FormData
      const formData = new FormData();
      
      // Déterminer le type MIME
      const fileExtension = imageData.uri.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg';
      
      switch (fileExtension) {
        case 'png':
          mimeType = 'image/png';
          break;
        case 'gif':
          mimeType = 'image/gif';
          break;
        case 'webp':
          mimeType = 'image/webp';
          break;
      }

      // Générer un nom de fichier unique
      const fileName = `${category}_${Date.now()}.${fileExtension || 'jpg'}`;

      formData.append('image', {
        uri: imageData.uri,
        type: mimeType,
        name: fileName,
      } as any);

      formData.append('category', category);
      
      if (userId) {
        formData.append('userId', userId);
      }

      // Envoyer via ApiService
      const response = await ApiService.getInstance().request('/upload/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.success) {
        // Sauvegarder en cache local
        await this.saveToLocalCache(fileName, imageData.uri, response.data.imageUrl);
        
        return {
          success: true,
          imageUrl: response.data.imageUrl,
          localUri: imageData.uri
        };
      } else {
        return {
          success: false,
          error: response.error || 'Erreur lors de l\'upload'
        };
      }
    } catch (error) {
      console.error('Erreur performUpload:', error);
      return {
        success: false,
        error: 'Erreur de connexion lors de l\'upload'
      };
    }
  }

  /**
   * Upload photo de profil
   */
  async uploadProfilePicture(imageData: ImageData, userId: string): Promise<ImageUploadResult> {
    const result = await this.uploadImage(imageData, 'profile', userId);
    
    if (result.success && result.imageUrl) {
      // Mettre à jour le profil utilisateur localement
      await this.updateUserProfileImage(userId, result.imageUrl);
    }
    
    return result;
  }

  /**
   * Upload photo de produit
   */
  async uploadProductImage(imageData: ImageData, productId?: string): Promise<ImageUploadResult> {
    return await this.uploadImage(imageData, 'product', productId);
  }

  /**
   * Upload image de prêt/emprunt
   */
  async uploadLoanImage(imageData: ImageData, loanId?: string): Promise<ImageUploadResult> {
    return await this.uploadImage(imageData, 'loan', loanId);
  }

  /**
   * Upload document
   */
  async uploadDocument(imageData: ImageData, documentType?: string): Promise<ImageUploadResult> {
    return await this.uploadImage(imageData, 'document', documentType);
  }

  /**
   * Supprimer une image du serveur
   */
  async deleteImage(imageUrl: string): Promise<boolean> {
    try {
      const response = await ApiService.getInstance().request('/upload/delete', {
        method: 'DELETE',
        body: JSON.stringify({ imageUrl }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.success) {
        // Supprimer du cache local aussi
        await this.removeFromLocalCache(imageUrl);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur suppression image:', error);
      return false;
    }
  }

  /**
   * Obtenir l'URL d'image optimisée
   */
  getOptimizedImageUrl(imageUrl: string, width?: number, height?: number, quality?: number): string {
    if (!imageUrl) return '';
    
    // Si c'est une URL locale, la retourner telle quelle
    if (imageUrl.startsWith('file://') || imageUrl.startsWith('content://')) {
      return imageUrl;
    }

    // Construire l'URL avec paramètres d'optimisation
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());

    const separator = imageUrl.includes('?') ? '&' : '?';
    return params.toString() ? `${imageUrl}${separator}${params.toString()}` : imageUrl;
  }

  /**
   * Compresser une image avant upload
   */
  async compressImage(imageUri: string, quality = 0.8, maxWidth = 1024, maxHeight = 1024): Promise<string> {
    // Note: Dans une implémentation réelle, utiliser react-native-image-resizer
    // Pour l'instant, retourner l'URI originale
    return imageUri;
  }

  /**
   * Valider une image avant upload
   */
  validateImage(imageData: ImageData): { valid: boolean; error?: string } {
    // Vérifier la taille (max 10MB)
    if (imageData.size && imageData.size > 10 * 1024 * 1024) {
      return { valid: false, error: 'L\'image est trop volumineuse (max 10MB)' };
    }

    // Vérifier l'extension
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExtension = imageData.uri.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return { valid: false, error: 'Format d\'image non supporté' };
    }

    return { valid: true };
  }

  /**
   * Obtenir les images en cache
   */
  async getCachedImages(): Promise<Array<{ fileName: string; localUri: string; remoteUrl: string }>> {
    try {
      const cacheData = await AsyncStorage.getItem('image_cache');
      return cacheData ? JSON.parse(cacheData) : [];
    } catch (error) {
      console.error('Erreur lecture cache images:', error);
      return [];
    }
  }

  /**
   * Nettoyer le cache d'images
   */
  async clearImageCache(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem('image_cache');
      return true;
    } catch (error) {
      console.error('Erreur nettoyage cache:', error);
      return false;
    }
  }

  /**
   * Sauvegarder en cache local
   */
  private async saveToLocalCache(fileName: string, localUri: string, remoteUrl: string): Promise<void> {
    try {
      const cachedImages = await this.getCachedImages();
      
      // Éviter les doublons
      const existingIndex = cachedImages.findIndex(item => item.fileName === fileName);
      if (existingIndex >= 0) {
        cachedImages[existingIndex] = { fileName, localUri, remoteUrl };
      } else {
        cachedImages.push({ fileName, localUri, remoteUrl });
      }

      // Limiter le cache à 100 images
      if (cachedImages.length > 100) {
        cachedImages.splice(0, cachedImages.length - 100);
      }

      await AsyncStorage.setItem('image_cache', JSON.stringify(cachedImages));
    } catch (error) {
      console.error('Erreur sauvegarde cache:', error);
    }
  }

  /**
   * Supprimer du cache local
   */
  private async removeFromLocalCache(remoteUrl: string): Promise<void> {
    try {
      const cachedImages = await this.getCachedImages();
      const filteredImages = cachedImages.filter(item => item.remoteUrl !== remoteUrl);
      await AsyncStorage.setItem('image_cache', JSON.stringify(filteredImages));
    } catch (error) {
      console.error('Erreur suppression cache:', error);
    }
  }

  /**
   * Mettre à jour l'image de profil utilisateur
   */
  private async updateUserProfileImage(userId: string, imageUrl: string): Promise<void> {
    try {
      // Mettre à jour le profil local
      const userKey = `user_profile_${userId}`;
      const userData = await AsyncStorage.getItem(userKey);
      
      if (userData) {
        const user = JSON.parse(userData);
        user.profileImage = imageUrl;
        await AsyncStorage.setItem(userKey, JSON.stringify(user));
      }
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
    }
  }

  /**
   * Synchroniser les images en attente
   */
  async syncPendingUploads(): Promise<void> {
    try {
      const pendingUploads = await AsyncStorage.getItem('pending_uploads');
      if (!pendingUploads) return;

      const uploads = JSON.parse(pendingUploads);
      const successfulUploads: string[] = [];

      for (const upload of uploads) {
        try {
          const result = await this.uploadImage(upload.imageData, upload.category, upload.userId);
          if (result.success) {
            successfulUploads.push(upload.id);
          }
        } catch (error) {
          console.error('Erreur sync upload:', error);
        }
      }

      // Supprimer les uploads réussis
      const remainingUploads = uploads.filter((upload: any) => !successfulUploads.includes(upload.id));
      await AsyncStorage.setItem('pending_uploads', JSON.stringify(remainingUploads));
    } catch (error) {
      console.error('Erreur synchronisation uploads:', error);
    }
  }
}

export default ImageUploadService;