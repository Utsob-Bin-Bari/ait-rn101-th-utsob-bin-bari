import ReactNativeBlobUtil from 'react-native-blob-util';

const { fs } = ReactNativeBlobUtil;

export const imageStorage = {
  getImageDirectory: (): string => {
    return `${fs.dirs.DocumentDir}/task_images`;
  },

  ensureDirectoryExists: async (): Promise<void> => {
    const dirPath = imageStorage.getImageDirectory();
    const dirExists = await fs.exists(dirPath);
    
    if (!dirExists) {
      await fs.mkdir(dirPath);
    }
  },

  saveImage: async (base64: string, fileName: string): Promise<string> => {
    try {
      await imageStorage.ensureDirectoryExists();
      
      const filePath = `${imageStorage.getImageDirectory()}/${fileName}`;
      await fs.writeFile(filePath, base64, 'base64');
      
      return filePath;
    } catch (error) {
      console.error('Error saving image to storage:', error);
      throw error;
    }
  },

  loadImage: async (filePath: string): Promise<string> => {
    try {
      const exists = await fs.exists(filePath);
      
      if (!exists) {
        throw new Error('Image file not found');
      }
      
      const base64 = await fs.readFile(filePath, 'base64');
      return base64;
    } catch (error) {
      console.error('Error loading image from storage:', error);
      throw error;
    }
  },

  deleteImage: async (filePath: string): Promise<void> => {
    try {
      const exists = await fs.exists(filePath);
      
      if (exists) {
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
      throw error;
    }
  },

  deleteAllImages: async (): Promise<void> => {
    try {
      const dirPath = imageStorage.getImageDirectory();
      const exists = await fs.exists(dirPath);
      
      if (exists) {
        await fs.unlink(dirPath);
      }
    } catch (error) {
      console.error('Error deleting all images:', error);
      throw error;
    }
  },

  getImageSize: async (filePath: string): Promise<number> => {
    try {
      const stats = await fs.stat(filePath);
      return Number(stats.size);
    } catch (error) {
      console.error('Error getting image size:', error);
      return 0;
    }
  }
};

