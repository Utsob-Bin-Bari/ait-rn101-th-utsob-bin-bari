import React from 'react';
import { View, Text, ScrollView, Platform, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { colors } from '../constants/colors';
import { useLogin } from '../hooks/useLogin';
import CustomTextInput from '../component/CustomTextInput';
import CustomButton from '../component/CustomButton';
import EyeIcon from '../component/svgs/EyeIcon';
import EyeOffIcon from '../component/svgs/EyeOffIcon';
import commonStyles from '../styles/commonStyles';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';

const LogInScreen = () => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.auth);

  const {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    fieldErrors,
    loginError,
    handleLogin,
    navigateToSignup,
    showPassword,
    setShowPassword,
  } = useLogin();

  return (
    <View style={[commonStyles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ width: '90%', alignSelf: 'center', paddingTop: Platform.OS === 'android' ? 80 : 60 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.purple, marginBottom: 10 }}>
              Login
            </Text>
            <Text style={{ fontSize: 16, color: colors.blobBlue, marginBottom: 30 }}>
              Welcome to <Text style={{ color: colors.pink, fontWeight: '600' }}>AsthaIt</Text>! Please enter your login details.
            </Text>

            <CustomTextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            {fieldErrors.email.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                {fieldErrors.email.map((error, index) => (
                  <Text key={index} style={{ fontSize: 12, color: colors.pink, marginBottom: 3 }}>
                    {error}
                  </Text>
                ))}
              </View>
            )}

            <View style={{ position: 'relative' }}>
              <CustomTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="off"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={{ position: 'absolute', right: 16, top: 18 }}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 
                  <EyeIcon color={colors.grey} width={20} height={22}/> : 
                  <EyeOffIcon color={colors.grey} width={20} height={22}/>
                }
              </TouchableOpacity>
            </View>

            {fieldErrors.password.length > 0 && (
              <View style={{ marginBottom: 10 }}>
                {fieldErrors.password.map((error, index) => (
                  <Text key={index} style={{ fontSize: 12, color: colors.pink, marginBottom: 3 }}>
                    {error}
                  </Text>
                ))}
              </View>
            )}

            <CustomButton
              text={loading ? 'Logging in...' : 'Login'}
              onPress={handleLogin}
              disabled={loading}
            />

            {loginError ? (
              <View style={{ marginTop: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 14, color: colors.pink, textAlign: 'center' }}>
                  {loginError}
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ fontSize: 14, color: colors.blobBlue }}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToSignup}>
                <Text style={{ fontSize: 14, color: colors.purple, fontWeight: '600' }}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LogInScreen;