import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStackNavigator from './HomeStackNavigator';
import TasksStackNavigator from './TasksStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import HomeIcon from '../component/svgs/HomeIcon';
import TasksIcon from '../component/svgs/TasksIcon';
import SettingsIcon from '../component/svgs/SettingsIcon';
import { colors } from '../constants/colors';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.purple,
        tabBarInactiveTintColor: colors.darkGrey,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStackNavigator}
        options={{ 
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <HomeIcon color={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksStackNavigator}
        options={{ 
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => (
            <TasksIcon color={color} width={size} height={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsStackNavigator}
        options={{ 
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon color={color} width={size} height={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

