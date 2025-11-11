import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSettings } from '../hooks/useSettings';
import CustomButton from '../component/CustomButton';
import commonStyles from '../styles/commonStyles';
import { colors } from '../constants/colors';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import SyncIndicator from '../component/SyncIndicator';
import { useTasks } from '../hooks/useTasks';

type SettingsStackParamList = {
  SettingsMain: undefined;
  SyncManagement: undefined;
};

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<SettingsStackParamList> & 
  StackNavigationProp<RootStackParamList>;

const SettingScreen = () => {
  useFocusStatusBar(STATUS_BAR_CONFIGS.home);
  
  const navigation = useNavigation<NavigationProp>();
  const { loading, handleLogout } = useSettings({ navigation });
  const { syncStatus } = useTasks({ navigation });
  return (
    <ScrollView style={commonStyles.container}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'space-between',
        padding: 20,
        minHeight: '100%'
      }}>
        <View>
          <Text style={{ 
            fontSize: 24, 
            fontWeight: 'bold', 
            marginBottom: 10,
            textAlign: 'center'
          }}>
            Settings
          </Text>
          <Text style={{ 
            fontSize: 16, 
            color: colors.grey, 
            marginBottom: 20,
            textAlign: 'center'
          }}>
            App settings will appear here
          </Text>
          
          <View style={{ marginTop: 20 }}>
            <CustomButton
              text="Sync Management"
              onPress={() => navigation.navigate('SyncManagement')}
              backgroundColor={colors.purple}
            />
          </View>
          <SyncIndicator
        isOnline={syncStatus.isOnline}
        isSyncing={syncStatus.isSyncing}
        pendingCount={syncStatus.pendingCount}
      />
        </View>

        <View>
          <CustomButton
            text={loading ? 'Logging out...' : 'Logout'}
            onPress={handleLogout}
            backgroundColor={colors.red}
            disabled={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default SettingScreen;