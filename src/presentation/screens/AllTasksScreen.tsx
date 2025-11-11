import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Button from '../component/Button';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';

type TasksStackParamList = {
  AllTasks: undefined;
  CreateTask: undefined;
};

type NavigationProp = StackNavigationProp<TasksStackParamList>;

const AllTasksScreen = () => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Tasks</Text>
      <Text style={styles.subtitle}>Your task list will appear here</Text>
      <View style={styles.buttonContainer}>
        <Button
          text="Create New Task"
          onPress={() => navigation.navigate('CreateTask')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    width: '100%',
  },
});

export default AllTasksScreen;