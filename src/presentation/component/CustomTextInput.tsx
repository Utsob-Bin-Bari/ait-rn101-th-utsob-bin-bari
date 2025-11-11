import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../constants/colors';

interface CustomTextInputProps extends TextInputProps {}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  value, 
  onChangeText, 
  placeholder, 
  style, 
  autoCorrect = false, 
  spellCheck = false, 
  secureTextEntry = false,
  ...props 
}) => {
  return (
    <TextInput
      style={[styles.input, style]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.darkGrey}
      selectionColor={colors.purple}
      autoCorrect={autoCorrect}
      spellCheck={spellCheck}
      secureTextEntry={secureTextEntry}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: colors.devider,
    backgroundColor: colors.white,
    paddingLeft: 16,
    paddingRight: 16,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: '500',
    color: colors.blobBlue,
    marginBottom: 10,
  },
});

export default CustomTextInput;

