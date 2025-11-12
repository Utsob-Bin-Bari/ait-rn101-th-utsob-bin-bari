import { tasksSQLiteService, Task } from './tasksSQLiteService';
import { syncQueueService } from './syncQueueService';
import { userSessionStorage } from '../../../infrastructure/storage/userSessionStorage';
import { OPERATION_TYPES, ENTITY_TYPES, DatabaseHelpers } from '../../../infrastructure/storage/DatabaseSchema';
import { CreateTaskPayload, UpdateTaskPayload } from '../../../domain/types/tasks/TaskType';
import { NetworkService } from '../../../infrastructure/utils';

export const tasksService = {
  fetchTasks: async (): Promise<{ success: boolean; data?: Task[]; error?: string }> => {
    try {
      const sessionResult = await userSessionStorage.get();
      if (!sessionResult.success || !sessionResult.data) {
        return { success: false, error: 'No active session' };
      }

      const userId = sessionResult.data.id;
      const tasks = await tasksSQLiteService.getAllTasks(userId);

      const isOnlineAndServerAvailable = await NetworkService.checkOnlineAndServerAvailable();
      if (isOnlineAndServerAvailable) {
        try {
          const { fetchTasksRequest } = await import('../../../infrastructure/api/requests/tasks/fetchTasksRequest');
          const serverResult = await fetchTasksRequest(sessionResult.data.accessToken);

          if (serverResult.success && serverResult.data) {
            await tasksService.mergeServerTasks(serverResult.data, userId);
            const mergedTasks = await tasksSQLiteService.getAllTasks(userId);
            return { success: true, data: mergedTasks };
          }
        } catch (error) {
          console.error('Error fetching server tasks:', error);
        }
      }

      return { success: true, data: tasks };
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: error.message || 'Failed to fetch tasks' };
    }
  },

  createTask: async (taskData: CreateTaskPayload): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const sessionResult = await userSessionStorage.get();
      if (!sessionResult.success || !sessionResult.data) {
        return { success: false, error: 'No active session' };
      }

      const userId = sessionResult.data.id;
      const localId = await tasksSQLiteService.createTask(taskData, userId);

      await syncQueueService.addToQueue(
        OPERATION_TYPES.CREATE,
        ENTITY_TYPES.TASK,
        localId,
        taskData
      );

      const task = await tasksSQLiteService.getTaskById(localId);
      
      return { success: true, data: task || undefined };
    } catch (error: any) {
      console.error('Error creating task:', error);
      return { success: false, error: error.message || 'Failed to create task' };
    }
  },

  updateTask: async (taskId: string, updates: UpdateTaskPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const sessionResult = await userSessionStorage.get();
      if (!sessionResult.success || !sessionResult.data) {
        return { success: false, error: 'No active session' };
      }

      const userId = sessionResult.data.id;
      await tasksSQLiteService.updateTask(taskId, updates, userId);

      await syncQueueService.addToQueue(
        OPERATION_TYPES.UPDATE,
        ENTITY_TYPES.TASK,
        taskId,
        updates
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message || 'Failed to update task' };
    }
  },

  deleteTask: async (taskId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const sessionResult = await userSessionStorage.get();
      if (!sessionResult.success || !sessionResult.data) {
        return { success: false, error: 'No active session' };
      }

      const userId = sessionResult.data.id;
      await tasksSQLiteService.deleteTask(taskId, userId);

      await syncQueueService.addToQueue(
        OPERATION_TYPES.DELETE,
        ENTITY_TYPES.TASK,
        taskId
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message || 'Failed to delete task' };
    }
  },

  getTaskById: async (taskId: string): Promise<{ success: boolean; data?: Task; error?: string }> => {
    try {
      const task = await tasksSQLiteService.getTaskById(taskId);
      if (!task) {
        return { success: false, error: 'Task not found' };
      }
      return { success: true, data: task };
    } catch (error: any) {
      console.error('Error fetching task:', error);
      return { success: false, error: error.message || 'Failed to fetch task' };
    }
  },

  mergeServerTasks: async (serverTasks: any[], userId: string): Promise<void> => {
    try {
      const localTasks = await tasksSQLiteService.getAllTasks(userId);
      const localTasksMap = new Map(localTasks.map(t => [t.server_id || t.local_id, t]));

      const tasksToInsert: Task[] = [];

      for (const serverTask of serverTasks) {
        const existingTask = localTasksMap.get(serverTask.id);
        
        if (!existingTask) {
          tasksToInsert.push({
            id: serverTask.id,
            local_id: DatabaseHelpers.generateLocalId(),
            server_id: serverTask.id,
            title: serverTask.title,
            description: serverTask.description,
            status: serverTask.status,
            priority: serverTask.priority,
            due_date: serverTask.due_date,
            tags: serverTask.tags || [],
            image_path: null,
            image_url: serverTask.image_url,
            owner_id: serverTask.owner_id,
            created_at: serverTask.created_at,
            updated_at: serverTask.updated_at,
            sync_status: 'synced',
            is_deleted: 0,
            local_updated_at: null,
            needs_sync: 0
          });
        } else if (existingTask.needs_sync === 0) {
          const serverUpdatedAt = new Date(serverTask.updated_at).getTime();
          const localUpdatedAt = new Date(existingTask.updated_at).getTime();
          
          if (serverUpdatedAt > localUpdatedAt) {
            await tasksSQLiteService.updateTask(
              existingTask.local_id,
              {
                title: serverTask.title,
                description: serverTask.description,
                status: serverTask.status,
                priority: serverTask.priority,
                due_date: serverTask.due_date,
                tags: serverTask.tags || [],
                image_url: serverTask.image_url
              },
              userId
            );
          }
        }
      }

      if (tasksToInsert.length > 0) {
        await tasksSQLiteService.bulkInsertTasks(tasksToInsert, userId);
      }
    } catch (error) {
      console.error('Error merging server tasks:', error);
    }
  }
};

