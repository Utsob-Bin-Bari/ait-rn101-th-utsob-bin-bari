import { SignUpRequest } from '../../../../domain/types/auth';
import { signUpRequest } from '../../../../infrastructure/api/requests/auth/signUpRequest';

export const signupUser = async (credentials: SignUpRequest): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string 
}> => {
  try {
    console.warn('Signing up with credentials:', { ...credentials, password: '***' });
    const response = await signUpRequest({ requestBody: credentials });
    
    console.warn('Signup response received:', JSON.stringify(response, null, 2));
    
    if (response && response.access_token) {
      return {
        success: true,
        data: { 
          user: response.user,
          token: response.access_token
        }
      };
    } else {
      console.error('Response missing access_token:', response);
      const errorMessage = 'Signup failed. Please try again.';
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error: any) {
    console.error('Signup error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let errorMessage = 'Signup failed. Please try again.';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Email already exists or invalid data provided';
    } else if (error.response?.status === 409) {
      errorMessage = error.response.data?.message || 'An account with this email already exists';
    } else if (error.response?.status === 422) {
      errorMessage = error.response.data?.message || 'Please check your information and try again';
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    console.error('Signup error:', error);
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
