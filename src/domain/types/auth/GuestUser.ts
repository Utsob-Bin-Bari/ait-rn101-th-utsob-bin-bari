export interface GuestUser {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  isGuest: boolean;
}

export const GUEST_USER_ID = 'GUEST_USER_LOCAL';

export const createGuestUser = (): GuestUser => ({
  id: GUEST_USER_ID,
  email: 'guest@local.app',
  name: 'Guest User',
  accessToken: '',
  isGuest: true,
});

