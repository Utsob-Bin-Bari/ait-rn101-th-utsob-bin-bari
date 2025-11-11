import { initialTasksState, TasksState } from '../../../domain/types/store/TasksState';

type TaskAction =
  | ReturnType<typeof import('../action/tasks/setTasks').setTasks>
  | ReturnType<typeof import('../action/tasks/addTask').addTask>
  | ReturnType<typeof import('../action/tasks/updateTask').updateTask>
  | ReturnType<typeof import('../action/tasks/removeTask').removeTask>
  | ReturnType<typeof import('../action/tasks/setTasksLoading').setTasksLoading>
  | ReturnType<typeof import('../action/tasks/setSyncStatus').setSyncStatus>;

export const tasksReducer = (
  state: TasksState = initialTasksState,
  action: TaskAction
): TasksState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [action.payload, ...state.tasks]
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.taskId || task.local_id === action.payload.taskId
            ? { ...task, ...action.payload.updates }
            : task
        )
      };

    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(
          task => task.id !== action.payload && task.local_id !== action.payload
        )
      };

    case 'SET_TASKS_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload
      };

    default:
      return state;
  }
};

