import { GuestUser } from '../../../../domain/types/auth';

export const setGuestInfo = (guestUser: GuestUser) => ({
  type: 'SET_GUEST_INFO',
  payload: guestUser,
});

