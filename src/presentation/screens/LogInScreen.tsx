import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';

type AuthStackParamList = {
  LogIn: undefined;
  SignUp: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type NavigationProp = CompositeNavigationProp<
  StackNavigationProp<AuthStackParamList>,
  StackNavigationProp<RootStackParamList>
>;

const LogInScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = () => {
    // Navigate to main app with tabs
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Log In"
          onPress={handleLogin}
        />
        <View style={styles.spacer} />
        <Button
          title="Go to Sign Up"
          onPress={() => navigation.navigate('SignUp')}
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
    width: 200,
  },
  spacer: {
    height: 10,
  },
});

export default LogInScreen;