import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { logoutUser, clearGuestData } from '../../application/services/auth';
import { clearUserInfo } from '../../application/store/action/auth';
import { setTasks } from '../../application/store/action/tasks';
import { clearDataService, recoverDataService } from '../../application/services/settings';
import { tasksSQLiteService } from '../../application/services/tasks/tasksSQLiteService';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootState } from '../../domain/types/store/AuthState';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type SettingsStackParamList = {
  SettingsMain: undefined;
  SyncManagement: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList> & 
  StackNavigationProp<SettingsStackParamList>;

interface UseSettingsProps {
  navigation: NavigationProp;
}

type OperationState = 'idle' | 'loading' | 'completed' | 'failed';

export const useSettings = ({ navigation }: UseSettingsProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [clearDataState, setClearDataState] = useState<OperationState>('idle');
  const [recoverDataState, setRecoverDataState] = useState<OperationState>('idle');
  
  const authState = useSelector((state: RootState) => state.auth);

  const performClearDataOperation = async () => {
    setClearDataState('loading');
    
    try {
      const statsBefore = await clearDataService.getDataStatistics();
      
      const result = await clearDataService.clearAllDataExceptUser();
      
      if (result.success) {
        dispatch(setTasks([]));
        
        const userSessionIntact = await clearDataService.verifyUserSession();
        const statsAfter = await clearDataService.getDataStatistics();
        
        if (userSessionIntact && statsAfter.tasks === 0 && statsAfter.syncQueue === 0) {
          setClearDataState('completed');
          
          Alert.alert(
            'Data Cleared',
            `Successfully deleted ${result.cleared.tasks} tasks and all associated data. Your login session has been preserved.`,
            [{ text: 'OK' }]
          );
        } else {
          setClearDataState('failed');
          setError('Data clearing verification failed');
        }
      } else {
        setClearDataState('failed');
        setError(result.error || 'Failed to clear data');
      }
    } catch (error: any) {
      setClearDataState('failed');
      setError('An unexpected error occurred');
      console.error('Clear data error:', error);
    }
    
    setTimeout(() => setClearDataState('idle'), 3000);
  };

  const performRecoverDataOperation = async () => {
    setRecoverDataState('loading');
    
    try {
      if (!authState.user?.accessToken || !authState.user?.id) {
        setRecoverDataState('failed');
        setError('No active session');
        setTimeout(() => setRecoverDataState('idle'), 2000);
        return;
      }

      const backendHasData = await recoverDataService.checkBackendDataExists(authState.user.accessToken);
      
      if (!backendHasData) {
        Alert.alert(
          'No Data Available',
          'No data was found on the server for your account.',
          [{ text: 'OK' }]
        );
        setRecoverDataState('failed');
        setTimeout(() => setRecoverDataState('idle'), 2000);
        return;
      }
      
      const recoveryResult = await recoverDataService.performRecovery(
        authState.user.accessToken,
        authState.user.id
      );
      
      if (recoveryResult.success) {
        const tasks = await tasksSQLiteService.getAllTasks(authState.user.id);
        dispatch(setTasks(tasks));
        
        Alert.alert(
          'Recovery Complete',
          `Successfully recovered ${recoveryResult.recovered.tasks} tasks from the server.`,
          [{ text: 'OK' }]
        );
        
        setRecoverDataState('completed');
      } else {
        setRecoverDataState('failed');
        setError(recoveryResult.error || 'Recovery failed');
      }
    } catch (error: any) {
      setRecoverDataState('failed');
      setError('Recovery operation failed');
      console.error('Recovery error:', error);
    }
    
    setTimeout(() => setRecoverDataState('idle'), 2000);
  };


  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will permanently delete all tasks and settings from this device. Your login session will be preserved.\n\nThis action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: () => {
            performClearDataOperation();
          },
        },
      ]
    );
  };

  const handleRecoverData = () => {
    Alert.alert(
      'Recover Data',
      'This will download data from the server and overwrite your local storage. Any unsynced local data will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Recover',
          style: 'default',
          onPress: () => {
            performRecoverDataOperation();
          },
        },
      ]
    );
  };


  const handleSyncManagement = () => {
    navigation.navigate('SyncManagement');
  };

  const handleLogout = async () => {
    const isGuest = authState.isGuest;
    const message = isGuest
      ? 'Logging out will delete all your guest data. This action cannot be undone.'
      : 'Are you sure you want to logout?';

    Alert.alert(
      'Logout',
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            
            let result;
            if (isGuest) {
              result = await clearGuestData();
            } else {
              result = await logoutUser();
            }
            
            if (result.success) {
              dispatch(clearUserInfo());
              dispatch(setTasks([]));
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } else {
              Alert.alert('Error', result.error || 'Failed to logout');
            }
            
            setLoading(false);
          }
        }
      ]
    );
  };

  return {
    loading,
    error,
    clearDataState,
    recoverDataState,
    handleClearData,
    handleRecoverData,
    handleSyncManagement,
    handleLogout
  };
};
