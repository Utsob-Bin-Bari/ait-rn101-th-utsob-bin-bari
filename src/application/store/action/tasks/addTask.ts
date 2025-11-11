import { Task } from '../../../services/tasks/tasksSQLiteService';

export const addTask = (task: Task) => ({
  type: 'ADD_TASK' as const,
  payload: task
});

