import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useDispatch } from 'react-redux';
import notifee, { EventType } from '@notifee/react-native';
import AuthStackNavigator from './AuthStackNavigator';
import TabNavigator from './TabNavigator';
import { checkExistingSession } from '../../application/services/auth';
import { setUserInfo } from '../../application/store/action/auth/setUserInfo';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState<string>('Auth');
  const [isReady, setIsReady] = useState(false);
  const navigationRef = useRef<any>(null);

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

  useEffect(() => {
    const handleNotificationPress = (taskId: string) => {
      if (navigationRef.current) {
        navigationRef.current.navigate('Main', {
          screen: 'Tasks',
          params: {
            screen: 'CreateTask',
            params: { taskId },
          },
        });
      }
    };

    const unsubscribeForeground = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS && detail.notification?.data?.taskId) {
        handleNotificationPress(detail.notification.data.taskId as string);
      }
    });

    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();
      if (initialNotification?.notification?.data?.taskId) {
        setTimeout(() => {
          handleNotificationPress(initialNotification.notification.data!.taskId as string);
        }, 1000);
      }
    };

    checkInitialNotification();

    return () => {
      unsubscribeForeground();
    };
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer ref={navigationRef}>
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

