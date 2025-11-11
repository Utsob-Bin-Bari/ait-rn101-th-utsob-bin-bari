import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import Header from '../component/Header';
import ProfileIcon from '../component/svgs/ProfileIcon';
import { colors } from '../constants/colors';
import commonStyles from '../styles/commonStyles';
import { RootState } from '../../domain/types/store/AuthState';

const HomeScreen = () => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const user = useSelector((state: RootState) => state.auth.user);
  const userName = user?.name || 'Guest';

  const handleProfilePress = () => {
  };

  return (
    <ScrollView style={commonStyles.container}>
      <Header
        leftText={userName}
        RightIcon={ProfileIcon}
        onRightIconPress={handleProfilePress}
        color={colors.blobBlue}
        showBorder={true}
      />
      <View style={{ width: '90%', alignSelf: 'center', marginTop: 20 }}>
        <Text style={commonStyles.text}>Welcome to AsthaIt!</Text>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;