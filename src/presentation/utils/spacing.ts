import { Platform } from 'react-native';

export const HEADER_MARGIN_TOP = Platform.OS === 'ios' ? 50 : 50;

export const spacing = {
  headerMarginTop: HEADER_MARGIN_TOP,
};

