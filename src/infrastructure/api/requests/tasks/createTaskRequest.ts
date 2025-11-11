import useApi from '../../hooks/useApi';
import { TaskEndpoints } from '../../endpoints/TaskEndpoints';

export const createTaskRequest = async (
  taskData: any,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await useApi({
      url: TaskEndpoints.CREATE_TASK,
      method: 'POST',
      data: taskData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Create task request error:', error);

    let errorMessage = 'Failed to create task';

    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

