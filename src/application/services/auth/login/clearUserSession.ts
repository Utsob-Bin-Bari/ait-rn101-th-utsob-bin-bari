import { userSessionStorage } from '../../../../infrastructure/storage/userSessionStorage';

export const clearUserSession = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await userSessionStorage.clear();
    return result;
  } catch (error: any) {
    let errorMessage = 'Failed to clear user session';
    if (error.message) {
      errorMessage = `Clear session failed: ${error.message}`;
    }
    
    console.error('Clear session error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

