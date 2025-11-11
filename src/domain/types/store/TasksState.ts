import { Task } from '../tasks/TaskType';

export interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  syncStatus: {
    isOnline: boolean;
    isSyncing: boolean;
    lastSyncAt: string | null;
    pendingCount: number;
  };
}

export const initialTasksState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  syncStatus: {
    isOnline: false,
    isSyncing: false,
    lastSyncAt: null,
    pendingCount: 0
  }
};

