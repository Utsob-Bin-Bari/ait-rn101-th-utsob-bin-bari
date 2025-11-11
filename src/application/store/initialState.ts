import { AuthState } from '../../domain/types/store/AuthState';
import { TasksState, initialTasksState } from '../../domain/types/store/TasksState';

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
};

export interface RootState {
  auth: AuthState;
  tasks: TasksState;
}

export const initialState: RootState = {
  auth: initialAuthState,
  tasks: initialTasksState
};

