import { Task } from '../../../services/tasks/tasksSQLiteService';

export const updateTask = (taskId: string, updates: Partial<Task>) => ({
  type: 'UPDATE_TASK' as const,
  payload: { taskId, updates }
});

