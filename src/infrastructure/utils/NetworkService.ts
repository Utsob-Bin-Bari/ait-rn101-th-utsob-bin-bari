import NetInfo from '@react-native-community/netinfo';
import { API_BASE_URL } from '../api/config/apiConfig';

export const NetworkService = {
  getCurrentNetworkState: async () => {
    try {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        type: state.type,
        isInternetReachable: state.isInternetReachable,
      };
    } catch (error) {
      return {
        isConnected: false,
        type: null,
        isInternetReachable: false,
      };
    }
  },

  subscribeToNetworkState: (callback: (isConnected: boolean) => void) => {
    const unsubscribe = NetInfo.addEventListener(state => {
      callback(state.isConnected ?? false);
    });
    
    return unsubscribe;
  },

  checkInternetReachability: async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      return state.isInternetReachable ?? false;
    } catch (error) {
      return false;
    }
  },

  checkServerAvailability: async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  },

  checkOnlineAndServerAvailable: async (): Promise<boolean> => {
    const isOnline = await NetworkService.checkInternetReachability();
    if (!isOnline) return false;

    const serverAvailable = await NetworkService.checkServerAvailability();
    return serverAvailable;
  }
};

