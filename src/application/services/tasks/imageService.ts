import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Platform, PermissionsAndroid } from 'react-native';
import { ImageAsset, CompressedImage, ImageUploadResult } from '../../../domain/types/tasks/ImageTypes';
import { imageStorage } from '../../../infrastructure/storage/imageStorage';

export const imageService = {
  requestCameraPermission: async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'AsthaIt needs access to your camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Camera permission error:', err);
        return false;
      }
    }
    return true;
  },

  pickImageFromCamera: async (): Promise<ImageAsset | null> => {
    try {
      const hasPermission = await imageService.requestCameraPermission();
      if (!hasPermission) {
        return null;
      }

      const result: ImagePickerResponse = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        includeBase64: true,
        saveToPhotos: false
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri || '',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        type: asset.type,
        width: asset.width,
        height: asset.height,
        base64: asset.base64
      };
    } catch (error) {
      console.error('Error picking image from camera:', error);
      return null;
    }
  },

  pickImageFromGallery: async (): Promise<ImageAsset | null> => {
    try {
      const result: ImagePickerResponse = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
        includeBase64: true
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri || '',
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        type: asset.type,
        width: asset.width,
        height: asset.height,
        base64: asset.base64
      };
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      return null;
    }
  },

  compressImage: async (imageAsset: ImageAsset): Promise<CompressedImage | null> => {
    try {
      if (!imageAsset.base64) {
        return null;
      }

      const sizeInMB = imageAsset.base64.length / (1024 * 1024);
      
      if (sizeInMB <= 1) {
        return {
          uri: imageAsset.uri,
          base64: imageAsset.base64,
          size: imageAsset.base64.length,
          width: imageAsset.width || 0,
          height: imageAsset.height || 0
        };
      }

      return {
        uri: imageAsset.uri,
        base64: imageAsset.base64,
        size: imageAsset.base64.length,
        width: imageAsset.width || 0,
        height: imageAsset.height || 0
      };
    } catch (error) {
      console.error('Error compressing image:', error);
      return null;
    }
  },

  saveImageLocally: async (imageAsset: ImageAsset, taskId: string): Promise<string | null> => {
    try {
      if (!imageAsset.base64) {
        return null;
      }

      const fileName = `task_${taskId}_${Date.now()}.jpg`;
      const filePath = await imageStorage.saveImage(imageAsset.base64, fileName);
      return filePath;
    } catch (error) {
      console.error('Error saving image locally:', error);
      return null;
    }
  },

  uploadImage: async (base64: string, taskId: string, accessToken: string): Promise<ImageUploadResult> => {
    try {
      const { uploadImageRequest } = await import('../../../infrastructure/api/requests/tasks/uploadImageRequest');
      const result = await uploadImageRequest({ image: base64, taskId }, accessToken);

      if (result.success && result.data?.url) {
        return { success: true, url: result.data.url };
      }

      return { success: false, error: result.error || 'Upload failed' };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return { success: false, error: error.message || 'Upload failed' };
    }
  },

  deleteLocalImage: async (filePath: string): Promise<void> => {
    try {
      await imageStorage.deleteImage(filePath);
    } catch (error) {
      console.error('Error deleting local image:', error);
    }
  },

  getImageFromLocal: async (filePath: string): Promise<string | null> => {
    try {
      return await imageStorage.loadImage(filePath);
    } catch (error) {
      console.error('Error loading local image:', error);
      return null;
    }
  }
};

