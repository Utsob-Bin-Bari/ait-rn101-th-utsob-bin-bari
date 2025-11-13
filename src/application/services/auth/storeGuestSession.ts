import { GuestUser } from '../../../domain/types/auth';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';

export const storeGuestSession = async (guestUser: GuestUser): Promise<void> => {
  try {
    await userSessionStorage.store({
      id: guestUser.id,
      email: guestUser.email,
      name: guestUser.name,
      accessToken: guestUser.accessToken,
      isGuest: true,
    });
  } catch (error) {
    console.error('Error storing guest session:', error);
    throw error;
  }
};

