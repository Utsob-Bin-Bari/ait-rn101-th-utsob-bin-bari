import axios from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:3000' 
  : 'http://localhost:3000';

console.warn('API_BASE_URL:', API_BASE_URL);
console.warn('Platform.OS:', Platform.OS);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.warn('API Request:', config.method, config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.warn('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message, error.config?.url);
    return Promise.reject(error);
  }
);

