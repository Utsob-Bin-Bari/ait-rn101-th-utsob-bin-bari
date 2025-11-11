import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from 'react-native';
import { logoutUser } from '../../application/services/auth';
import { clearUserInfo } from '../../application/store/action/auth';
import type { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UseSettingsProps {
  navigation: NavigationProp;
}

export const useSettings = ({ navigation }: UseSettingsProps) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
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
            
            const result = await logoutUser();
            
            if (result.success) {
              dispatch(clearUserInfo());
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
    handleLogout
  };
};

