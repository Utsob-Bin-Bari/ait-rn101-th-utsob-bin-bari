import useApi from '../../hooks/useApi';
import { TaskEndpoints } from '../../endpoints/TaskEndpoints';

export const updateTaskRequest = async (
  taskId: string,
  updates: any,
  accessToken: string
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await useApi({
      url: TaskEndpoints.UPDATE_TASK(taskId),
      method: 'PUT',
      data: updates,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Update task request error:', error);

    let errorMessage = 'Failed to update task';

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

