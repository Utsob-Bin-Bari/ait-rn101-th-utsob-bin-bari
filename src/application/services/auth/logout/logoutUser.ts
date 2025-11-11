import { clearUserSession } from '../login/clearUserSession';

export const logoutUser = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const clearResult = await clearUserSession();
    
    if (!clearResult.success) {
      return {
        success: false,
        error: clearResult.error || 'Failed to logout'
      };
    }

    return { success: true };
  } catch (error: any) {
    let errorMessage = 'Logout failed';
    
    if (error.message) {
      errorMessage = error.message;
    }
    
    console.error('Logout error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

