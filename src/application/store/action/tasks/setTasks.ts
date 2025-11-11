import { Task } from '../../../services/tasks/tasksSQLiteService';

export const setTasks = (tasks: Task[]) => ({
  type: 'SET_TASKS' as const,
  payload: tasks
});

