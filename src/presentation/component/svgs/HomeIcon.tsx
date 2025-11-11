import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface HomeIconProps {
  color?: string;
  width?: number;
  height?: number;
}

const HomeIcon: React.FC<HomeIconProps> = ({ 
  color = '#000000', 
  width = 24, 
  height = 24 
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
        fill={color}
      />
    </Svg>
  );
};

export default HomeIcon;

