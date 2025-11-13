import { createGuestUser, GuestUser } from '../../../domain/types/auth';

export const loginAsGuest = async (): Promise<{
  success: boolean;
  data?: GuestUser;
  error?: string;
}> => {
  try {
    const guestUser = createGuestUser();
    
    return {
      success: true,
      data: guestUser,
    };
  } catch (error: any) {
    console.error('Guest login error:', error);
    
    return {
      success: false,
      error: 'Failed to enter as guest. Please try again.',
    };
  }
};

