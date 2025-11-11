import { apiClient } from '../config/apiConfig';
import { AxiosRequestConfig } from 'axios';

const useApi = async (config: AxiosRequestConfig) => {
  try {
    const response = await apiClient(config);
    return response;
  } catch (error) {
    throw error;
  }
};

export default useApi;

