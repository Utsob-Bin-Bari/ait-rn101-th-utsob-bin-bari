import React from 'react';
import { View, Text, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../constants/colors';
import { useNavigation } from '@react-navigation/native';

interface ConvertGuestPromptProps {
  style?: StyleProp<ViewStyle>;
}

const ConvertGuestPrompt = ({ style }: ConvertGuestPromptProps) => {
  const navigation = useNavigation<any>();

  const handleSignUp = () => {
    navigation.navigate('Auth', { screen: 'SignUp' });
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.purple,
          paddingHorizontal: 16,
          paddingVertical: 12,
          marginHorizontal: 16,
          marginVertical: 12,
          borderRadius: 12,
        },
        style
      ]}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.white, marginBottom: 4 }}>
        Create an Account
      </Text>
      <Text style={{ fontSize: 12, color: colors.white, marginBottom: 10, opacity: 0.9 }}>
        Sign up to sync your tasks across devices and never lose your data.
      </Text>
      <TouchableOpacity
        style={{
          backgroundColor: colors.white,
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignSelf: 'flex-start',
        }}
        onPress={handleSignUp}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: colors.purple }}>
          Sign Up Now
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ConvertGuestPrompt;

