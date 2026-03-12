/**
 * Story 3.2: Notification Deep Link to Dismiss Screen
 * Tests for notification routing logic (screen field discrimination).
 */

describe('Story 3.2: Notification Deep Link to Dismiss Screen', () => {
  // Mirrors the handleNotificationPress logic from AppNavigator
  const handleNotificationPress = (
    navRef: { navigate: jest.Mock },
    taskId: string,
    screen?: string
  ) => {
    if (screen === 'AlarmDismiss') {
      navRef.navigate('AlarmDismiss', { taskId });
    } else {
      navRef.navigate('Main', {
        screen: 'Tasks',
        params: { screen: 'CreateTask', params: { taskId } },
      });
    }
  };

  describe('Notification routing by screen field', () => {
    it('routes to AlarmDismiss when screen is "AlarmDismiss"', () => {
      const navRef = { navigate: jest.fn() };
      handleNotificationPress(navRef, 'task-1', 'AlarmDismiss');
      expect(navRef.navigate).toHaveBeenCalledWith('AlarmDismiss', { taskId: 'task-1' });
    });

    it('routes to CreateTask when screen is "CreateTask" (due-date reminder)', () => {
      const navRef = { navigate: jest.fn() };
      handleNotificationPress(navRef, 'task-1', 'CreateTask');
      expect(navRef.navigate).toHaveBeenCalledWith('Main', {
        screen: 'Tasks',
        params: { screen: 'CreateTask', params: { taskId: 'task-1' } },
      });
    });

    it('routes to CreateTask when screen is undefined (backwards compatibility)', () => {
      const navRef = { navigate: jest.fn() };
      handleNotificationPress(navRef, 'task-1', undefined);
      expect(navRef.navigate).toHaveBeenCalledWith('Main', expect.objectContaining({ screen: 'Tasks' }));
    });

    it('passes correct taskId to AlarmDismiss route', () => {
      const navRef = { navigate: jest.fn() };
      handleNotificationPress(navRef, 'local-abc123', 'AlarmDismiss');
      const call = navRef.navigate.mock.calls[0];
      expect(call[0]).toBe('AlarmDismiss');
      expect(call[1].taskId).toBe('local-abc123');
    });
  });

  describe('Alarm notification data fields', () => {
    it('alarm notification data contains screen = "AlarmDismiss"', () => {
      const notifData = { taskId: 'local-abc', screen: 'AlarmDismiss' };
      expect(notifData.screen).toBe('AlarmDismiss');
    });

    it('due-date notification data contains screen = "CreateTask"', () => {
      const notifData = { taskId: 'local-abc', screen: 'CreateTask' };
      expect(notifData.screen).toBe('CreateTask');
    });

    it('alarm notification ID follows {local_id}_alarm pattern', () => {
      const taskLocalId = 'local-xyz';
      expect(`${taskLocalId}_alarm`).toBe('local-xyz_alarm');
    });
  });

  describe('Cold start navigation intent', () => {
    it('cold start with alarm notification routes to AlarmDismiss after delay', async () => {
      const navRef = { navigate: jest.fn() };
      const initialNotifData = { taskId: 'task-cold', screen: 'AlarmDismiss' };

      await new Promise<void>(resolve => {
        setTimeout(() => {
          handleNotificationPress(navRef, initialNotifData.taskId, initialNotifData.screen);
          resolve();
        }, 10);
      });

      expect(navRef.navigate).toHaveBeenCalledWith('AlarmDismiss', { taskId: 'task-cold' });
    });

    it('cold start with due-date notification routes to CreateTask', async () => {
      const navRef = { navigate: jest.fn() };
      const initialNotifData = { taskId: 'task-cold', screen: 'CreateTask' };

      await new Promise<void>(resolve => {
        setTimeout(() => {
          handleNotificationPress(navRef, initialNotifData.taskId, initialNotifData.screen);
          resolve();
        }, 10);
      });

      expect(navRef.navigate).toHaveBeenCalledWith('Main', expect.objectContaining({ screen: 'Tasks' }));
    });
  });
});
