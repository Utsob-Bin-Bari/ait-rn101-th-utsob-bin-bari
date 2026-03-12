/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee, { EventType } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Required by notifee: handle notification action events while app is in background.
// Navigation cannot be performed here; the foreground event handler in AppNavigator
// takes over when the user taps the notification and the app resumes.
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    // Navigation is handled by AppNavigator's onForegroundEvent on app resume.
    console.log('[Background] Notification pressed:', detail.notification?.id);
  }
  if (type === EventType.DISMISSED) {
    console.log('[Background] Notification dismissed:', detail.notification?.id);
  }
});

AppRegistry.registerComponent(appName, () => App);
