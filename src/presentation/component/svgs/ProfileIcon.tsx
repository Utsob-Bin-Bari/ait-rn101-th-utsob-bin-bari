import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { TouchableOpacity } from 'react-native';

interface ProfileIconProps {
  onPress: () => void;
  color: string;
  size?: number;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({ 
  onPress, 
  color, 
  size = 32 
}) => {
  const width = (size * 33) / 32;
  const height = size;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Svg width={width} height={height} viewBox="0 0 33 32" fill="none">
        <Path
          d="M16.3803 0C7.33838 0 0 7.02849 0 15.6886C0 24.3487 7.33838 31.3772 16.3803 31.3772C25.4222 31.3772 32.7606 24.3487 32.7606 15.6886C32.7606 7.02849 25.4222 0 16.3803 0ZM16.3803 4.70658C19.0994 4.70658 21.2944 6.80885 21.2944 9.41316C21.2944 12.0175 19.0994 14.1197 16.3803 14.1197C13.6612 14.1197 11.4662 12.0175 11.4662 9.41316C11.4662 6.80885 13.6612 4.70658 16.3803 4.70658ZM16.3803 26.9844C12.2852 26.9844 8.66519 24.9763 6.55213 21.9327C6.60127 18.8106 13.1043 17.1006 16.3803 17.1006C19.64 17.1006 26.1594 18.8106 26.2085 21.9327C24.0954 24.9763 20.4754 26.9844 16.3803 26.9844Z"
          fill={color}
        />
      </Svg>
    </TouchableOpacity>
  );
};

export default ProfileIcon;

