import { StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const commonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    button: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
        color: colors.black,
        fontWeight: '500',
    },
});

export default commonStyles;