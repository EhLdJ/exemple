import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';

interface ImagePickerProps {
  onImageSelected: (imageUri: string, imageData?: any) => void;
  placeholder?: string;
  currentImage?: string;
  style?: any;
  imageStyle?: any;
  disabled?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mediaType?: MediaType;
  allowsEditing?: boolean;
  borderRadius?: number;
}

const { width, height } = Dimensions.get('window');

const ImagePickerComponent: React.FC<ImagePickerProps> = ({
  onImageSelected,
  placeholder = "Ajouter une photo",
  currentImage,
  style,
  imageStyle,
  disabled = false,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8,
  mediaType = 'photo',
  allowsEditing = true,
  borderRadius = 8,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const imagePickerOptions = {
    mediaType,
    includeBase64: false,
    maxHeight,
    maxWidth,
    quality,
    allowsEditing,
    storageOptions: {
      skipBackup: true,
      path: 'images',
    },
  };

  const showImagePicker = () => {
    if (disabled) return;
    setModalVisible(true);
  };

  const selectFromCamera = () => {
    setModalVisible(false);
    setLoading(true);
    
    launchCamera(imagePickerOptions, (response: ImagePickerResponse) => {
      setLoading(false);
      if (response.didCancel) {
        return;
      }
      
      if (response.errorMessage) {
        Alert.alert('Erreur', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          onImageSelected(asset.uri, asset);
        }
      }
    });
  };

  const selectFromLibrary = () => {
    setModalVisible(false);
    setLoading(true);
    
    launchImageLibrary(imagePickerOptions, (response: ImagePickerResponse) => {
      setLoading(false);
      if (response.didCancel) {
        return;
      }
      
      if (response.errorMessage) {
        Alert.alert('Erreur', response.errorMessage);
        return;
      }

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        if (asset.uri) {
          onImageSelected(asset.uri, asset);
        }
      }
    });
  };

  const removeImage = () => {
    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => onImageSelected('', null)
        }
      ]
    );
  };

  const showPreview = () => {
    if (currentImage) {
      setPreviewVisible(true);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.container, style, { borderRadius }]}
        onPress={currentImage ? showPreview : showImagePicker}
        disabled={disabled || loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : currentImage ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: currentImage }}
              style={[styles.image, imageStyle, { borderRadius }]}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={showImagePicker}
              >
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={removeImage}
              >
                <Icon name="delete" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="add-a-photo" size={40} color="#999" />
            <Text style={styles.placeholderText}>{placeholder}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Modal de sélection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choisir une photo</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={selectFromCamera}
            >
              <Icon name="camera-alt" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>Prendre une photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={selectFromLibrary}
            >
              <Icon name="photo-library" size={24} color="#2196F3" />
              <Text style={styles.modalOptionText}>Choisir dans la galerie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de prévisualisation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setPreviewVisible(false)}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {currentImage && (
            <Image
              source={{ uri: currentImage }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
          
          <View style={styles.previewActions}>
            <TouchableOpacity
              style={styles.previewActionButton}
              onPress={() => {
                setPreviewVisible(false);
                showImagePicker();
              }}
            >
              <Icon name="edit" size={24} color="#fff" />
              <Text style={styles.previewActionText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.previewActionButton, styles.deleteActionButton]}
              onPress={() => {
                setPreviewVisible(false);
                removeImage();
              }}
            >
              <Icon name="delete" size={24} color="#fff" />
              <Text style={styles.previewActionText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 20,
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    borderRadius: 20,
    padding: 8,
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  modalOptionText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
  },
  modalCancel: {
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    padding: 10,
  },
  previewImage: {
    width: width - 40,
    height: height - 200,
  },
  previewActions: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width - 80,
  },
  previewActionButton: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 100,
  },
  deleteActionButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  previewActionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default ImagePickerComponent;