import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useSettings } from '../hooks/useSettings';
import CustomButton from '../component/CustomButton';
import commonStyles from '../styles/commonStyles';
import { colors } from '../constants/colors';
import { useFocusStatusBar, STATUS_BAR_CONFIGS } from '../utils';
import { useTasks } from '../hooks/useTasks';
import { BinIcon, HardDriveIcon, SyncIcon, CheckIcon } from '../component/svgs';
import Header from '../component/Header';

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
  const { syncStatus } = useTasks({ navigation });
  
  const {
    loading,
    error,
    clearDataState,
    recoverDataState,
    handleClearData,
    handleRecoverData,
    handleSyncManagement,
    handleLogout
  } = useSettings({ navigation });

  const clearDataRotateValue = useRef(new Animated.Value(0)).current;
  const recoverDataRotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (clearDataState === 'loading') {
      const rotateAnimation = Animated.loop(
        Animated.timing(clearDataRotateValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      clearDataRotateValue.setValue(0);
    }
  }, [clearDataState]);

  useEffect(() => {
    if (recoverDataState === 'loading') {
      const rotateAnimation = Animated.loop(
        Animated.timing(recoverDataRotateValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();
      return () => rotateAnimation.stop();
    } else {
      recoverDataRotateValue.setValue(0);
    }
  }, [recoverDataState]);


  const clearDataRotate = clearDataRotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const recoverDataRotate = recoverDataRotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderRightIcon = (
    state: 'idle' | 'loading' | 'completed' | 'failed',
    rotateValue: Animated.AnimatedInterpolation<string | number>
  ) => {
    if (state === 'loading') {
      return (
        <Animated.View style={{ transform: [{ rotate: rotateValue as Animated.AnimatedInterpolation<string> }] }}>
          <SyncIcon color={colors.warning} width={20} height={20} />
        </Animated.View>
      );
    } else if (state === 'completed') {
      return <CheckIcon color={colors.success} width={20} height={20} />;
    } else if (state === 'failed') {
      return <SyncIcon color={colors.error} width={20} height={20} />;
    }
    return null;
  };

  const getSyncStatusText = () => {
    if (syncStatus.isSyncing) return 'Syncing...';
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.pendingCount > 0) return `${syncStatus.pendingCount} pending`;
    return 'Synced';
  };

  const getSyncStatusColor = () => {
    if (syncStatus.isSyncing) return colors.warning;
    if (!syncStatus.isOnline) return colors.error;
    if (syncStatus.pendingCount > 0) return colors.warning;
    return colors.success;
  };

  const SyncStatus = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ 
        width: 8, 
        height: 8, 
        borderRadius: 4, 
        backgroundColor: getSyncStatusColor() 
      }} />
      <Text style={{ 
        fontSize: 12, 
        color: colors.blobBlue,
        fontWeight: '500'
      }}>
        {getSyncStatusText()}
      </Text>
    </View>
  );

  return (
    <View style={commonStyles.container}>
      <Header
        title="Settings"
        RightIcon={() => <SyncStatus />}
        onRightIconPress={handleSyncManagement}
        color={colors.blobBlue}
        showBorder={true}
        titleOffset={15}
      />
      <ScrollView style={commonStyles.container} showsVerticalScrollIndicator={false}>
      <View style={{ 
        flex: 1, 
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        minHeight: '100%'
      }}>
        <View>

          <TouchableOpacity 
            style={{
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              padding: 20,
              marginBottom: 5,
              marginTop: 20,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleClearData}
            disabled={clearDataState === 'loading'}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 5 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <BinIcon color={colors.error} width={24} height={24} />
                <Text style={[
                  commonStyles.text,
                  {
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.error,
                    marginLeft: 12,
                  }
                ]}>
                  Clear Data
                </Text>
              </View>
              {renderRightIcon(clearDataState, clearDataRotate)}
            </View>
            
            <Text style={[
              commonStyles.text,
              {
                fontSize: 14,
                color: colors.darkGrey,
                lineHeight: 20,
              }
            ]}>
              Permanently removes all tasks and settings from your device. Your login session will be preserved. Any unsynced data will be lost forever.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              padding: 20,
              marginBottom: 5,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleRecoverData}
            disabled={recoverDataState === 'loading'}
          >
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginBottom: 5 
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <HardDriveIcon color={colors.purple} width={24} height={24} />
                <Text style={[
                  commonStyles.text,
                  {
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.purple,
                    marginLeft: 12,
                  }
                ]}>
                  Recover Data
                </Text>
              </View>
              {renderRightIcon(recoverDataState, recoverDataRotate)}
            </View>
            
            <Text style={[
              commonStyles.text,
              {
                fontSize: 14,
                color: colors.darkGrey,
                lineHeight: 20,
              }
            ]}>
              It will recover data from server and overwrite your local storage. Any unsynced data will be lost forever.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{
              backgroundColor: colors.inputBackground,
              borderRadius: 12,
              padding: 20,
              marginBottom: 5,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={handleSyncManagement}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
              <SyncIcon color={colors.success} width={24} height={24} />
              <Text style={[
                commonStyles.text,
                {
                  fontSize: 18,
                  fontWeight: '600',
                  color: colors.success,
                  marginLeft: 12,
                }
              ]}>
                Sync Management
              </Text>
            </View>
            
            <Text style={[
              commonStyles.text,
              {
                fontSize: 14,
                color: colors.darkGrey,
                lineHeight: 20,
              }
            ]}>
              You can manually sync data or delete sync operation from here.
            </Text>
          </TouchableOpacity>

          {error ? (
            <Text style={{ 
              color: colors.error, 
              marginTop: 10, 
              textAlign: 'center',
              fontSize: 14
            }}>
              {error}
            </Text>
          ) : null}
        </View>

        <View style={{ marginTop: 20 }}>
          <CustomButton
            text={loading ? 'Logging out...' : 'Logout'}
            onPress={handleLogout}
            backgroundColor={colors.red}
            disabled={loading}
          />
        </View>
      </View>
      </ScrollView>
    </View>
  );
};

export default SettingScreen;
