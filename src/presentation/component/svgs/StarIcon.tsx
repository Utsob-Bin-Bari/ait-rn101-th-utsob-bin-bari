import React from 'react';
import { Svg, Path } from 'react-native-svg';

interface StarIconProps {
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

const StarIcon: React.FC<StarIconProps> = ({
  width = 24,
  height = 24,
  color = '#000000',
  filled = false,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11.0489 3.92705C11.3483 3.00574 12.6517 3.00574 12.9511 3.92705L14.2451 7.90983C14.379 8.32185 14.763 8.60081 15.1962 8.60081H19.3839C20.3527 8.60081 20.7554 9.84043 19.9717 10.4098L16.5838 12.8944C16.2333 13.1477 16.0866 13.5994 16.2205 14.0114L17.5145 17.9942C17.8138 18.9155 16.7595 19.6811 15.9758 19.1117L12.5879 16.6271C12.2374 16.3738 11.7626 16.3738 11.4121 16.6271L8.02419 19.1117C7.24054 19.6811 6.18617 18.9155 6.48554 17.9942L7.77948 14.0114C7.91338 13.5994 7.76672 13.1477 7.41616 12.8944L4.02829 10.4098C3.24464 9.84043 3.64734 8.60081 4.61606 8.60081H8.80385C9.23706 8.60081 9.62099 8.32185 9.75489 7.90983L11.0489 3.92705Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default StarIcon;
