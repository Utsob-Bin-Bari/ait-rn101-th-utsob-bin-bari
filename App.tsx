import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';
import store from './src/application/store/store';
import { DatabaseInit } from './src/infrastructure/storage/DatabaseInit';
import { notificationService } from './src/application/services/notifications';
import { requestNotificationPermission } from './src/infrastructure/utils/notificationPermission';

enableScreens();

function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const dbInit = DatabaseInit.getInstance();
        await dbInit.initializeDatabase();

        await notificationService.initialize();
        await requestNotificationPermission();

        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsDbReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isDbReady) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppNavigator />
    </Provider>
  );
}

export default App;
