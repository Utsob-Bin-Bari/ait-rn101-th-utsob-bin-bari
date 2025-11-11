import React from 'react';
import { TextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { colors } from '../constants/colors';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({ 
  value, 
  onChangeText, 
  placeholder, 
  style, 
  label,
  error,
  autoCorrect = false, 
  spellCheck = false, 
  secureTextEntry = false,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style, error && styles.inputError]}
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
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    color: colors.devider,
    marginBottom: 8,
    fontWeight: '500'
  },
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
    color: colors.blobBlue
  },
  inputError: {
    borderColor: colors.red
  },
  error: {
    fontSize: 12,
    color: colors.red,
    marginTop: 4
  }
});

export default CustomTextInput;

