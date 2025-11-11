import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LogInScreen from '../screens/LogInScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createStackNavigator();

const AuthStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="LogIn" 
        component={LogInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false}}
      />
    </Stack.Navigator>
  );
};

export default AuthStackNavigator;

