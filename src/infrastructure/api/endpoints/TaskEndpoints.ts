export const TaskEndpoints = {
  FETCH_TASKS: '/api/tasks',
  CREATE_TASK: '/api/tasks',
  UPDATE_TASK: (taskId: string) => `/api/tasks/${taskId}`,
  DELETE_TASK: (taskId: string) => `/api/tasks/${taskId}`,
  GET_TASK: (taskId: string) => `/api/tasks/${taskId}`,
  UPLOAD_IMAGE: '/api/images/upload'
};

