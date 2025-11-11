import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type SettingsStackParamList = {
  SettingsMain: undefined;
  SyncManagement: undefined;
};

type NavigationProp = StackNavigationProp<SettingsStackParamList>;

const SettingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>App settings will appear here</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Sync Management"
          onPress={() => navigation.navigate('SyncManagement')}
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

export default SettingScreen;