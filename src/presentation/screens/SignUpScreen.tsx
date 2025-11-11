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

const SignUpScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleSignUp = () => {
    // Navigate to main app with tabs
    navigation.navigate('Main');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Create your account</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          onPress={handleSignUp}
        />
        <View style={styles.spacer} />
        <Button
          title="Go to Log In"
          onPress={() => navigation.navigate('LogIn')}
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

export default SignUpScreen;