import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import TasksStackNavigator from './TasksStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksStackNavigator}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStackNavigator}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

