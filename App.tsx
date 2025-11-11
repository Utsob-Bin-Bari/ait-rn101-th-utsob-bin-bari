import React from 'react';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { enableScreens } from 'react-native-screens';

enableScreens();

function App() {
  return <AppNavigator />;
}

export default App;
