import { userSessionStorage } from '../../../../infrastructure/storage/userSessionStorage';

export const storeUserSession = async (userData: {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!userData.id || !userData.email || !userData.accessToken) {
      return {
        success: false,
        error: 'Invalid user data: missing required fields'
      };
    }
    
    const result = await userSessionStorage.store(userData);
    
    return result;
  } catch (error: any) {
    let errorMessage = 'Failed to store user session';
    if (error.message) {
      errorMessage = `Store session failed: ${error.message}`;
    }
    
    console.error('Store session error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

