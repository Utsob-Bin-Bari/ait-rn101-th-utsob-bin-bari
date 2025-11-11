import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';
import store from './src/application/store/store';
import { DatabaseInit } from './src/infrastructure/storage/DatabaseInit';

enableScreens();

function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const dbInit = DatabaseInit.getInstance();
        await dbInit.initializeDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsDbReady(true);
      }
    };

    initializeDatabase();
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
