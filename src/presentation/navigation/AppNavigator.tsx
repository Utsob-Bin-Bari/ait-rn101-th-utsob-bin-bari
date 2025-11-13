import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import AuthStackNavigator from './AuthStackNavigator';
import TabNavigator from './TabNavigator';
import { checkExistingSession } from '../../application/services/auth';
import { setUserInfo } from '../../application/store/action/auth/setUserInfo';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState<string>('Auth');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await checkExistingSession();
        
        if (result.success && result.data) {
          if (result.data.isGuest) {
            const { setGuestInfo } = await import('../../application/store/action/auth/setGuestInfo');
            dispatch(setGuestInfo({
              id: result.data.id,
              email: result.data.email,
              name: result.data.name,
              accessToken: result.data.accessToken,
              isGuest: true,
            }));
          } else {
            dispatch(setUserInfo(result.data));
          }
          setInitialRoute('Main');
        } else {
          setInitialRoute('Auth');
        }
      } catch (error) {
        console.error('Session check error:', error);
        setInitialRoute('Auth');
      } finally {
        setIsReady(true);
      }
    };

    checkSession();
  }, [dispatch]);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

