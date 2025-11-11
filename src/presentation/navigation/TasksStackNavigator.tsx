import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AllTasksScreen from '../screens/AllTasksScreen';
import CreateTaskScreen from '../screens/CreateTaskScreen';

const Stack = createStackNavigator();

const TasksStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AllTasks" 
        component={AllTasksScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateTask" 
        component={CreateTaskScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default TasksStackNavigator;

