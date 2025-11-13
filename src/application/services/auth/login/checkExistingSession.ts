import { userSessionStorage } from '../../../../infrastructure/storage/userSessionStorage';

export const checkExistingSession = async (): Promise<{
  success: boolean;
  data?: {
    id: string;
    email: string;
    name: string;
    accessToken: string;
    isGuest?: boolean;
  };
  error?: string;
}> => {
  try {
    const result = await userSessionStorage.get();
    return result;
  } catch (error: any) {
    let errorMessage = 'Failed to check existing session';
    if (error.message) {
      errorMessage = `Session check failed: ${error.message}`;
    }
    
    console.error('Check session error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

