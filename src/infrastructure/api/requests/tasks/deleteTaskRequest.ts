import useApi from '../../hooks/useApi';
import { TaskEndpoints } from '../../endpoints/TaskEndpoints';

export const deleteTaskRequest = async (
  taskId: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    await useApi({
      url: TaskEndpoints.DELETE_TASK(taskId),
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Delete task request error:', error);

    let errorMessage = 'Failed to delete task';

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

