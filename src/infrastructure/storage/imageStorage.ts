import ReactNativeBlobUtil from 'react-native-blob-util';

const { fs } = ReactNativeBlobUtil;

/** Strip file:// prefix so react-native-blob-util receives a raw filesystem path. */
const toRawPath = (path: string): string => path.replace(/^file:\/\//, '');

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
      
      const rawPath = `${imageStorage.getImageDirectory()}/${fileName}`;
      await fs.writeFile(rawPath, base64, 'base64');
      
      // Return a file:// URI so React Native's Image component can render it directly.
      return `file://${rawPath}`;
    } catch (error) {
      console.error('Error saving image to storage:', error);
      throw error;
    }
  },

  loadImage: async (filePath: string): Promise<string> => {
    try {
      const rawPath = toRawPath(filePath);
      const exists = await fs.exists(rawPath);
      
      if (!exists) {
        throw new Error('Image file not found');
      }
      
      const base64 = await fs.readFile(rawPath, 'base64');
      return base64;
    } catch (error) {
      console.error('Error loading image from storage:', error);
      throw error;
    }
  },

  deleteImage: async (filePath: string): Promise<void> => {
    try {
      const rawPath = toRawPath(filePath);
      const exists = await fs.exists(rawPath);
      
      if (exists) {
        await fs.unlink(rawPath);
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
      const stats = await fs.stat(toRawPath(filePath));
      return Number(stats.size);
    } catch (error) {
      console.error('Error getting image size:', error);
      return 0;
    }
  }
};

