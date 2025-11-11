import { StatusBar, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export type StatusBarStyle = 'light-content' | 'dark-content';
export type StatusBarConfig = {
  barStyle: StatusBarStyle;
  backgroundColor: string;
};

export const STATUS_BAR_CONFIGS = {
  auth: {
    barStyle: 'dark-content' as StatusBarStyle,
    backgroundColor: 'transparent',
  },
  home: {
    barStyle: 'dark-content' as StatusBarStyle,
    backgroundColor: 'transparent',
  },
  create: {
    barStyle: 'light-content' as StatusBarStyle,
    backgroundColor: 'transparent',
  },
} as const;

export const useFocusStatusBar = (config: StatusBarConfig) => {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBarStyle(config.barStyle, true);
        StatusBar.setBackgroundColor(config.backgroundColor, true);
      }
    }, [config.barStyle, config.backgroundColor])
  );
};

