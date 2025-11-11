import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

interface CustomButtonProps {
  text: string;
  onPress?: () => void;
  textColor?: string;
  backgroundColor?: string;
  height?: number;
  opacity?: number;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  text, 
  onPress, 
  textColor,
  backgroundColor,
  height = 56, 
  opacity = 1,
  disabled = false,
  loading = false,
  style
}) => {
  const finalTextColor = textColor || colors.white;
  const isDisabled = disabled || loading || !onPress;
  
  let buttonColor1: string;
  let buttonColor2: string;
  
  if (isDisabled) {
    buttonColor1 = colors.grey;
    buttonColor2 = colors.grey;
  } else if (backgroundColor) {
    buttonColor1 = backgroundColor;
    buttonColor2 = backgroundColor;
  } else {
    buttonColor1 = colors.pink;
    buttonColor2 = colors.purple;
  }

  return (
    <TouchableOpacity 
      style={[
        styles.button,
        {
          opacity: opacity,
          height: height,
        },
        style
      ]} 
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[buttonColor1, buttonColor2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientContainer}
      >
        {loading ? (
          <ActivityIndicator size="small" color={finalTextColor} />
        ) : (
          <Text style={[styles.text, { color: finalTextColor }]}>
            {text}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width:'100%',
    borderRadius: 27,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gradientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    includeFontPadding: false,
  },
});

export default CustomButton;

