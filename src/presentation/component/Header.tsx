import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { HEADER_MARGIN_TOP } from '../utils';

interface HeaderProps {
  title?: string;
  leftText?: string;
  LeftIcon?: React.ComponentType<{ onPress: () => void; color: string }>;
  RightIcon?: React.ComponentType<{ onPress: () => void; color: string }>;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  color?: string;
  showBorder?: boolean;
  titleOffset?: number;
}
const Header = ({ 
  title = '', 
  leftText,
  LeftIcon, 
  RightIcon, 
  onLeftIconPress, 
  onRightIconPress, 
  color=colors.black,
  showBorder = false,
  titleOffset = 0
}: HeaderProps) => {
  return (
    <View style={[
      styles.mainContainer, 
      { marginTop: HEADER_MARGIN_TOP },
      showBorder && styles.borderBottom
    ]}>
      <View style={[styles.container]}>
        <View style={styles.leftSection}>
          {LeftIcon && onLeftIconPress && <LeftIcon onPress={onLeftIconPress} color={color} />}
          {leftText && <Text style={[styles.leftText, { color: color }]}>{leftText}</Text>}
        </View>
        <Text style={[styles.title, { color: color, marginLeft: titleOffset }]}>{title}</Text>
        <View style={styles.rightSection}>
          {RightIcon && onRightIconPress && <RightIcon onPress={onRightIconPress} color={color} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor:'transparent',
    height: 40,
  },    
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: "90%",
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
    zIndex: 10,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
    zIndex: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    includeFontPadding: false,
    flex: 1,
    textAlign: 'center',
    zIndex: 1,
  },
  leftText: {
    fontSize: 20,
    fontWeight: '600',
    includeFontPadding: false,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.devider,
    paddingBottom: 10,
  },
});
export default Header;