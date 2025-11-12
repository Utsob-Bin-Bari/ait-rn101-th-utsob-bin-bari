import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingScreen from '../screens/SettingScreen';
import SyncManagementScreen from '../screens/SyncManagementScreen';

const Stack = createStackNavigator();

const SettingsStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SyncManagement" 
        component={SyncManagementScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SettingsStackNavigator;

