import useApi from '../../hooks/useApi';
import { TaskEndpoints } from '../../endpoints/TaskEndpoints';

export const uploadImageRequest = async (
  imageData: { image: string; taskId: string },
  accessToken: string
): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
  try {
    const response = await useApi({
      url: TaskEndpoints.UPLOAD_IMAGE,
      method: 'POST',
      data: imageData,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Upload image request error:', error);

    let errorMessage = 'Failed to upload image';

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

