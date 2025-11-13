import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { validateLoginForm } from '../../domain/validators/loginValidator';
import { loginUser, storeUserSession, loginAsGuest, storeGuestSession } from '../../application/services/auth';
import { setUserInfo } from '../../application/store/action/auth/setUserInfo';
import { setGuestInfo } from '../../application/store/action/auth/setGuestInfo';

export const useLogin = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: [] as string[],
    password: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  const handleLogin = async () => {
    setFieldErrors({
      email: [],
      password: []
    });
    setLoginError('');
    
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setLoading(true);
    
    try {
      const result = await loginUser({ email, password });
      
      if (result.success && result.data) {
        const { user, token } = result.data;

        const userInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          accessToken: token
        };
        
        dispatch(setUserInfo(userInfo));

        await storeUserSession(userInfo);
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
    } catch (error) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);
    setLoginError('');

    try {
      const result = await loginAsGuest();

      if (result.success && result.data) {
        dispatch(setGuestInfo(result.data));

        await storeGuestSession(result.data);

        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        setLoginError(result.error || 'Failed to continue as guest.');
      }
    } catch (error) {
      setLoginError('Something went wrong. Please try again.');
    } finally {
      setGuestLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('SignUp');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    guestLoading,
    fieldErrors,
    loginError,
    handleLogin,
    handleGuestLogin,
    navigateToSignup,
    showPassword,
    setShowPassword,
  };
};

