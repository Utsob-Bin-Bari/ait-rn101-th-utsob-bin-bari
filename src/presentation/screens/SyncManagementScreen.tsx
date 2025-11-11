import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';

const SyncManagementScreen = () => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sync Management</Text>
      <Text style={styles.subtitle}>Manage your sync settings</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
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
  },
});

export default SyncManagementScreen;

