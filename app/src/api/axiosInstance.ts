import axios from 'axios';
import { useLoginService } from '../hooks/useLoginService';
import { AuthHelper } from '../utils/authHelper';

export const createAxiosInstance = () => {
  const instance = axios.create();
  const { getToken } = useLoginService();

  instance.interceptors.request.use(
    async (config) => {
      const token = AuthHelper.getToken();
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Content-Type'] = 'application/json';
        config.headers['Accept'] = 'application/json';
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await getToken();
          AuthHelper.setToken(newToken);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          return instance(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return instance;
};
