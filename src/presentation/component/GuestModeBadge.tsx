import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../constants/colors';

interface GuestModeBadgeProps {
  style?: any;
}

const GuestModeBadge = ({ style }: GuestModeBadgeProps) => {
  return (
    <View
      style={[
        {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 12,
          backgroundColor: colors.pink,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 11, fontWeight: '600', color: colors.white }}>
        Guest Mode
      </Text>
    </View>
  );
};

export default GuestModeBadge;

