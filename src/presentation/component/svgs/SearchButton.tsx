import React from 'react';
import { TouchableOpacity } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

interface SearchButtonProps {
  onPress: () => void;
  color: string;
  size?: number;
}

const SearchButton: React.FC<SearchButtonProps> = ({ onPress, color, size = 33 }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Svg width={size} height={size} viewBox="0 0 33 33" fill="none">
        <Rect
          x="17.4788"
          y="20.2597"
          width="3.37078"
          height="9.55054"
          rx="1.68539"
          transform="rotate(-45 17.4788 20.2597)"
          fill={color}
        />
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.8556 20.8556C24.695 17.0162 24.695 10.7913 20.8556 6.95188C17.0162 3.11246 10.7913 3.11246 6.95188 6.95188C3.11246 10.7913 3.11246 17.0162 6.95188 20.8556C10.7913 24.695 17.0162 24.695 20.8556 20.8556ZM18.8691 18.8695C21.6116 16.1271 21.6116 11.6807 18.8691 8.93825C16.1267 6.19581 11.6803 6.19581 8.93788 8.93824C6.19544 11.6807 6.19544 16.1271 8.93788 18.8695C11.6803 21.6119 16.1267 21.6119 18.8691 18.8695Z"
          fill={color}
        />
      </Svg>
    </TouchableOpacity>
  );
};

export default SearchButton;

