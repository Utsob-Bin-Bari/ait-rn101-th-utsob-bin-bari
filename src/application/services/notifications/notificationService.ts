import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';
import { Task } from '../../../domain/types/tasks/TaskType';

export const notificationService = {
  initialize: async (): Promise<void> => {
    try {
      // Regular task reminder notifications — default system sound.
      await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      // Alarm notifications — custom alarm.mp3 from res/raw (Android).
      // A separate channel is required because Android channels are immutable
      // once registered; mixing alarm sound into task-reminders is not possible
      // after the channel is first created.
      await notifee.createChannel({
        id: 'task-alarms',
        name: 'Task Alarms',
        importance: AndroidImportance.HIGH,
        sound: 'alarm',
      });
    } catch (error) {
      console.error('Notification channel initialization error:', error);
    }
  },

  scheduleTaskNotification: async (task: Task): Promise<string | null> => {
    try {
      if (!task.due_date) {
        return null;
      }

      const dueDate = new Date(task.due_date);
      const now = new Date();

      if (dueDate <= now) {
        return null;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: dueDate.getTime(),
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          id: task.local_id,
          title: 'Task Due',
          body: task.title,
          ios: {
            sound: 'default',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
          android: {
            channelId: 'task-reminders',
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          data: {
            taskId: task.local_id,
            screen: 'CreateTask',
          },
        },
        trigger
      );

      return notificationId;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return null;
    }
  },

  cancelTaskNotification: async (taskId: string): Promise<void> => {
    try {
      await notifee.cancelNotification(taskId);
    } catch (error) {
      console.error('Cancel notification error:', error);
    }
  },

  cancelAllNotifications: async (): Promise<void> => {
    try {
      await notifee.cancelAllNotifications();
    } catch (error) {
      console.error('Cancel all notifications error:', error);
    }
  },

  getTriggerNotifications: async () => {
    try {
      return await notifee.getTriggerNotifications();
    } catch (error) {
      console.error('Get trigger notifications error:', error);
      return [];
    }
  },

  /** Schedule an alarm notification based on task.alarm_time. ID: `{local_id}_alarm`. */
  scheduleAlarmNotification: async (task: Task): Promise<string | null> => {
    try {
      if (!task.alarm_time || task.alarm_enabled !== 1) {
        return null;
      }

      const alarmDate = new Date(task.alarm_time);
      const now = new Date();

      if (alarmDate <= now) {
        return null;
      }

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: alarmDate.getTime(),
      };

      const notificationId = await notifee.createTriggerNotification(
        {
          id: `${task.local_id}_alarm`,
          title: '⏰ TaskBell Alarm',
          body: task.title,
          ios: {
            // alarm.mp3 must be in the Xcode bundle (Copy Bundle Resources).
            sound: 'alarm.mp3',
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
          },
          android: {
            // task-alarms channel has sound: 'alarm' (res/raw/alarm.mp3).
            channelId: 'task-alarms',
            importance: AndroidImportance.HIGH,
            smallIcon: 'ic_launcher',
            pressAction: {
              id: 'default',
            },
          },
          data: {
            taskId: task.local_id,
            screen: 'AlarmDismiss',
          },
        },
        trigger
      );

      return notificationId;
    } catch (error) {
      console.error('Schedule alarm notification error:', error);
      return null;
    }
  },

  /** Cancel the alarm notification for a given task. */
  cancelAlarmNotification: async (taskId: string): Promise<void> => {
    try {
      await notifee.cancelNotification(`${taskId}_alarm`);
    } catch (error) {
      console.error('Cancel alarm notification error:', error);
    }
  },
};

