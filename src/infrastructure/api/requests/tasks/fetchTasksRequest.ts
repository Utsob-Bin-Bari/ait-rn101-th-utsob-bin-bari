import useApi from '../../hooks/useApi';
import { TaskEndpoints } from '../../endpoints/TaskEndpoints';

export const fetchTasksRequest = async (
  accessToken: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    tags?: string;
  }
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const response = await useApi({
      url: TaskEndpoints.FETCH_TASKS,
      method: 'GET',
      params,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return { success: true, data: response.data.tasks || response.data };
  } catch (error: any) {
    console.error('Fetch tasks request error:', error);

    let errorMessage = 'Failed to fetch tasks';

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

