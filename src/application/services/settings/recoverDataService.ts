import { fetchTasksRequest } from '../../../infrastructure/api/requests/tasks/fetchTasksRequest';
import { tasksSQLiteService } from '../tasks/tasksSQLiteService';
import { Task } from '../../../domain/types/tasks/TaskType';

export const recoverDataService = {
  checkBackendDataExists: async (accessToken: string): Promise<boolean> => {
    try {
      const result = await fetchTasksRequest(accessToken);
      return result.success && result.data && result.data.length > 0;
    } catch (error) {
      console.error('Error checking backend data:', error);
      return false;
    }
  },

  performRecovery: async (
    accessToken: string,
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
    recovered: {
      tasks: number;
    };
  }> => {
    try {
      const result = await fetchTasksRequest(accessToken);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || 'Failed to fetch data from server',
          recovered: { tasks: 0 }
        };
      }

      const tasksToRecover = result.data as Task[];
      
      if (tasksToRecover.length > 0) {
        await tasksSQLiteService.bulkInsertTasks(tasksToRecover, userId);
      }

      return {
        success: true,
        recovered: {
          tasks: tasksToRecover.length
        }
      };
    } catch (error: any) {
      console.error('Recovery error:', error);
      return {
        success: false,
        error: error.message || 'Recovery failed',
        recovered: { tasks: 0 }
      };
    }
  }
};

