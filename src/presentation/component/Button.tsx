import React from 'react';
import { TouchableOpacity, DimensionValue, StyleSheet, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../constants/colors';

interface ButtonProps {
    text: string;
    onPress?: () => void;
    textColor?: string;
    backgroundColor1?: string;
    backgroundColor2?: string;
    height?: number;
    width?: DimensionValue;
    opacity?: number;
    disabled?: boolean;
    loading?: boolean;
    textSize?: number;
    borderRadius?: number;
}

function ButtonBase(props: ButtonProps) {
    const { 
        text, 
        onPress, 
        textColor = colors.white,
        backgroundColor1 = colors.pink, 
        backgroundColor2 = colors.purple, 
        height = 54, 
        width = '100%',
        opacity = 1,
        disabled = false,
        loading = false,
        textSize = 12,
        borderRadius = 27,
    } = props;
    
    const isDisabled = disabled || loading || !onPress;
    const displayText = loading ? 'Loading...' : text;
    const buttonBackgroundColor1 = isDisabled ? colors.grey : backgroundColor1;
    const buttonBackgroundColor2 = isDisabled ? colors.grey : backgroundColor2;
    
    const dynamicContainerStyle = {
        opacity: opacity,
        height: height,
        width: width,
        borderRadius: borderRadius,
    };

    const dynamicTextStyle = {
        color: textColor,
        fontSize: textSize,
    };
    
    return (
        <TouchableOpacity 
            style={[styles.buttonContainer, dynamicContainerStyle]} 
            onPress={isDisabled ? undefined : onPress}
            disabled={isDisabled}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[buttonBackgroundColor1, buttonBackgroundColor2]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1}}
                style={styles.gradientContainer}
            >
                <Text style={[styles.buttonText, dynamicTextStyle]}>
                    {displayText}
                </Text>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const Button = React.memo(ButtonBase);

const styles = StyleSheet.create({
    buttonContainer: {
        borderWidth: 1,
        overflow: 'hidden',
        borderRadius: 27,
    },
    gradientContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    buttonText: {
        fontWeight: '600',
        includeFontPadding: false,
    },
});

export default Button;