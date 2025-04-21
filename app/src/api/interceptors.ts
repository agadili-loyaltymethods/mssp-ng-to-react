import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthHelper } from '../utils/authHelper';

// Create a function to set up the interceptors
export const setupInterceptors = (loginService: { getToken: () => Promise<string> }) => {
  // Request interceptor
  axios.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      // Get the token from AuthHelper
      const token = AuthHelper.getToken();

      // If we have a token, add it to the request
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Content-Type'] = 'application/json; charset=utf-8';
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get a new token
          const newToken = await loginService.getToken();
          
          // Update the token in storage
          AuthHelper.setToken(newToken);
          
          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the request
          return axios(originalRequest);
        } catch (refreshError) {
          // If refreshing the token fails, reject with the original error
          return Promise.reject(error);
        }
      }
      
      // Format error message
      let errorMessage = 'An error occurred';
      
      if (error.response?.data?.errors?.length) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a new error with the formatted message
      const formattedError = new Error(errorMessage);
      
      return Promise.reject(formattedError);
    }
  );
};

// Create a custom axios instance with interceptors
export const createAxiosInstance = (loginService: { getToken: () => Promise<string> }): AxiosInstance => {
  const instance = axios.create();
  
  // Request interceptor
  instance.interceptors.request.use(
    async (config: AxiosRequestConfig) => {
      // Get the token from AuthHelper
      const token = AuthHelper.getToken();

      // If we have a token, add it to the request
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['Content-Type'] = 'application/json; charset=utf-8';
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
      }
      
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      
      // If the error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get a new token
          const newToken = await loginService.getToken();
          
          // Update the token in storage
          AuthHelper.setToken(newToken);
          
          // Update the Authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Retry the request
          return instance(originalRequest);
        } catch (refreshError) {
          // If refreshing the token fails, reject with the original error
          return Promise.reject(error);
        }
      }
      
      // Format error message
      let errorMessage = 'An error occurred';
      
      if (error.response?.data?.errors?.length) {
        errorMessage = error.response.data.errors[0].message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Create a new error with the formatted message
      const formattedError = new Error(errorMessage);
      
      return Promise.reject(formattedError);
    }
  );
  
  return instance;
};
