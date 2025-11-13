import notifee, { AndroidImportance, TriggerType, TimestampTrigger } from '@notifee/react-native';
import { Task } from '../../../domain/types/tasks/TaskType';

export const notificationService = {
  initialize: async (): Promise<void> => {
    try {
      await notifee.createChannel({
        id: 'task-reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
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
};

