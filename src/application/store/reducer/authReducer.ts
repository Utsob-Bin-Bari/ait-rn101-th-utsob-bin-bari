import { AuthState } from '../../../domain/types/store/AuthState';
import { initialAuthState } from '../initialState';

const authReducer = (state: AuthState = initialAuthState, action: any): AuthState => {
  switch (action.type) {
    case 'SET_USER_INFO':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isGuest: false,
        loading: false,
      };
    case 'SET_GUEST_INFO':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isGuest: true,
        loading: false,
      };
    case 'CLEAR_USER_INFO':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isGuest: false,
        loading: false,
      };
    case 'SET_AUTH_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;

