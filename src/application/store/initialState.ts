import { AuthState } from '../../domain/types/store/AuthState';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export const initialState = {
  auth: initialAuthState,
};

