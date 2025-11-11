import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../constants/colors';

interface HeaderProps {
  title?: string;
  LeftIcon: React.ComponentType<{ onPress: () => void; color: string }>;
  RightIcon: React.ComponentType<{ onPress: () => void; color: string }>;
  onLeftIconPress: () => void;
  onRightIconPress: () => void;
  color?: string;
}
const Header = ({ title = '', LeftIcon, RightIcon, onLeftIconPress, onRightIconPress, color=colors.black }: HeaderProps) => {
  return (
    <View style={[styles.mainContainer, { marginTop: Platform.OS === 'ios' ? 20 : 50 }]}>
      <View style={[styles.container]}>
        {LeftIcon && <LeftIcon onPress={onLeftIconPress} color={color} />}
        <Text style={[styles.title, { color: color }]}>{title}</Text>
        {RightIcon && <RightIcon onPress={onRightIconPress} color={color} />}
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
  title: {
    fontSize: 18,
    fontWeight: '600',
    includeFontPadding: false,
  },
});
export default Header;