export interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    accessToken: string;
  } | null;
  loading: boolean;
}

export interface RootState {
  auth: AuthState;
}

