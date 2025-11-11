import React from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BackButtonProps {
  onPress: () => void;
  color: string;
  size?: number;
}

const BackButton: React.FC<BackButtonProps> = ({ onPress, color, size = 23 }) => {
  const height = (size * 16) / 23; // Maintain aspect ratio
  
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Svg width={size} height={height} viewBox="0 0 23 16" fill="none">
        <Path
          d="M5.22981 6.5592L9.34325 2.43427C9.89911 1.87686 9.89848 0.974566 9.34184 0.41793C8.78466 -0.139255 7.88128 -0.139255 7.3241 0.41793L0.174782 7.56725C-0.0582681 7.8003 -0.0582677 8.17815 0.174783 8.4112L7.3241 15.5605C7.88128 16.1177 8.78466 16.1177 9.34184 15.5605C9.89848 15.0039 9.89911 14.1016 9.34325 13.5442L5.22981 9.41925H21.2032C21.993 9.41925 22.6332 8.77901 22.6332 7.98922C22.6332 7.19944 21.993 6.5592 21.2032 6.5592H5.22981Z"
          fill={color}
        />
      </Svg>
    </TouchableOpacity>
  );
};

export default BackButton;

